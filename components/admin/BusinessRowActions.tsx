"use client";

import { useState, useTransition } from "react";
import { Power, Store } from "lucide-react";
import { clsx } from "clsx";
import { setBusinessActiveAction, togglePartnerFeatureAction } from "@/lib/actions/admin";

/**
 * Activate/deactivate a business, and show/hide it as a public ally.
 *
 * These are two genuinely different things and the UI keeps them apart:
 * `active` decides whether Emmy can attach experiences to the business at
 * all, `featured_as_partner` decides whether it appears in the public
 * "Espacios que forman parte de Sunny" carousel. An operating partner has
 * not necessarily agreed to be shown on the home page (decision 9).
 *
 * The ally toggle is hidden until the presentation migration adds the
 * column, rather than shown and silently failing.
 */
export function BusinessRowActions({
  businessId,
  active,
  featuredAsPartner,
  supportsPartnerFlag,
}: {
  businessId: string;
  active: boolean;
  featuredAsPartner: boolean;
  supportsPartnerFlag: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  function run(key: string, fn: () => Promise<unknown>, confirmText?: string) {
    if (pending) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(key);
    startTransition(async () => {
      await fn();
      setBusy(null);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        aria-pressed={active}
        onClick={() =>
          run(
            "active",
            () => setBusinessActiveAction(businessId, !active),
            active
              ? "¿Desactivar este negocio? No podrás asignarle experiencias nuevas. Sus experiencias y reservaciones existentes se conservan."
              : undefined,
          )
        }
        className={clsx(
          "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2 text-[0.75rem] font-medium transition-colors disabled:opacity-50",
          active ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300 text-neutral-700 hover:bg-neutral-50",
        )}
      >
        <Power aria-hidden size={13} strokeWidth={1.75} />
        {busy === "active" ? "…" : active ? "Activo" : "Inactivo"}
      </button>

      {supportsPartnerFlag && (
        <button
          type="button"
          disabled={pending}
          aria-pressed={featuredAsPartner}
          onClick={() => run("partner", () => togglePartnerFeatureAction(businessId, !featuredAsPartner))}
          className={clsx(
            "inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2 text-[0.75rem] font-medium transition-colors disabled:opacity-50",
            featuredAsPartner
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 text-neutral-700 hover:bg-neutral-50",
          )}
        >
          <Store aria-hidden size={13} strokeWidth={1.75} />
          {busy === "partner" ? "…" : featuredAsPartner ? "Aliado visible" : "Mostrar como aliado"}
        </button>
      )}
    </div>
  );
}
