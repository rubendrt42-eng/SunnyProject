import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { Container } from "@/components/ui/Container";
import { blurProps, sanityImageUrl } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

/**
 * Capítulo 01 — el manifiesto.
 *
 * QUÉ SE QUITÓ, Y POR QUÉ ESO ES EL DISEÑO
 *
 * La versión anterior tenía siete elementos compitiendo en la primera pantalla:
 * línea de contexto, titular, frase destacada, subtítulo, botón, guía y
 * contador. Y detrás, dos degradados de color y tres arcos.
 *
 * Ahora hay cinco, y ninguno decorativo. **Se cayeron los dos degradados y los
 * arcos**: eran una fotografía que no existe, dibujada con CSS. Un degradado
 * naranja no es una imagen de una experiencia; es el hueco de la imagen pintado
 * de un color bonito, y a los tres capítulos ya se notaba que era relleno. El
 * fondo es carbón plano con el mismo grano de papel de siempre. Si el hero se
 * sostiene, se sostiene por la tipografía y por el aire.
 *
 * **El subtítulo se fue al capítulo siguiente.** No se borró: abre «Experiencias»
 * como párrafo de entrada. Así la frase que explica Sunny cruza el pliegue —
 * termina en carbón y continúa en marfil— y el hero se queda con una sola cosa
 * que decir, que es lo que le da autoridad.
 *
 * LA ESTRUCTURA
 *
 * Tres bandas y una regla. Arriba, el dato de contexto pegado al margen
 * izquierdo. En el centro óptico, el manifiesto. Abajo, una línea de un pixel
 * de lado a lado y, colgando de ella, la acción a la izquierda y el recuento a
 * la derecha. La regla no adorna: es lo que convierte tres cosas sueltas en una
 * composición, y es la única «caja» de todo el capítulo.
 *
 * LAS DOS FAMILIAS
 *
 * Manrope enuncia el hecho, en peso 500 y casi sin apretar — el peso 750 que
 * había antes es la firma de un panel de control. Newsreader en cursiva y
 * amarillo Sunny dice lo que ese hecho significa. Las dos partes vienen de
 * campos separados de Sanity; si Emmy deja la segunda vacía, el manifiesto es
 * de una sola voz y la composición no se entera.
 *
 * EL SITIO DE LA FOTOGRAFÍA
 *
 * `heroImage` ya tiene su lugar: entra a sangre completa detrás del texto, con
 * un solo velo de carbón para que el statement siga legible. No hay que
 * rehacer nada el día que Emmy suba una — el hueco está diseñado, no
 * improvisado.
 */
export function LeanHero({
  title,
  titleAccent,
  subtitle,
  experienceCount,
  image,
}: {
  title: string;
  titleAccent?: string | null;
  /** Se acepta por compatibilidad; la portada lo dibuja en el capítulo 02. */
  subtitle?: string;
  experienceCount: number;
  image?: SanityImage | null;
}) {
  const destacada = titleAccent?.trim();

  return (
    <section className="hero-exit relative isolate -mt-18 flex min-h-[100svh] flex-col overflow-clip bg-carbon">
      {image && (
        <>
          <Image
            src={sanityImageUrl(image, 1920)}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="parallax -z-20 object-cover object-[center_45%]"
            {...blurProps(image)}
          />
          {/* Un velo, no dos. Con la fotografía real el degradado sobra: lo que
              hace falta es bajar la foto lo justo para que el texto se lea. */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-carbon/60" />
        </>
      )}
      {/* Grano de papel, no degradado. Es textura de superficie: se ve igual
          con fotografía y sin ella, y no finge ser una imagen. */}
      <div aria-hidden className="hero-grain absolute inset-0 -z-10" />

      <Container className="hero-caja relative flex min-h-[100svh] flex-col justify-between pt-28 pb-8 sm:pt-32 sm:pb-10">
        <LineReveal>
          <p className="text-small tracking-[0.18em] text-warm-white/50 uppercase">Monterrey · Cada semana</p>
        </LineReveal>

        {/* El manifiesto, centrado y solo. */}
        <div className="flex flex-1 items-center justify-center py-12">
          <h1 className="manifiesto max-w-[15ch] text-center text-warm-white">
            <WordReveal as="span" text={title} className="block" />
            {destacada && (
              <WordReveal
                as="span"
                text={destacada}
                delay={0.26}
                className="manifiesto__acento mt-2 block font-serif text-sunny"
              />
            )}
          </h1>
        </div>

        {/*
          La regla y lo que cuelga de ella.

          Acción a la izquierda, dato a la derecha, separados por todo el ancho
          del contenedor. Es la estructura que sostiene el capítulo: sin la
          línea, el botón y el recuento serían dos elementos flotando en el
          borde inferior.
        */}
        <LineReveal delay={0.72}>
          <div className="border-t border-warm-white/20 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
              <Link
                href="/experiencias"
                className="hero-accion press group inline-flex min-h-11 max-w-full items-center gap-2.5 text-body font-medium"
              >
                Explorar experiencias
                <ArrowRight
                  aria-hidden
                  size={17}
                  strokeWidth={1.5}
                  className="transition-transform duration-[var(--motion-nudge)] ease-sunny group-hover:translate-x-1"
                />
              </Link>

              {experienceCount >= 3 && (
                <p className="text-small text-warm-white/55">
                  <span className="font-serif text-body-l text-warm-white">{experienceCount}</span> disponibles ahora
                </p>
              )}
            </div>
          </div>
        </LineReveal>
      </Container>
    </section>
  );
}
