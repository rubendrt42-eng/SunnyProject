"use client";

import { useRef, useState, type ReactNode } from "react";
import { CarouselDots } from "@/components/motion/CarouselDots";

/**
 * La cinta de experiencias, con el foco siempre a la vista.
 *
 * EL PROBLEMA QUE RESUELVE
 *
 * La cinta se desplaza en horizontal. Al tabular, el foco llega a la tarjeta
 * que está fuera de la zona visible y el navegador **no** desplaza el
 * contenedor para traerla: medido a 390 px, el enlace de la segunda tarjeta
 * queda entre 344 y 546 px mientras la cinta solo enseña de 0 a 390. O sea,
 * 156 px fuera de pantalla, con el anillo de foco invisible.
 *
 * Quien navega con teclado pierde por completo dónde está. Es un fallo de
 * «foco visible», y lo introduje yo al convertir la rejilla en cinta.
 *
 * Se comprobó que no es culpa de los imanes de posición (pasa igual con
 * `mandatory`, con `proximity` y sin ninguno) ni de la capa que estira el área
 * de clic (pasa con ella y sin ella). `scrollIntoView` sí funciona; lo que no
 * ocurre es el desplazamiento automático al recibir el foco.
 *
 * POR QUÉ ESTO Y NO MÁS
 *
 * Son cinco líneas y no cambian nada de lo que se ve con ratón o con el dedo:
 * el arrastre, el impulso y los imanes siguen siendo del navegador. Solo se
 * añade lo único que el navegador no estaba haciendo. Si algún día lo hace
 * nativamente, esto se vuelve redundante y no molesta: `scrollIntoView` sobre
 * algo ya visible no mueve nada.
 */
/**
 * Los puntos de posición (ver `CarouselDots`) se muestran **solo en móvil** y
 * **solo a partir de tres tarjetas**.
 *
 * De `sm` en adelante esto deja de ser una cinta y pasa a ser rejilla: todas
 * las tarjetas están a la vista y unos puntos ahí no indicarían nada. Y con dos
 * tarjetas el trozo que asoma ya lo cuenta todo; dos puntos serían adorno.
 *
 * El índice activo se calcula desde el scroll real del contenedor, no se
 * gobierna desde React: quien manda sigue siendo el arrastre del dedo. Los
 * puntos solo lo leen, y al pulsarlos devuelven la orden al mismo scroll.
 */
export function Cinta({
  className,
  children,
  puntos = 0,
}: {
  className: string;
  children: ReactNode;
  /**
   * Cuántos puntos dibujar. `0` los apaga.
   *
   * Se pasa el número y no un booleano a propósito: contar los `children` desde
   * aquí obliga a suponer que vienen como arreglo, y eso deja de ser cierto en
   * cuanto alguien envuelva la lista. Quien construye la cinta ya sabe cuántas
   * tarjetas puso.
   */
  puntos?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [activo, setActivo] = useState(0);
  const pendiente = useRef(false);

  /** La tarjeta cuyo centro está más cerca del centro de la ventana de la cinta. */
  const recalcular = () => {
    const cinta = ref.current;
    if (!cinta) return;
    const tarjetas = [...cinta.children] as HTMLElement[];
    if (tarjetas.length === 0) return;

    const centro = cinta.scrollLeft + cinta.clientWidth / 2;
    let mejor = 0;
    let distancia = Infinity;
    tarjetas.forEach((tarjeta, i) => {
      const d = Math.abs(tarjeta.offsetLeft + tarjeta.offsetWidth / 2 - centro);
      if (d < distancia) {
        distancia = d;
        mejor = i;
      }
    });
    setActivo(mejor);
  };

  const irA = (i: number) => {
    const cinta = ref.current;
    if (!cinta) return;
    const tarjeta = cinta.children[i] as HTMLElement | undefined;
    tarjeta?.scrollIntoView({
      inline: "center",
      // `nearest` para que llevar la cinta a un lado no arrastre la página
      // entera hacia arriba o hacia abajo.
      block: "nearest",
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const carril = (
    <div
      ref={ref}
      className={className}
      onScroll={() => {
        // El scroll dispara decenas de eventos por gesto. Se atiende uno por
        // fotograma: suficiente para que el punto siga al dedo, y sin poner
        // trabajo de React en medio de la animación de arrastre.
        if (pendiente.current) return;
        pendiente.current = true;
        requestAnimationFrame(() => {
          pendiente.current = false;
          recalcular();
        });
      }}
      onFocus={(event) => {
        const cinta = ref.current;
        if (!cinta) return;

        // `focus` no burbujea, pero React lo entrega como `focusin`, así que
        // aquí llegan también los enlaces de dentro de cada tarjeta.
        const objetivo = (event.target as HTMLElement).closest("article") ?? (event.target as HTMLElement);
        const caja = objetivo.getBoundingClientRect();
        const marco = cinta.getBoundingClientRect();
        const fuera = caja.left < marco.left - 1 || caja.right > marco.right + 1;
        if (!fuera) return;

        objetivo.scrollIntoView({
          inline: "nearest",
          block: "nearest",
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }}
    >
      {children}
    </div>
  );

  if (puntos < 2) return carril;

  return (
    <>
      {carril}
      {/* `sm:hidden` es la mitad que importa: de ahí en adelante la cinta ya no
          existe —es una rejilla— y unos puntos no indicarían nada. */}
      <CarouselDots className="mt-4 sm:hidden" count={puntos} activeIndex={activo} onSelect={irA} />
    </>
  );
}
