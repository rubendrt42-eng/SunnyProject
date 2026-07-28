"use client";

import { useState } from "react";
import { AnimatedModal } from "@/components/motion/AnimatedModal";
import { PartnerLeadForm } from "@/components/site/PartnerLeadForm";
import { Button } from "@/components/ui/Button";

export function PartnerLeadModal({ triggerLabel = "Quiero participar" }: { triggerLabel?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)} size="lg">
        {triggerLabel}
      </Button>
      <AnimatedModal open={open} onClose={() => setOpen(false)} title="Súmate como negocio">
        <PartnerLeadForm />
      </AnimatedModal>
    </>
  );
}
