import { HeaderInteractive } from "@/components/site/HeaderInteractive";

const NAV_LINKS = [
  { href: "/experiencias", label: "Experiencias" },
  { href: "/como-funciona", label: "Cómo funciona" },
  { href: "/#comunidad", label: "Comunidad" },
  { href: "/para-negocios", label: "Para negocios" },
];

/**
 * El encabezado del MVP lean.
 *
 * QUÉ SE QUITÓ Y POR QUÉ
 *
 * Antes leía la sesión con `getCurrentUser()` y pintaba enlaces distintos según
 * quién mirara: «Acceso» sin sesión; «Mi pase», «Mi cuenta» y «Panel» con ella.
 * En esta etapa **no existen cuentas**, así que todos esos enlaces llevarían a
 * pantallas que no forman parte del producto.
 *
 * Quitar la lectura de sesión tiene un efecto que va más allá de la estética:
 * el encabezado sale en todas las páginas, así que mientras consultara Supabase
 * **ninguna página del sitio podía ser estática**. Ahora el encabezado no
 * consulta nada y las páginas se pueden servir desde caché.
 *
 * Esto no borra nada: `lib/auth.ts` y las pantallas de cuenta siguen en el
 * repositorio y en las ramas avanzadas, listas para la segunda etapa. Solo
 * dejan de tener puerta de entrada desde el sitio público.
 */
export function Header() {
  return <HeaderInteractive links={NAV_LINKS} ctaLabel="Explorar experiencias" />;
}
