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

  const [{ data: experience }, { data: businesses }] = await Promise.all([
    supabase.from("experiences").select("*").eq("id", id).maybeSingle(),
    supabase.from("businesses").select("*").order("name"),
  ]);

  if (!experience) notFound();

  async function action(prev: ActionResult, formData: FormData) {
    "use server";
    return updateExperienceAction(id, prev, formData);
  }

  return (
    <div>
      <h1 className="text-subtitle">{(experience as Experience).title}</h1>

      <div className="mt-4">
        <ExperienceActions experience={experience as Experience} />
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
