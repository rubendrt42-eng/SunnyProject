"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, MOTION } from "@/lib/motion";

/**
 * Small lift + shadow on hover. `whileHover` in Motion only fires from
 * real pointer hover (not touch taps), so this is naturally inert on
 * mobile — no extra touch-detection needed.
 *
 * `useReducedMotion` no es opcional aquí, y este era el único primitivo del
 * proyecto que no lo consultaba. El bloque global de `prefers-reduced-motion`
 * en globals.css **no lo cubría**: ese bloque anula `transition-duration` y
 * `animation-duration` de CSS, y esto es un `transform` animado desde
 * JavaScript, que no es ninguna de las dos cosas.
 *
 * El efecto concreto del fallo: `HoverLift` envuelve las tarjetas de
 * experiencia —lo que más se toca del sitio—, así que alguien que había pedido
 * expresamente que las cosas no se movieran veía moverse justo el elemento que
 * más aparece. Quien activa ese ajuste suele hacerlo por vértigo o migraña, no
 * por gusto estético.
 */
export function HoverLift({
  children,
  className,
  lift = 6,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={prefersReducedMotion ? undefined : { y: -lift, scale }}
      transition={{ duration: MOTION.lift, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
