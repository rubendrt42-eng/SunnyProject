"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE, MOTION, STAGGER } from "@/lib/motion";

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
  wordDelay = STAGGER.word,
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
      <MotionTag className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: MOTION.collapse, ease: EASE }}>
        {text}
      </MotionTag>
    );
  }

  return (
    <MotionTag className={className}>
      {/*
       * This used to be `aria-label={text}` on the wrapper. That silently
       * did nothing: `aria-label` is prohibited on a `span` with no role, so
       * assistive technology ignored it — and because every word below is
       * `aria-hidden`, the element ended up with NO accessible text at all.
       * On the Home hero that meant the h1 — the page's whole promise —
       * was invisible to a screen reader. Caught by axe-core
       * (aria-prohibited-attr, serious).
       *
       * A real visually-hidden text node is read verbatim regardless of the
       * wrapper's element type, so it works for every `as` value.
       */}
      <span className="sr-only">{text}</span>
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
          transition={{ duration: MOTION.enter, delay: delay + i * wordDelay, ease: EASE }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}
