"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ArrowLeft, Building2, CalendarDays, Inbox, LayoutDashboard, Ticket, Users } from "lucide-react";
import { NavPending } from "@/components/admin/NavPending";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/experiencias", label: "Experiencias", icon: CalendarDays },
  { href: "/admin/reservaciones", label: "Reservaciones", icon: Ticket },
  { href: "/admin/negocios", label: "Negocios", icon: Building2 },
  { href: "/admin/solicitudes", label: "Solicitudes", icon: Inbox },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
] as const;

/**
 * Panel navigation: a fixed sidebar from lg: up, a horizontally scrollable
 * row below that. The active item is marked with both a background and
 * `aria-current`, so the current section is not communicated by colour
 * alone.
 *
 * `newLeads` puts the one genuinely time-sensitive number in the
 * navigation itself — a business waiting for a reply is the thing most
 * likely to be missed.
 */
export function AdminNav({ newLeads }: { newLeads: number }) {
  const pathname = usePathname();

  return (
    <>
      <p className="hidden px-2 text-label text-neutral-500 lg:block">Sunny Admin</p>

      <nav aria-label="Panel" className="no-scrollbar mt-0 flex gap-1 overflow-x-auto lg:mt-4 lg:flex-col">
        {NAV.map((item) => {
          // Exact match for the dashboard, prefix match elsewhere, so
          // /admin/experiencias/nueva still highlights Experiencias.
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 text-small font-medium whitespace-nowrap transition-colors",
                active ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100",
              )}
            >
              <Icon aria-hidden size={16} strokeWidth={1.5} />
              {item.label}
              {item.href === "/admin/solicitudes" && newLeads > 0 && (
                <span
                  className={clsx(
                    "ml-1 rounded-full px-1.5 text-label font-semibold",
                    // Carbon rather than white on the orange fill: at
                    // 0.65rem, white scored 2.56:1. See components/ui/Badge.
                    active ? "bg-white text-neutral-900" : "bg-orange text-carbon",
                  )}
                >
                  {newLeads}
                  <span className="sr-only"> solicitudes nuevas</span>
                </span>
              )}
              <NavPending label={item.label} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-neutral-200 px-2 pt-4 lg:mt-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-small text-neutral-500 hover:text-neutral-900">
          <ArrowLeft aria-hidden size={14} strokeWidth={1.5} />
          Salir al sitio
        </Link>
      </div>
    </>
  );
}
