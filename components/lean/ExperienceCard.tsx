import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BrandCanvas } from "@/components/lean/BrandCanvas";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { HoverLift } from "@/components/motion/HoverLift";
import { formatDateShort, formatTime } from "@/lib/dates";
import { blurProps } from "@/lib/sanity/image";
import { sanityLoader } from "@/lib/sanity/loader";
import type { ExperienceCardData } from "@/lib/sanity/types";

/**
 * Tarjeta de experiencia del MVP lean.
 *
 * Conserva a propósito la composición, los radios, las animaciones y el
 * comportamiento de la tarjeta de la versión avanzada: fotografía arriba en
 * proporción 4:5, texto debajo y no encima, revelado al entrar en pantalla,
 * elevación al pasar el cursor y un zoom mínimo en la imagen. Lo único que
 * cambia es de dónde vienen los datos y qué se puede hacer con ella.
 *
 * QUÉ SE QUITÓ Y POR QUÉ
 *
 * - **Los lugares disponibles.** No hay control automático de cupo en esta
 *   etapa, así que un número sería inventado. La insignia dice «Disponible» o
 *   «Agotada», que es lo único que se sabe con certeza.
 * - **Vista rápida.** Dependía del panel lateral y de la lógica de reserva.
 * - **Categoría, modos sociales y sello Original.** No existen en el esquema
 *   de Sanity; añadirlos sería pedirle a Emmy que llene campos que no usa.
 *
 * Es un componente de servidor: no necesita estado ni eventos. Eso quita
 * JavaScript del navegador en el elemento que más se repite del sitio.
 */
export function ExperienceCard({ experience }: { experience: ExperienceCardData }) {
  const agotada = experience.status === "sold_out";

  return (
    <InViewReveal variant="media">
      <HoverLift lift={4}>
        <article className="group relative flex h-full flex-col overflow-clip rounded-xl border border-carbon/10 bg-warm-white transition-shadow duration-[var(--motion-lift)] ease-sunny hover:shadow-[0_18px_40px_-18px_rgba(23,23,20,0.35)]">
          {/*
            `overflow-clip` Y NO `overflow-hidden`

            `overflow: hidden` convierte esta caja en contenedor de scroll, y
            `animation-timeline: view()` se mide contra el contenedor de scroll
            más cercano. Con `hidden`, el `parallax` de la fotografía se medía
            contra una caja que nunca se desplaza: se quedaba clavado en la
            mitad de su recorrido y no se movía nunca. Medido, no supuesto — la
            animación se reportaba viva con el tiempo fijo en 50%.

            `overflow: clip` recorta igual, respeta el redondeo y no crea
            contenedor de scroll.
          */}
          {/*
            LA PROPORCIÓN DEPENDE DE SI HAY FOTOGRAFÍA

            Con fotografía real, el formato vertical 4:5 es el correcto: la foto
            es el argumento de la tarjeta y merece el espacio.

            Sin fotografía, ese mismo 4:5 convertía un degradado que no dice
            nada en el 85% de la tarjeta — cuatro veces en la misma portada. Era
            el elemento más grande y más llamativo de la página, repetido, y
            vacío de contenido: justo lo que hace que un sitio parezca generado.

            Sin foto la banda se queda en una franja y **manda el texto**, que en
            esta etapa es lo único que tiene algo real que decir. Dentro de la
            franja va el día en serif: un dato verdadero, útil para escanear, y
            un recurso editorial que ningún degradado puede imitar.
          */}
          <div
            className={
              experience.image
                ? "relative aspect-4/5 w-full overflow-clip bg-carbon/5"
                : "relative aspect-16/6 w-full overflow-clip bg-carbon/5"
            }
          >
            {experience.image ? (
              /*
                DOS CAPAS, NO UNA

                El envoltorio lleva el `parallax` y la imagen lleva el realce
                del cursor. Tienen que ir separados: una animación de CSS gana
                a una declaración normal sobre la misma propiedad, así que con
                los dos en el mismo elemento el `transform` del parallax
                anulaba el del hover y el acercamiento no ocurría nunca.
              */
              <div className="parallax absolute inset-0">
                <Image
                  src={experience.image.url}
                  loader={sanityLoader}
                  alt={experience.image.alt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="media-hover object-cover"
                  {...blurProps(experience.image)}
                />
              </div>
            ) : (
              <>
                <BrandCanvas seed={experience.title} className="parallax h-full w-full" />
                <div className="absolute inset-0 flex items-end justify-between gap-3 p-5">
                  <p className="font-serif text-3xl leading-none text-carbon/80 italic sm:text-4xl">
                    {formatDateShort(experience.startDateTime).replace(/\s\d{4}$/, "")}
                  </p>
                  <p className="tabular pb-1 text-label text-carbon/55">
                    {formatTime(experience.startDateTime)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            {/*
              JERARQUÍA, NO CINCO RENGLONES IGUALES

              Antes esto era insignia, título, anfitrión, descripción y tres
              datos en gris — todo del mismo peso y del mismo tamaño, así que el
              ojo no sabía por dónde entrar y el bloque entero se leía como un
              párrafo. Ahora hay tres niveles claros: el título manda, el
              anfitrión lo acompaña en serif, y los datos prácticos viven en una
              línea propia separada por una regla.
            */}
            <div className="flex items-center gap-2">
              <Badge tone={agotada ? "neutral" : "success"} className="w-fit">
                {agotada ? "Agotada" : "Disponible"}
              </Badge>
            </div>

            <h3 className="mt-3 text-heading text-balance">
              <Link href={`/experiencias/${experience.slug}`} className="hover:underline">
                {/* Área de clic extendida: toda la tarjeta lleva al detalle. */}
                <span className="absolute inset-0" aria-hidden />
                {experience.title}
              </Link>
            </h3>

            {/* El anfitrión en serif itálica. Es quien imparte la experiencia y
                merece una voz distinta de la del dato práctico — y de paso pone
                a trabajar la serif, que estaba usada en dos frases de todo el
                sitio. */}
            {experience.hostName && (
              <p className="mt-1.5 font-serif text-body text-orange-ink italic">{experience.hostName}</p>
            )}

            <p className="mt-3 text-small text-carbon/75">{experience.shortDescription}</p>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-carbon/10 pt-4">
              <div className="min-w-0">
                <p className="tabular text-small font-medium text-carbon">
                  {formatDateShort(experience.startDateTime)} · {formatTime(experience.startDateTime)}
                </p>
                <p className="truncate text-small text-gray">{experience.locationName}</p>
              </div>
              {/* La flecha dice a dónde lleva la tarjeta. La versión avanzada la
                  tenía y se perdió; sin ella la tarjeta se eleva al pasar el
                  cursor pero no señala ningún destino. */}
              <ArrowRight
                aria-hidden
                size={18}
                strokeWidth={1.75}
                className="shrink-0 text-carbon/35 transition-transform duration-[var(--motion-nudge)] ease-sunny group-hover:translate-x-1 group-hover:text-carbon"
              />
            </div>
          </div>
        </article>
      </HoverLift>
    </InViewReveal>
  );
}
