"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

/**
 * Subtle vertical parallax on a photo as its container scrolls through
 * the viewport. Kept small (±6% of height) — this is meant to feel like
 * depth, not a scroll-jacking gimmick.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imageClassName,
  priority = false,
  strength = 0.08,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  strength?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ["0%", "0%"] : [`-${strength * 100}%`, `${strength * 100}%`]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }} className="absolute inset-0 -top-[8%] -bottom-[8%]">
        <Image src={src} alt={alt} fill sizes="100vw" priority={priority} className={`object-cover ${imageClassName ?? ""}`} />
      </motion.div>
    </div>
  );
}
