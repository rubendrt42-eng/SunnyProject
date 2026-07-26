import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { categoryLabel } from "@/lib/constants";
import type { Business } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Negocios — Sunny Admin" };

export default async function AdminNegociosPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("businesses").select("*").order("name");
  const businesses = (data ?? []) as Business[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Negocios</h1>
        <Link href="/admin/negocios/nuevo" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          + Nuevo negocio
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/negocios/${b.id}`} className="font-medium text-neutral-900 hover:underline">
                    {b.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{categoryLabel(b.category)}</td>
                <td className="px-4 py-3 text-neutral-600">{b.contact_name || "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={b.active ? "success" : "neutral"}>{b.active ? "Activo" : "Inactivo"}</Badge>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  Aún no hay negocios. Crea el primero.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
