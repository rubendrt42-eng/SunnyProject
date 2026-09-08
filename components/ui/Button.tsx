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
  primary: "bg-[image:var(--gradient-sun)] text-ink hover:brightness-[1.03]",
  secondary: "border border-coral/45 bg-transparent text-coral-ink hover:border-coral hover:bg-coral/6",
  outline: "border border-ink/20 bg-transparent text-ink hover:border-ink/45 hover:bg-ink/4",
  ghost: "text-carbon underline-offset-4 hover:underline",
  danger: "border border-orange/60 text-orange-ink hover:bg-orange/10",
};

/**
 * RADIO: PÍLDORA. Antes era `rounded-md` (10 px) y estaba escrito que nunca
 * fuera cápsula — era la dirección visual de The Sunny Project, que era
 * angulosa y editorial. La identidad de Sun-i es lo contrario: redondeada, y
 * sus botones son cápsulas. Un botón de esquina viva en el catálogo junto a
 * uno de cápsula en la portada se lee como dos sitios distintos.
 * Referencia anterior: SUNNY_VISUAL_DIRECTION_1_0.md
 * §4 reserves the pill shape for filter chips, where the shape itself
 * communicates "selectable". Heights keep a 44px touch target at `md`.
 */
const containedSizeClasses: Record<Size, string> = {
  /*
    ALTURA MÍNIMA, NO FIJA

    Con el tamaño de texto del navegador al 200% la etiqueta necesita dos
    líneas, y una altura fija se las corta. `min-h-*` deja el botón exactamente
    igual de alto mientras quepa en una línea —el relleno vertical suma menos
    que el mínimo— y solo crece cuando de verdad hace falta.
  */
  sm: "min-h-9 px-5 py-2 text-small rounded-pill",
  md: "min-h-11 px-6 py-2 text-small rounded-pill",
  lg: "min-h-[50px] px-7 py-2.5 text-body rounded-pill",
};

const base =
  /* `press` añade el hundido de 1 px al pulsar. En escritorio hay hover; en un
     teléfono no hay ninguna respuesta entre tocar y que la página cambie, y ese
     medio segundo hace que el botón se sienta muerto. */
  /* `max-w-full` y `text-center`: el botón se dimensiona a su contenido, así
     que con el texto al 200% «Explorar experiencias» medía 319px dentro de los
     280 disponibles y empujaba el documento a 359px — barra de scroll
     horizontal. El tope solo actúa cuando la etiqueta no cabe; a tamaño normal
     el botón mide lo mismo que antes. */
  "press group inline-flex max-w-full items-center justify-center gap-2 text-center font-medium transition-[colors,transform] duration-[var(--motion-tint)] disabled:opacity-40 disabled:pointer-events-none";

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
