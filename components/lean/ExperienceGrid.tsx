import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { ExperienceCard } from "@/components/lean/ExperienceCard";
import { InViewReveal } from "@/components/motion/InViewReveal";
import type { ExperienceCardData } from "@/lib/sanity/types";

/**
 * La rejilla de experiencias, con su estado vacío.
 *
 * El estado vacío no es un detalle: es lo que la gente va a ver la primera
 * semana, y cada vez que pase un tiempo sin que Emmy publique nada. Tiene que
 * verse como una sección diseñada y no como un error ni como un hueco — de ahí
 * el marco, el icono y un texto que dice qué hacer en vez de disculparse.
 */
export function ExperienceGrid({
  experiences,
  emptyHref = "/para-negocios",
}: {
  experiences: ExperienceCardData[];
  emptyHref?: string;
}) {
  if (experiences.length === 0) {
    return (
      <InViewReveal>
        <div className="rounded-xl border border-carbon/10 bg-warm-white px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-sunny/30">
            <CalendarDays aria-hidden size={22} strokeWidth={1.75} className="text-carbon" />
          </span>
          <h3 className="mt-5 text-subtitle">Próximamente nuevas experiencias</h3>
          <p className="mx-auto mt-2 max-w-md text-body text-gray">
            Estamos cerrando las próximas fechas con los espacios aliados. Vuelve en unos días.
          </p>
          <Link
            href={emptyHref}
            className="mt-5 inline-block text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
          >
            ¿Tienes un espacio y quieres crear una experiencia?
          </Link>
        </div>
      </InViewReveal>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {experiences.map((experience) => (
        <ExperienceCard key={experience._id} experience={experience} />
      ))}
    </div>
  );
}
