import { getCurrentUser } from "@/lib/auth";
import { HeaderInteractive } from "@/components/site/HeaderInteractive";

const NAV_LINKS = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/para-negocios", label: "Para negocios" },
];

export async function Header() {
  const user = await getCurrentUser();
  const authLink = user ? { href: "/mi-pase", label: "Mi pase" } : { href: "/acceso", label: "Acceso" };

  return <HeaderInteractive links={NAV_LINKS} authLink={authLink} />;
}
