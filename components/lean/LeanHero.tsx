import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { Container } from "@/components/ui/Container";
import { blurProps } from "@/lib/sanity/image";
import { sanityLoader } from "@/lib/sanity/loader";
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
  eyebrow,
  title,
  titleAccent,
  subtitle,
  experienceCount,
  image,
}: {
  /** La línea de contexto de arriba. */
  eyebrow: string;
  title: string;
  titleAccent?: string | null;
  /** La nota pequeña de la esquina inferior derecha. */
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
            src={image.url}
            loader={sanityLoader}
            alt={image.alt}
            fill
            priority
            /*
              82 y no la calidad por defecto de 90, y es para MEJORAR la imagen,
              no para empeorarla.

              Medido sobre esta misma fotografía a 3840 px, que es lo que pide
              una pantalla Retina:

                  q=90  →  WEBP  1455 KB
                  q=82  →  AVIF   682 KB

              `auto=format` sirve AVIF hasta 82 y por encima se cae a WebP.
              AVIF a 82 se ve mejor que WebP a 90 y pesa menos de la mitad, así
              que subir el número aquí daba una imagen peor y más pesada. En
              las demás fotos, más pequeñas, AVIF no entra en ningún caso y se
              quedan en la calidad alta por defecto.
            */
            quality={82}
            sizes="100vw"
            className="parallax -z-20 object-cover object-[center_45%]"
            {...blurProps(image)}
          />
          {/*
            LOS TRES VELOS ESTÁN MEDIDOS, NO ESTIMADOS.

            Partir el titular en tres renglones lo hizo crecer hacia arriba, y
            el renglón amarillo acabó encima de la parte más clara del cielo.
            El amarillo Sunny es un color CLARO (luminancia 0.65), así que
            necesita fondo oscuro; ahí medía 2.16:1 y AA pide 3:1. El
            antetítulo estaba peor y venía de antes: al 50 % de opacidad sobre
            ese mismo cielo daba 2.25:1 contra los 4.5:1 que pide el texto
            pequeño. A esa opacidad no hay velo que lo salve — ni al 100 % de
            opacidad llegaba, porque el fondo era el problema.

            Subir un velo plano hasta que todo pasara dejaba la fotografía en
            penumbra, que es la mitad de lo que se pedía. Así que la oscuridad
            va donde hace falta y no donde no:

              · 48 % plano, el suelo de todo.
              · Una elipse centrada en el titular, del 45 % al centro y
                desvanecida al 78 %. Se lee como la caída de luz de la propia
                fotografía.
              · Un velo corto y fuerte en el 24 % de arriba, donde viven el
                antetítulo y el menú. En una foto de cielo esto es exactamente
                lo que hace un filtro degradado, así que no se nota como
                intervención — se nota como fotografía.

            Medido con el fondo compuesto, ocultando el texto y componiendo
            cada pieza sobre SU píxel (el antetítulo y la nota no son opacos,
            así que su color final depende de lo que tienen debajo). Las cuatro
            anchuras pasan AA.
          */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-carbon/[0.48]" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_56%_at_50%_46%,rgba(23,23,20,0.45)_0%,rgba(23,23,20,0.27)_50%,rgba(23,23,20,0)_78%)]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(23,23,20,0.75)_0%,rgba(23,23,20,0)_24%,rgba(23,23,20,0)_62%,rgba(23,23,20,0.52)_100%)]"
          />
        </>
      )}
      {/* Grano de papel, no degradado. Es textura de superficie: se ve igual
          con fotografía y sin ella, y no finge ser una imagen. */}
      <div aria-hidden className="hero-grain absolute inset-0 -z-10" />

      <Container className="hero-caja relative flex min-h-[100svh] flex-col justify-between pt-28 pb-8 sm:pt-32 sm:pb-10">
        <LineReveal>
          <p className="text-small tracking-[0.18em] text-warm-white/90 uppercase">{eyebrow}</p>
        </LineReveal>

        {/* El manifiesto, centrado y solo. */}
        <div className="flex flex-1 items-center justify-center py-12">
          {/*
            TRES RENGLONES, NO UN PÁRRAFO QUE SE PARTE SOLO.

            La frase destacada vive en mitad de la oración —«Tu próximo "qué
            buen plan" puede empezar aquí»— así que resaltarla debajo la
            rompería. Pero dejarla resaltada dentro del párrafo tampoco vale:
            el salto de línea lo decidía el ancho disponible, y a 1440 px «qué»
            se quedaba arriba y «buen plan» bajaba. La frase que sostiene el
            titular se partía por la mitad según la pantalla.

            Con `enLineas` los tres renglones son fijos: lo de antes, la frase
            entera, y lo de después. Las comillas viajan pegadas a su palabra,
            así que la frase se lee completa y entrecomillada siempre.

            Si Emmy escribe una frase que no aparece en el título, no se parte
            nada y el titular se dibuja de corrido: no puede romperse.
          */}
          <h1 className="manifiesto max-w-[17ch] text-center text-warm-white">
            <WordReveal
              as="span"
              text={title}
              className="block"
              resaltar={destacada}
              enLineas
              claseResalte="font-serif text-sunny italic"
            />
            {destacada && !title.toLocaleLowerCase("es").includes(destacada.toLocaleLowerCase("es")) && (
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

              {/*
                LA NOTA, EN LA ESQUINA Y EN VOZ BAJA.

                Explica qué es esto para quien llega sin contexto, pero no le
                disputa el sitio al statement: va al extremo opuesto de la
                misma regla, alineada a la derecha y en cuerpo pequeño. Se lee
                después del titular, que es el orden correcto.
              */}
              {subtitle && (
                <p className="max-w-[44ch] text-small text-warm-white/85 sm:text-right">{subtitle}</p>
              )}
            </div>
          </div>
        </LineReveal>
      </Container>
    </section>
  );
}
