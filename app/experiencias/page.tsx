import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase/server";
import { getPublicExperiences } from "@/lib/queries";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { Container } from "@/components/ui/Container";
import { CATEGORIES } from "@/lib/constants";
import { computeExperienceState } from "@/lib/experience-status";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Experiencias — Sunny Project" };

type Availability = "todas" | "disponibles" | "agotadas";

export default async function ExperienciasPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; disponibilidad?: Availability }>;
}) {
  const { categoria, disponibilidad } = await searchParams;

  const supabase = await createClient();
  const experiences = await getPublicExperiences(supabase);

  const filtered = experiences.filter((e) => {
    if (categoria && e.category !== categoria) return false;
    if (disponibilidad && disponibilidad !== "todas") {
      const state = computeExperienceState(e, e.reserved_count);
      if (disponibilidad === "disponibles" && !(state === "available" || state === "low")) return false;
      if (disponibilidad === "agotadas" && state !== "sold_out") return false;
    }
    return true;
  });

  const categoryFilters: { value: string; label: string }[] = [{ value: "", label: "Todas" }, ...CATEGORIES];
  const availabilityFilters: { value: Availability; label: string }[] = [
    { value: "todas", label: "Todas" },
    { value: "disponibles", label: "Disponibles" },
    { value: "agotadas", label: "Agotadas" },
  ];

  function buildHref(next: { categoria?: string; disponibilidad?: string }) {
    const params = new URLSearchParams();
    const c = next.categoria ?? categoria;
    const d = next.disponibilidad ?? disponibilidad;
    if (c) params.set("categoria", c);
    if (d && d !== "todas") params.set("disponibilidad", d);
    const qs = params.toString();
    return qs ? `/experiencias?${qs}` : "/experiencias";
  }

  return (
    <main className="py-14 sm:py-20">
      <Container>
        <h1 className="font-serif text-4xl italic">Experiencias</h1>
        <p className="mt-2 max-w-xl text-gray">
          Explora experiencias curadas de wellness, movimiento, cafés, outdoor y comunidad en Monterrey.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <nav aria-label="Filtrar por categoría" className="flex flex-wrap gap-2">
            {categoryFilters.map((c) => (
              <Link
                key={c.value || "todas"}
                href={buildHref({ categoria: c.value })}
                aria-current={categoria === c.value || (!categoria && !c.value) ? "true" : undefined}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium",
                  (categoria ?? "") === c.value ? "border-carbon bg-carbon text-warm-white" : "border-carbon/15 hover:border-carbon",
                )}
              >
                {c.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Filtrar por disponibilidad" className="flex flex-wrap gap-2">
            {availabilityFilters.map((a) => (
              <Link
                key={a.value}
                href={buildHref({ disponibilidad: a.value })}
                aria-current={(disponibilidad ?? "todas") === a.value ? "true" : undefined}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm",
                  (disponibilidad ?? "todas") === a.value ? "border-orange text-orange" : "border-carbon/15 text-gray hover:border-carbon",
                )}
              >
                {a.label}
              </Link>
            ))}
          </nav>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        ) : (
          <div className="mt-16 rounded-2xl border border-dashed border-carbon/20 p-12 text-center">
            <p className="font-serif text-2xl italic">Sin resultados</p>
            <p className="mt-2 text-gray">
              No encontramos experiencias con esos filtros.{" "}
              <Link href="/experiencias" className="text-orange hover:underline">
                Ver todas las experiencias
              </Link>
              .
            </p>
          </div>
        )}
      </Container>
    </main>
  );
}
