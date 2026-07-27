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

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function getScrolledPastHero() {
  return window.scrollY > 64;
}

function getScrolledPastHeroServerSnapshot() {
  return false;
}

export function HeaderInteractive({
  links,
  authLink,
}: {
  links: NavLink[];
  authLink: NavLink;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolledPastHero = useSyncExternalStore(subscribeToScroll, getScrolledPastHero, getScrolledPastHeroServerSnapshot);

  const solid = !isHome || scrolledPastHero;

  return (
    <header
      className={clsx(
        "inset-x-0 top-0 z-50 transition-colors duration-300",
        // Only the home page has a hero for the header to float over — on
        // every other route it takes normal document flow (like before)
        // and starts solid immediately, so page content never sits under it.
        isHome ? "fixed" : "sticky",
        solid ? "border-b border-carbon/10 bg-warm-white" : "border-b border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-18 items-center justify-between py-4">
        <Link
          href="/"
          className={clsx(
            "font-serif text-2xl font-medium italic tracking-tight transition-colors duration-300",
            solid ? "text-carbon" : "text-warm-white",
          )}
        >
          Sunny Project
        </Link>

        <nav className="hidden items-center gap-8 sm:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition-colors duration-300",
                solid ? "text-carbon/80 hover:text-carbon" : "text-warm-white/85 hover:text-warm-white",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          <Link
            href={authLink.href}
            className={clsx(
              "text-sm font-medium transition-colors duration-300",
              solid ? "text-carbon/80 hover:text-carbon" : "text-warm-white/85 hover:text-warm-white",
            )}
          >
            {authLink.label}
          </Link>
          <LinkButton href="/experiencias" size="sm" variant={solid ? "primary" : "secondary"}>
            Explorar
          </LinkButton>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          aria-label="Abrir menú"
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 sm:hidden",
            solid ? "border-carbon/15 text-carbon" : "border-warm-white/40 text-warm-white",
          )}
        >
          <div className="flex flex-col gap-1.5">
            <span className="h-0.5 w-5 bg-current" />
            <span className="h-0.5 w-5 bg-current" />
          </div>
        </button>
      </Container>

      <FullscreenMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={links}
        footer={
          <div className="flex flex-col gap-4">
            <Link href={authLink.href} onClick={() => setMenuOpen(false)} className="font-serif text-4xl italic">
              {authLink.label}
            </Link>
            <LinkButton href="/experiencias" onClick={() => setMenuOpen(false)} className="w-fit">
              Explorar
            </LinkButton>
          </div>
        }
      />
    </header>
  );
}
