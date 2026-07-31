import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateExperienceAction } from "@/lib/actions/admin";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { ExperienceActions } from "@/components/admin/ExperienceActions";
import type { ActionResult } from "@/lib/actions/profile";
import type { Business, Experience } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar experiencia — Sunny Admin" };

export default async function EditExperienciaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: experience }, { data: businesses }, { data: confirmadas }] = await Promise.all([
    supabase.from("experiences").select("*").eq("id", id).maybeSingle(),
    supabase.from("businesses").select("*").order("name"),
    // Cuántas personas pierden su lugar si se cancela. El diálogo de
    // confirmación necesita el número: "se cancelarán 8 reservaciones" hace
    // dudar; una frase genérica se descarta sin leer.
    supabase.from("reservations").select("party_size").eq("experience_id", id).eq("status", "confirmed"),
  ]);

  if (!experience) notFound();

  const afectados = (confirmadas ?? []).reduce(
    (total, r) => total + ((r as { party_size?: number | null }).party_size ?? 1),
    0,
  );

  async function action(prev: ActionResult, formData: FormData) {
    "use server";
    return updateExperienceAction(id, prev, formData);
  }

  return (
    <div>
      <h1 className="text-subtitle">{(experience as Experience).title}</h1>

      <div className="mt-4">
        <ExperienceActions experience={experience as Experience} affectedPeople={afectados} />
      </div>

      <div className="mt-8">
        <ExperienceForm
          action={action}
          businesses={(businesses ?? []) as Business[]}
          experience={experience as Experience}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
