"use client";

import { useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

export function MobileNav({
  links,
  authLink,
}: {
  links: { href: string; label: string }[];
  authLink: { href: string; label: string };
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-carbon/15"
      >
        <span className="sr-only">Menú</span>
        <div className="flex flex-col gap-1.5">
          <span className={clsx("h-0.5 w-5 bg-carbon transition-transform", open && "translate-y-2 rotate-45")} />
          <span className={clsx("h-0.5 w-5 bg-carbon transition-opacity", open && "opacity-0")} />
          <span className={clsx("h-0.5 w-5 bg-carbon transition-transform", open && "-translate-y-2 -rotate-45")} />
        </div>
      </button>

      {open && (
        <nav
          id="mobile-nav-menu"
          className="absolute inset-x-0 top-full z-40 border-t border-carbon/10 bg-warm-white px-5 py-6 shadow-sm animate-fade-in"
        >
          <ul className="flex flex-col gap-4 text-lg">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block py-1">
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href={authLink.href} onClick={() => setOpen(false)} className="block py-1 font-medium text-orange">
                {authLink.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
