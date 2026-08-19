"use client";

import { useRef, useState } from "react";
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
  const botonMenu = useRef<HTMLButtonElement>(null);

  /**
   * Cerrar el menú devuelve el foco al botón que lo abrió.
   *
   * Sin esto, al cerrar con Escape el foco cae en el `body` y quien navega con
   * teclado tiene que recorrer la página entera desde arriba para volver a
   * donde estaba. La referencia vive aquí y no dentro del menú porque cuando el
   * menú se monta, `autoFocus` ya se ha llevado el foco a su botón de cerrar.
   */
  const cerrarMenu = () => {
    setMenuOpen(false);
    botonMenu.current?.focus();
  };
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

      {/*
        `flex-wrap` y altura mínima en vez de fija.

        Con el texto al 200% —la ampliación que exige WCAG 1.4.4— la marca pasa
        de 24 a 48 px, y marca + separación + controles suman 523 px en una
        pantalla de 320 o de 390. El resultado era scroll horizontal en TODAS
        las páginas: 259 px de desborde a 320 px de ancho, 189 px a 390 px.

        Encoger la marca no lo arreglaba: a ese tamaño de letra, solo el
        relleno del contenedor ya se come 80 px de los 320. Lo que sí lo
        arregla es dejar que la fila se parta: a tamaño normal sigue siendo una
        sola línea —nada cambia—, y cuando la letra crece los controles bajan a
        la siguiente en vez de salirse de la pantalla.

        `h-18` era altura FIJA; con dos líneas recortaría el contenido. Pasa a
        ser altura mínima.
      */}
      <Container className="flex min-h-18 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-4">
        {/* `shrink-0`: como hijo de un flex se encogía por debajo de su propio
            ancho y se rompía en «Sunny / Project» en toda ventana menor de
            640 px. Eso lo arregla no dejar que lo aplasten sus hermanos.

            `max-w-full` en vez de `whitespace-nowrap`: prohibir el ajuste
            además de la compresión dejaba al nombre sin ninguna salida cuando
            el texto crecía más que la ventana. Con el tamaño de texto del
            navegador al 200% —que es un ajuste de accesibilidad, no un caso
            raro— la marca medía 347px dentro de 320px y empujaba el documento
            entero a 387px: barra de scroll horizontal en las siete rutas.
            Medido con la raíz a 32px.

            El tope al 100% del contenedor solo actúa cuando el texto de verdad
            no cabe: a tamaño normal y 320px ocupa 173px de los 280 que hay, así
            que sigue en una línea igual que antes. */}
        <Link
          href="/"
          className="max-w-full shrink-0 font-serif text-2xl font-medium tracking-tight text-current italic"
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
            ref={botonMenu}
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
        onClose={cerrarMenu}
        links={links}
        footer={
          <div className="flex flex-col gap-4">
            <LinkButton href="/experiencias" onClick={cerrarMenu} className="mt-2 w-fit">
              {ctaLabel}
            </LinkButton>
          </div>
        }
      />
    </header>
  );
}
