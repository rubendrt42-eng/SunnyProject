"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { SessionLoader } from "@/components/motion/SessionLoader";

const NO_MOTION_PREFIXES = ["/admin", "/mi-pase", "/mi-cuenta", "/historial"];

/**
 * Scopes Lenis smooth scroll + the session loader to public marketing
 * pages only. Account/reservation/admin screens stay on native scroll and
 * skip the loader entirely — see PRODUCT_SPEC.md / INTERACTION_ADAPTATION_PLAN.md.
 */
export function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isMotionExempt = NO_MOTION_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isMotionExempt) {
    return <>{children}</>;
  }

  return (
    <SmoothScrollProvider>
      <SessionLoader />
      {children}
    </SmoothScrollProvider>
  );
}
