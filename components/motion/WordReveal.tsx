"use client";

import { motion, useReducedMotion } from "motion/react";

const TAGS = {
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
} as const;

/**
 * Reveals text word-by-word with a short stagger. Used sparingly (hero
 * titles only) — see INTERACTION_ADAPTATION_PLAN.md for the "don't animate
 * everything" rule.
 */
export function WordReveal({
  text,
  as = "span",
  className,
  delay = 0,
  wordDelay = 0.055,
}: {
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  delay?: number;
  wordDelay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const words = text.split(" ");
  const MotionTag = TAGS[as];

  if (prefersReducedMotion) {
    return (
      <MotionTag className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        {text}
      </MotionTag>
    );
  }

  return (
    <MotionTag className={className} aria-label={text}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          /**
           * `whitespace-pre` is required, not cosmetic. The trailing space
           * lives inside this span, and on an `inline-block` a trailing
           * space is collapsed away — which ran the hero words together
           * ("Descubre algonuevo. Vívelocon alguien."). Preserving
           * whitespace here keeps the words apart while each one still
           * animates as its own block. Caught in QA screenshots.
           */
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.6em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + i * wordDelay, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}
