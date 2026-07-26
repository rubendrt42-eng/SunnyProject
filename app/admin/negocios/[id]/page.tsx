import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBusinessAction } from "@/lib/actions/admin";
import { BusinessForm } from "@/components/admin/BusinessForm";
import type { ActionResult } from "@/lib/actions/profile";
import type { Business } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Editar negocio — Sunny Admin" };

export default async function EditNegocioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("*").eq("id", id).maybeSingle();

  if (!business) notFound();

  async function action(prev: ActionResult, formData: FormData) {
    "use server";
    return updateBusinessAction(id, prev, formData);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">{(business as Business).name}</h1>
      <div className="mt-6">
        <BusinessForm action={action} business={business as Business} submitLabel="Guardar cambios" />
      </div>
    </div>
  );
}
