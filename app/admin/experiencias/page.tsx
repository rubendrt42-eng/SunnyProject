import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/dates";
import { categoryLabel } from "@/lib/constants";
import type { Business, Experience } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Experiencias — Sunny Admin" };

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  published: "Publicada",
  cancelled: "Cancelada",
  completed: "Finalizada",
};

const STATUS_TONE: Record<string, "neutral" | "sunny" | "success" | "danger"> = {
  draft: "neutral",
  published: "success",
  cancelled: "danger",
  completed: "neutral",
};

export default async function AdminExperienciasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("experiences")
    .select("*, business:businesses(*)")
    .order("starts_at", { ascending: false });

  const experiences = (data ?? []) as unknown as (Experience & { business: Business })[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Experiencias</h1>
        <Link href="/admin/experiencias/nueva" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          + Nueva experiencia
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Título</th>
              <th className="px-4 py-3 font-medium">Negocio</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Cupo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Destacada</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((e) => (
              <tr key={e.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/experiencias/${e.id}`} className="font-medium text-neutral-900 hover:underline">
                    {e.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{e.business?.name}</td>
                <td className="px-4 py-3 text-neutral-600">{categoryLabel(e.category)}</td>
                <td className="px-4 py-3 text-neutral-600">{formatDateShort(e.starts_at)}</td>
                <td className="px-4 py-3 text-neutral-600">{e.capacity}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-neutral-600">{e.featured ? "Sí" : "—"}</td>
              </tr>
            ))}
            {experiences.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                  Aún no hay experiencias. Crea la primera.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
