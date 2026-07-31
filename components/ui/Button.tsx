import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { ArrowRight, Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

/**
 * Three real tiers: primary (sunny fill, the main action), secondary
 * (bordered, not a pill — `outline` is kept as an alias so existing call
 * sites don't need to change), and ghost (no container at all — text and
 * an optional arrow, the "botón textual" tier). Danger is a narrow
 * exception used only for the cancel-reservation action.
 */
const variantClasses: Record<Variant, string> = {
  primary: "bg-sunny text-carbon hover:bg-sunny/85",
  secondary: "border border-carbon/25 bg-transparent text-carbon hover:border-carbon/60 hover:bg-carbon/5",
  outline: "border border-carbon/25 bg-transparent text-carbon hover:border-carbon/60 hover:bg-carbon/5",
  ghost: "text-carbon underline-offset-4 hover:underline",
  danger: "border border-orange/60 text-orange-ink hover:bg-orange/10",
};

/**
 * Radius is `rounded-md` (10px), never a capsule — SUNNY_VISUAL_DIRECTION_1_0.md
 * §4 reserves the pill shape for filter chips, where the shape itself
 * communicates "selectable". Heights keep a 44px touch target at `md`.
 */
const containedSizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-small rounded-md",
  md: "h-11 px-5 text-small rounded-md",
  lg: "h-[50px] px-6 text-body rounded-md",
};

const base =
  "group inline-flex items-center justify-center gap-2 font-medium transition-colors duration-[var(--motion-tint)] disabled:opacity-40 disabled:pointer-events-none";

function sizeClassesFor(variant: Variant, size: Size) {
  return variant === "ghost" ? "text-sm" : containedSizeClasses[size];
}

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  /** Small trailing arrow that nudges 4px on hover/focus — opt in per call site, not forced on every button. */
  arrow?: boolean;
}

/**
 * Loading is a first-class button state, not something each call site
 * reimplements: the label swaps to a gerundio, a spinner replaces the
 * arrow, the button is disabled so a double click can't fire twice, and
 * `aria-busy` announces it. Screen readers get the changed label too —
 * the spinner is never the only signal.
 */
function ButtonSpinner() {
  return <Loader2 aria-hidden size={16} strokeWidth={1.75} className="shrink-0 animate-spin" />;
}

function ButtonArrow() {
  return (
    <ArrowRight
      aria-hidden
      size={16}
      className="shrink-0 transition-transform duration-[var(--motion-collapse)] ease-sunny group-hover:translate-x-1 group-focus-visible:translate-x-1"
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow = false,
  loading = false,
  loadingLabel,
  disabled,
  ...props
}: CommonProps & { loading?: boolean; loadingLabel?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(base, variantClasses[variant], sizeClassesFor(variant, size), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && loadingLabel ? loadingLabel : children}
      {loading ? <ButtonSpinner /> : arrow && <ButtonArrow />}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  arrow = false,
  ...props
}: CommonProps & { href: string } & React.ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={clsx(base, variantClasses[variant], sizeClassesFor(variant, size), className)} {...props}>
      {children}
      {arrow && <ButtonArrow />}
    </Link>
  );
}
