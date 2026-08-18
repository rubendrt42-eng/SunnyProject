"use client";

import { useRef, type ReactNode } from "react";

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
export function Cinta({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={className}
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
}
