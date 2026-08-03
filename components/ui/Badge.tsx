import { clsx } from "clsx";
import type { ReactNode } from "react";

export type Tone = "neutral" | "sunny" | "orange" | "success" | "danger" | "pine" | "onPhoto";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-carbon/8 text-carbon",
  sunny: "bg-sunny text-carbon",
  // Carbon on orange, not warm-white on orange. The label is 11px, so AA
  // wants 4.5:1 — warm-white gave 2.56:1, carbon gives 6.93:1. This keeps
  // the brand fill exactly as designed and only changes the lettering,
  // which is the smaller of the two possible compromises.
  orange: "bg-orange text-carbon",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
  // The narrow secondary. Only "Conoce gente nueva" and the Original seal.
  pine: "bg-pine text-warm-white",
  // Legible on top of photography without a solid fill hiding the image.
  onPhoto: "bg-carbon/55 text-warm-white backdrop-blur-[2px]",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-label",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * The Sunny Original seal. Distinct from a normal badge on purpose: it
 * marks a whole category of experience (curated by Sunny itself rather
 * than by a partner space), so it gets the pine fill and a yellow dot.
 */
export function OriginalSeal({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center gap-1.5 rounded-full bg-pine px-2.5 py-1 text-label text-warm-white",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-sunny" />
      Sunny Original
    </span>
  );
}
