import Image from "next/image";
import Link from "next/link";
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
    <InViewReveal>
      <HoverLift lift={3}>
        <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-carbon/10 bg-warm-white transition-shadow hover:shadow-lg">
          <div className="relative aspect-4/5 w-full overflow-hidden bg-carbon/5">
            {experience.image ? (
              <Image
                src={sanityImageUrl(experience.image, 800)}
                alt={experience.image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-[var(--motion-enter)] ease-sunny group-hover:scale-[1.02]"
                {...blurProps(experience.image)}
              />
            ) : (
              /* Sin fotografía se dibuja el lienzo de marca, no un aviso de
                 error. Ver `BrandCanvas`: la ausencia de foto es un hecho de
                 esta etapa y tiene que parecer una decisión de diseño. */
              <BrandCanvas seed={experience.title} className="h-full w-full" />
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-5">
            <Badge tone={agotada ? "neutral" : "success"} className="w-fit">
              {agotada ? "Agotada" : "Disponible"}
            </Badge>

            <h3 className="text-heading">
              <Link href={`/experiencias/${experience.slug}`} className="hover:underline">
                {/* Área de clic extendida: toda la tarjeta lleva al detalle. */}
                <span className="absolute inset-0" aria-hidden />
                {experience.title}
              </Link>
            </h3>

            {experience.hostName && <p className="text-small text-gray">{experience.hostName}</p>}

            <p className="text-small text-carbon/80">{experience.shortDescription}</p>

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-small text-gray">
              <span>{formatDateShort(experience.startDateTime)}</span>
              <span>{formatTime(experience.startDateTime)}</span>
              <span>{experience.locationName}</span>
            </div>
          </div>
        </article>
      </HoverLift>
    </InViewReveal>
  );
}
