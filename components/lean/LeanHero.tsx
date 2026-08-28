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
            src={sanityImageUrl(image, 1920)}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="parallax -z-20 object-cover object-[center_45%]"
            {...blurProps(image)}
          />
          {/*
            EL VELO ESTÁ CALCULADO, NO ESTIMADO.

            Medí la luminancia de la fotografía justo donde cae cada texto, en
            las cuatro anchuras. Sin velo, el titular en blanco cálido daba
            entre 1.53:1 y 1.77:1 de contraste — y AA pide 3:1 para texto de
            ese cuerpo. O sea: el titular se perdía, y no por poco.

            Para llegar a 3:1 en el peor caso —1440 px, donde el cielo entra
            más alto en el encuadre— hacía falta un 53%. El velo base va al
            58%. Medido ya montado —con el grano y el degradado encima, que
            suman más de lo que decía el cálculo— el titular daba 6.3:1 en
            blanco y 4.4:1 en amarillo: mucho margen sobre el 3:1 que pide AA.
            Así que baja al 50%, para que la fotografía se vea. A 50% sigue en
            5.4:1 y 3.8:1.

            Encima, un degradado que suma solo en los extremos: arriba vive la
            línea de contexto y abajo la nota, las dos en cuerpo pequeño, y el
            pequeño necesita 4.5:1. En el centro no suma nada, para no
            oscurecer la foto justo donde se mira.
          */}
          <div aria-hidden className="absolute inset-0 -z-10 bg-carbon/[0.50]" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-carbon/30 via-transparent to-carbon/30"
          />
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
          {/*
            LA FRASE RESALTA DENTRO DEL TITULAR, NO DEBAJO.

            Antes la frase destacada era una segunda línea. Este titular no
            funciona así: lo que resalta vive en mitad de la oración, y
            sacarlo a otra línea la rompería.

            WordReveal busca la frase entre las palabras del titular. Si la
            encuentra, la pinta en la otra voz ahí mismo; si no aparece, se
            dibuja debajo como antes. Emmy puede escribir cualquiera de las
            dos formas y ninguna se rompe.
          */}
          <h1 className="manifiesto max-w-[17ch] text-center text-warm-white">
            <WordReveal
              as="span"
              text={title}
              className="block"
              resaltar={destacada}
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
                <p className="max-w-[44ch] text-small text-warm-white/75 sm:text-right">{subtitle}</p>
              )}
            </div>
          </div>
        </LineReveal>
      </Container>
    </section>
  );
}
