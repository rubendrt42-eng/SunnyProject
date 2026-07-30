import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

/**
 * Access is enforced here on the server, on every request, for every route
 * under /admin — not by hiding links. `requireAdmin()` reads the session and
 * the profile role server-side; a normal user who types /admin, or who
 * guesses an admin URL, is redirected. Row Level Security in Supabase is the
 * second line: even with a forged request the database refuses admin reads.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/acceso?next=/admin");

  // The one badge in the navigation. Cheap (`head` + count, no rows) and it
  // surfaces the thing most likely to be forgotten.
  const supabase = await createClient();
  const { count } = await supabase
    .from("partner_leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="flex flex-1 flex-col bg-neutral-100 text-neutral-900 lg:flex-row">
      <aside className="border-b border-neutral-200 bg-white p-4 lg:sticky lg:top-18 lg:h-[calc(100svh-4.5rem)] lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <AdminNav newLeads={count ?? 0} />
      </aside>
      <div className="min-w-0 flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}
