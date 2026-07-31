"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useReducedMotion, AnimatePresence, motion } from "motion/react";
import { EASE, MOTION } from "@/lib/motion";

/**
 * Brief "Sesión iniciada" confirmation after /auth/callback redirects with
 * `?bienvenido=1` — the only user-visible signal that the magic link worked,
 * since the callback itself is a silent server redirect. Strips the param
 * from the URL once shown so it never reappears on refresh/back.
 */
export function SessionWelcomeToast() {
  // Sin desplazamiento cuando se ha pedido menos movimiento. El bloque global
  // de globals.css no alcanza esto: anula transiciones y animaciones de CSS,
  // y esto es un transform animado desde JavaScript.
  const still = useReducedMotion() ?? false;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(() => searchParams.get("bienvenido") === "1");
  const cleanedUp = useRef(false);

  useEffect(() => {
    if (!visible || cleanedUp.current) return;
    cleanedUp.current = true;

    const params = new URLSearchParams(searchParams);
    params.delete("bienvenido");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, [visible, searchParams, pathname, router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: still ? 0 : -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: still ? 0 : -16 }}
          transition={{ duration: MOTION.panel, ease: EASE }}
          className="fixed inset-x-0 top-4 z-[100] mx-auto flex w-fit items-center gap-2 rounded-full bg-carbon px-5 py-2.5 text-sm font-medium text-warm-white shadow-xl"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 text-sunny">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          Sesión iniciada
        </motion.div>
      )}
    </AnimatePresence>
  );
}
