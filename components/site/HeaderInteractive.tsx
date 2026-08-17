"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { FullscreenMenu } from "@/components/motion/FullscreenMenu";

interface NavLink {
  href: string;
  label: string;
}

/**
 * Sólido en todas partes menos sobre el hero de la portada, donde flota.
 *
 * El comentario anterior aquí decía que el header era sólido siempre «porque
 * el hero es una división editorial sobre marfil, y blanco sobre marfil sería
 * invisible». Era correcto entonces. Ahora el hero es una fotografía a sangre
 * completa con un velo oscuro encima, así que la premisa cambió y el header
 * puede volver a flotar — que es lo que hace la referencia.
 *
 * Lo que NO se repite del intento anterior: no se confía en que la foto sea
 * oscura. El header dibuja su propio degradado, y en cuanto se hace scroll
 * pasa a sólido. Así el texto blanco nunca depende de qué haya debajo.
 *
 * Solo la portada. Cualquier otra ruta arranca sólida: es la única forma de
 * no reintroducir el fallo de contraste que costó arreglar.
 *
 * En el MVP lean el encabezado no sabe nada de sesiones: no hay cuentas, así
 * que no hay estado que reflejar ni que pueda parpadear equivocado. Los
 * enlaces son los mismos para todo el mundo.
 */

/**
 * ¿Se ha bajado de los primeros 64 px?
 *
 * `useSyncExternalStore` y no `useEffect` + `setState`: el proyecto ya usa
 * este patrón en `useIsDesktop` y en `ReturnDomainHint`, y la regla
 * `react-hooks/set-state-in-effect` rechaza la otra forma. El snapshot del
 * servidor es `false` — arriba del todo, que es donde empieza la página.
 */
function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}
function isScrolled() {
  return window.scrollY > 64;
}
function notScrolled() {
  return false;
}
export function HeaderInteractive({
  links,
  ctaLabel = "Explorar experiencias",
}: {
  links: NavLink[];
  ctaLabel?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const scrolled = useSyncExternalStore(subscribeToScroll, isScrolled, notScrolled);
  const floating = pathname === "/" && !scrolled;

  return (
    <header
      className={clsx(
        "sticky inset-x-0 top-0 z-50 transition-colors",
        floating ? "border-b border-transparent bg-transparent" : "border-b border-carbon/10 bg-warm-white",
      )}
    >
      {/* El degradado propio del header. Sin esto, la legibilidad del menú
          dependería de qué zona de la fotografía le tocara debajo. */}
      {floating && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-carbon/70 to-transparent" />
      )}
      <Container className="flex h-18 items-center justify-between gap-6 py-4">
        {/* `whitespace-nowrap shrink-0`: the brand name must never break. As
            a flex child it was shrinking below its own content width and
            wrapping to "Sunny / Project" on every viewport under 640px —
            two lines of a 32px line-height inside a 72px header, on every
            page of the site. */}
        <Link
          href="/"
          className={clsx(
            "shrink-0 font-serif text-2xl font-medium italic tracking-tight whitespace-nowrap transition-colors",
            floating ? "text-warm-white" : "text-carbon",
          )}
        >
          Sunny Project
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-small font-medium transition-colors",
                floating ? "text-warm-white/85 hover:text-warm-white" : "text-carbon/80 hover:text-carbon",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LinkButton href="/experiencias" size="sm" variant="primary">
            {ctaLabel}
          </LinkButton>
        </div>

        {/* Below lg the CTA stays visible next to the menu button — the
            brief is explicit that mobile must not hide the main action
            behind the menu. */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* The responsive hide lives on a WRAPPER, not on the button.
              `className="hidden sm:inline-flex"` on LinkButton did nothing:
              its own base classes already declare `inline-flex`, and between
              two display utilities of equal specificity the stylesheet's
              source order decides — so the button stayed visible at every
              width and crowded the wordmark off its line. Wrapping moves the
              display switch onto an element that isn't fighting anyone. */}
          <div className="hidden sm:block">
            <LinkButton href="/experiencias" size="sm" variant="primary">
              {ctaLabel}
            </LinkButton>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
            className={clsx(
              "flex size-11 items-center justify-center rounded-md border transition-colors",
              floating ? "border-white/30 text-warm-white" : "border-carbon/15 text-carbon",
            )}
          >
            <div className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 bg-current" />
              <span className="h-0.5 w-5 bg-current" />
            </div>
          </button>
        </div>
      </Container>

      <FullscreenMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        footer={
          <div className="flex flex-col gap-4">
            <LinkButton href="/experiencias" onClick={() => setMenuOpen(false)} className="mt-2 w-fit">
              {ctaLabel}
            </LinkButton>
          </div>
        }
      />
    </header>
  );
}
