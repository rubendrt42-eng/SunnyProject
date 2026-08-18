"use client";

import { useState } from "react";
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
 * El encabezado del sitio.
 *
 * QUÉ SE ARREGLÓ
 *
 * Decidía si flotar leyendo `window.scrollY` con `useSyncExternalStore`. El
 * servidor no puede saber dónde está el scroll, así que su instantánea era
 * siempre «arriba del todo»; cuando el navegador restauraba la posición al
 * recargar, cliente y servidor dibujaban encabezados distintos y React lanzaba
 * el error de hidratación #418. La auditoría lo encontró reproducible en la
 * portada.
 *
 * Ahora el estado visual lo decide **el CSS** (ver `.site-header` en
 * globals.css): sólido por defecto, translúcido sobre el hero de la portada, y
 * se solidifica en los primeros 64 px con una línea de tiempo de scroll. El
 * servidor y el cliente emiten el mismo HTML, así que el desajuste ya no puede
 * ocurrir — y donde el navegador no soporte esa línea de tiempo, el encabezado
 * se queda sólido, que es el estado que siempre se lee.
 *
 * Lo único que sigue siendo estado de React es si el menú móvil está abierto,
 * que empieza cerrado en los dos lados.
 *
 * SOBRE EL BOTÓN DUPLICADO
 *
 * En escritorio había un enlace «Experiencias» y, a treinta píxeles, un botón
 * «Explorar experiencias» que llevaba exactamente al mismo sitio. Dos controles
 * para lo mismo no dan a elegir: obligan a decidir si son distintos. El botón
 * se queda solo en móvil, donde la navegación está detrás del menú y es la
 * única acción visible.
 */
export function HeaderInteractive({
  links,
  ctaLabel = "Explorar experiencias",
}: {
  links: NavLink[];
  ctaLabel?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // `usePathname` devuelve el mismo valor en servidor y cliente, así que esto
  // no reintroduce el desajuste: no depende del navegador, depende de la URL.
  const sobreElHero = pathname === "/";

  return (
    <header
      className={clsx("site-header sticky inset-x-0 top-0 z-50", sobreElHero && "site-header--over-hero")}
    >
      {/* Velo propio del encabezado. Sin él, la legibilidad del menú dependería
          de qué zona del hero le tocara debajo. Se desvanece con el scroll. */}
      {sobreElHero && (
        <div
          aria-hidden
          className="site-header__scrim pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-carbon/70 to-transparent"
        />
      )}

      <Container className="flex h-18 items-center justify-between gap-6 py-4">
        {/* `whitespace-nowrap shrink-0`: el nombre no puede partirse. Como hijo
            de un flex se encogía por debajo de su propio ancho y se rompía en
            «Sunny / Project» en toda ventana menor de 640 px. */}
        <Link
          href="/"
          className="shrink-0 font-serif text-2xl font-medium tracking-tight text-current italic whitespace-nowrap"
        >
          The Sunny Project
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-small font-medium text-current opacity-80 transition-opacity hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* En móvil el botón sí aporta: la navegación está detrás del menú y
            esta es la única acción a la vista. */}
        <div className="flex items-center gap-2 lg:hidden">
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
            className="flex size-11 items-center justify-center rounded-md border border-current/25 text-current"
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
