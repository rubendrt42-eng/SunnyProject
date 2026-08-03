import { clsx } from "clsx";

/**
 * Arrow that nudges right on hover/focus of an ancestor with `.group`.
 * Pure CSS (group-hover) — cheap, no JS, works with keyboard focus too.
 */
export function AnimatedArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={clsx(
        "h-4 w-4 shrink-0 transition-transform duration-[var(--motion-collapse)] ease-sunny group-hover:translate-x-1 group-focus-visible:translate-x-1",
        className,
      )}
    >
      <path d="M4 12h16M14 6l6 6-6 6" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
