import { getCurrentUser } from "@/lib/auth";
import { HeaderInteractive } from "@/components/site/HeaderInteractive";

const NAV_LINKS = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/#comunidad", label: "Comunidad" },
  { href: "/para-negocios", label: "Para negocios" },
];

/**
 * The header reflects who is looking at it (brief §12): signed out gets
 * "Acceso"; signed in gets "Mi pase" and "Mi cuenta"; an admin also gets
 * "Panel". Resolved on the server from the session so the header never
 * renders the wrong state and then corrects itself.
 */
export async function Header() {
  const user = await getCurrentUser();

  const accountLinks = user
    ? [
        { href: "/mi-pase", label: "Mi pase" },
        { href: "/mi-cuenta", label: "Mi cuenta" },
        ...(user.profile?.role === "admin" ? [{ href: "/admin", label: "Panel" }] : []),
      ]
    : [{ href: "/acceso", label: "Acceso" }];

  return <HeaderInteractive links={NAV_LINKS} accountLinks={accountLinks} />;
}
