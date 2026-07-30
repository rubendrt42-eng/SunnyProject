"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { FullscreenMenu } from "@/components/motion/FullscreenMenu";

interface NavLink {
  href: string;
  label: string;
}

/**
 * Header is solid on every route, including Home.
 *
 * It used to float transparent over the video hero with white text and
 * swap to solid on scroll. The redesigned hero is an editorial split on an
 * ivory background (there is no full-bleed dark video to sit over — see
 * SUNNY_ASSET_MANIFEST.md §6: no video material exists), so white-on-ivory
 * would have been invisible for the first viewport. A solid header removes
 * that whole class of contrast bug and matches how both references
 * actually behave.
 *
 * Account links are passed in rather than derived here, because session
 * state is read on the server (see Header.tsx) — the header must never
 * flash the wrong auth state.
 */
export function HeaderInteractive({
  links,
  accountLinks,
  ctaLabel = "Explorar esta semana",
}: {
  links: NavLink[];
  accountLinks: NavLink[];
  ctaLabel?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky inset-x-0 top-0 z-50 border-b border-carbon/10 bg-warm-white">
      <Container className="flex h-18 items-center justify-between gap-6 py-4">
        <Link href="/" className="font-serif text-2xl font-medium italic tracking-tight text-carbon">
          Sunny Project
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-small font-medium text-carbon/80 transition-colors hover:text-carbon"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          {accountLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-small font-medium text-carbon/80 transition-colors hover:text-carbon"
            >
              {link.label}
            </Link>
          ))}
          <LinkButton href="/experiencias" size="sm" variant="primary">
            {ctaLabel}
          </LinkButton>
        </div>

        {/* Below lg the CTA stays visible next to the menu button — the
            brief is explicit that mobile must not hide the main action
            behind the menu. */}
        <div className="flex items-center gap-2 lg:hidden">
          <LinkButton href="/experiencias" size="sm" variant="primary" className="hidden sm:inline-flex">
            {ctaLabel}
          </LinkButton>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
            className="flex size-11 items-center justify-center rounded-md border border-carbon/15 text-carbon"
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
            {accountLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="font-serif text-3xl italic">
                {link.label}
              </Link>
            ))}
            <LinkButton href="/experiencias" onClick={() => setMenuOpen(false)} className="mt-2 w-fit">
              {ctaLabel}
            </LinkButton>
          </div>
        }
      />
    </header>
  );
}
