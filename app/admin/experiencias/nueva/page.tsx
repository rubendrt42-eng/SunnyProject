import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createExperienceAction } from "@/lib/actions/admin";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import type { Business } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Nueva experiencia — Sunny Admin" };

export default async function NuevaExperienciaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("*").order("name");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Nueva experiencia</h1>
      <div className="mt-6">
        <ExperienceForm action={createExperienceAction} businesses={(data ?? []) as Business[]} submitLabel="Crear experiencia" />
      </div>
    </div>
  );
}
