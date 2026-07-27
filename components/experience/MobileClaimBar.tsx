"use client";

import { CTA_LABEL, type ExperienceCta } from "@/lib/experience-cta";
import { Button } from "@/components/ui/Button";

/**
 * Fixed bottom CTA on mobile. It only scrolls to the real reservation
 * panel (`#reservar`) — all claim/cancel logic still lives exclusively in
 * ClaimPanel, this never duplicates it.
 */
export function MobileClaimBar({ ctaType, spotsLabel }: { ctaType: ExperienceCta["type"]; spotsLabel: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-carbon/10 bg-warm-white/95 p-4 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <span className="text-sm text-gray">{spotsLabel}</span>
        <Button
          onClick={() => document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          size="sm"
        >
          {ctaType === "claimable" ? "Obtener mi pase" : CTA_LABEL[ctaType]}
        </Button>
      </div>
    </div>
  );
}
