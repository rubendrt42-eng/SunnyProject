import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";

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
  danger: "border border-orange/60 text-orange hover:bg-orange/10",
};

const containedSizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-[50px] px-6 text-base rounded-xl",
};

const base =
  "group inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none";

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

function ButtonArrow() {
  return (
    <ArrowRight
      aria-hidden
      size={16}
      className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-1 group-focus-visible:translate-x-1"
    />
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  arrow = false,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={clsx(base, variantClasses[variant], sizeClassesFor(variant, size), className)} {...props}>
      {children}
      {arrow && <ButtonArrow />}
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
