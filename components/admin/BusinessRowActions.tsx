"use client";

import { useState, useTransition } from "react";
import { Power, Store } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
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
      <AdminActionButton
        label={active ? "Activo" : "Inactivo"}
        icon={Power}
        active={active}
        busy={busy === "active"}
        disabled={pending}
        onClick={() =>
          run(
            "active",
            () => setBusinessActiveAction(businessId, !active),
            active
              ? "¿Desactivar este negocio? No podrás asignarle experiencias nuevas. Sus experiencias y reservaciones existentes se conservan."
              : undefined,
          )
        }
      />

      {supportsPartnerFlag && (
        <AdminActionButton
          label={featuredAsPartner ? "Aliado visible" : "Mostrar como aliado"}
          icon={Store}
          active={featuredAsPartner}
          busy={busy === "partner"}
          disabled={pending}
          onClick={() => run("partner", () => togglePartnerFeatureAction(businessId, !featuredAsPartner))}
        />
      )}
    </div>
  );
}
