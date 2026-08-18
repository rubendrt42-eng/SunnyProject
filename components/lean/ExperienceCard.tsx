import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { BrandCanvas } from "@/components/lean/BrandCanvas";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { HoverLift } from "@/components/motion/HoverLift";
import { formatDateShort, formatTime } from "@/lib/dates";
import { blurProps, sanityImageUrl } from "@/lib/sanity/image";
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
          <div className="relative aspect-4/5 w-full overflow-clip bg-carbon/5">
            {experience.image ? (
              <Image
                src={sanityImageUrl(experience.image, 800)}
                alt={experience.image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                /* `parallax` mueve la fotografía un poco más despacio que la
                   tarjeta al hacer scroll; el zoom al pasar el cursor sigue
                   siendo el de siempre. Los dos viven en el elemento interior,
                   nunca en el contenedor, para que el recorte los absorba. */
                className="parallax object-cover transition-transform duration-[var(--motion-enter)] ease-sunny group-hover:scale-[1.04]"
                {...blurProps(experience.image)}
              />
            ) : (
              /* Sin fotografía se dibuja el lienzo de marca, no un aviso de
                 error. Ver `BrandCanvas`: la ausencia de foto es un hecho de
                 esta etapa y tiene que parecer una decisión de diseño. */
              <BrandCanvas seed={experience.title} className="parallax h-full w-full" />
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
