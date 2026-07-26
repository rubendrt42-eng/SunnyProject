import type { Metadata } from "next";
import { createBusinessAction } from "@/lib/actions/admin";
import { BusinessForm } from "@/components/admin/BusinessForm";

export const metadata: Metadata = { title: "Nuevo negocio — Sunny Admin" };

export default function NuevoNegocioPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Nuevo negocio</h1>
      <div className="mt-6">
        <BusinessForm action={createBusinessAction} submitLabel="Crear negocio" />
      </div>
    </div>
  );
}
