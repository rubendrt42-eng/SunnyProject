import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { MobileNav } from "@/components/site/MobileNav";

const NAV_LINKS = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/para-negocios", label: "Para negocios" },
];

export async function Header() {
  const user = await getCurrentUser();

  const authLink = user ? { href: "/mi-pase", label: "Mi pase" } : { href: "/acceso", label: "Acceso" };

  return (
    <header className="relative z-50 border-b border-carbon/10 bg-warm-white">
      <Container className="flex h-18 items-center justify-between py-4">
        <Link href="/" className="font-serif text-2xl font-medium italic tracking-tight">
          Sunny Project
        </Link>

        <nav className="hidden items-center gap-8 sm:flex" aria-label="Principal">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-carbon/80 hover:text-carbon">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 sm:flex">
          <Link href={authLink.href} className="text-sm font-medium text-carbon/80 hover:text-carbon">
            {authLink.label}
          </Link>
          <LinkButton href="/experiencias" size="sm" variant="primary">
            Explorar
          </LinkButton>
        </div>

        <MobileNav links={NAV_LINKS} authLink={authLink} />
      </Container>
    </header>
  );
}
