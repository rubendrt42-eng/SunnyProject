import Link from "next/link";
import { setExperienceStatusAction, toggleFeaturedAction, duplicateExperienceAction } from "@/lib/actions/admin";
import { CancelExperienceButton } from "@/components/admin/CancelExperienceButton";
import type { Experience } from "@/lib/database.types";

export function ExperienceActions({ experience }: { experience: Experience }) {
  const publish = setExperienceStatusAction.bind(null, experience.id, "published");
  const unpublish = setExperienceStatusAction.bind(null, experience.id, "draft");
  const toggleFeatured = toggleFeaturedAction.bind(null, experience.id, !experience.featured);
  const duplicate = duplicateExperienceAction.bind(null, experience.id);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
      {experience.status !== "published" && experience.status !== "cancelled" && (
        <form action={publish}>
          <button type="submit" className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white">
            Publicar
          </button>
        </form>
      )}
      {experience.status === "published" && (
        <form action={unpublish}>
          <button type="submit" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700">
            Despublicar
          </button>
        </form>
      )}
      <form action={toggleFeatured}>
        <button type="submit" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700">
          {experience.featured ? "Quitar de destacadas" : "Marcar como destacada"}
        </button>
      </form>
      <form action={duplicate}>
        <button type="submit" className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700">
          Duplicar
        </button>
      </form>
      <Link
        href={`/experiencias/${experience.slug}`}
        target="_blank"
        className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
      >
        Vista previa
      </Link>
      {experience.status !== "cancelled" && (
        <CancelExperienceButton experienceId={experience.id} />
      )}
    </div>
  );
}
