import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "neutral" | "sunny" | "orange" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-carbon/8 text-carbon",
  sunny: "bg-sunny text-carbon",
  orange: "bg-orange text-warm-white",
  success: "bg-emerald-100 text-emerald-800",
  danger: "bg-red-100 text-red-800",
};

export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide uppercase",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
