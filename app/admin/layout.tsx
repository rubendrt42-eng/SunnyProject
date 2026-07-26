import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/experiencias", label: "Experiencias" },
  { href: "/admin/negocios", label: "Negocios" },
  { href: "/admin/reservaciones", label: "Reservaciones" },
  { href: "/admin/solicitudes", label: "Solicitudes" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/acceso?next=/admin");

  return (
    <div className="flex flex-1 flex-col bg-neutral-100 text-neutral-900 lg:flex-row">
      <aside className="border-b border-neutral-200 bg-white p-4 lg:w-56 lg:border-b-0 lg:border-r">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Sunny Admin</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-neutral-200 px-2 pt-4 text-xs text-neutral-500">
          <Link href="/" className="hover:underline">
            ← Volver al sitio
          </Link>
        </div>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
