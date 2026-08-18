/**
 * Transición entre páginas, sin JavaScript y sin banderas experimentales.
 *
 * EL PROBLEMA
 *
 * Hacer clic en una tarjeta y llegar al detalle era un corte seco. De todo lo
 * que quedaba, era el momento que más «barato» se sentía: el resto de la página
 * respira y la navegación no.
 *
 * POR QUÉ ASÍ Y NO CON LA API DE TRANSICIONES DE VISTA
 *
 * Next 16 la integra, pero detrás de `experimental.viewTransition`. Encender una
 * bandera experimental de React en el sitio de una clienta, por una transición,
 * va en contra de lo que se pidió expresamente: no sacrificar estabilidad por
 * una animación bonita.
 *
 * `template.tsx` consigue lo mismo por la puerta estable. A diferencia de un
 * layout, Next le da una **clave nueva en cada navegación**, así que el
 * elemento se vuelve a montar y su animación de CSS se vuelve a ejecutar. Es
 * una convención documentada, no un truco, y no añade ni un byte de JavaScript.
 *
 * La animación es corta y solo de opacidad y desplazamiento: una transición
 * entre páginas que se nota es una transición que estorba. Con
 * `prefers-reduced-motion` no hay ninguna — el contenido aparece y ya.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
