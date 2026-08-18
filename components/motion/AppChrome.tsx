import type { ReactNode } from "react";

/**
 * Envoltorio del contenido público.
 *
 * QUÉ SE QUITÓ Y POR QUÉ
 *
 * Montaba dos cosas en todas las páginas públicas: **Lenis** (scroll suave) y
 * un cargador de sesión que tapaba la pantalla en la primera visita. Las dos se
 * retiran del MVP lean.
 *
 * **Lenis.** Reemplaza el scroll del navegador por uno calculado en
 * JavaScript. A cambio de una inercia más suave cobraba tres cosas: JavaScript
 * en todas las rutas públicas, un contenedor transformado que descuadra
 * cualquier herramienta que capture la página entera —lo encontró la
 * auditoría—, y un scroll que deja de ser el del sistema, con lo que eso
 * implica para quien usa lector de pantalla, navegación por teclado o
 * simplemente un teléfono viejo. Para un sitio de ocho páginas cuyo contenido
 * es texto, fotos y un formulario, no compensa.
 *
 * **El cargador de sesión.** Una cortina que tapa el contenido durante 750 ms
 * en la primera visita, controlada desde JavaScript. En un sitio cuyo problema
 * era justo que el contenido dependía del JavaScript para verse, añadir algo
 * que lo tapa a propósito va en dirección contraria.
 *
 * Los dos componentes siguen en el repositorio y en las ramas avanzadas. Este
 * envoltorio se queda como punto único donde volver a montarlos si algún día
 * hace falta, en vez de repartir esa decisión por el layout.
 */
export function AppChrome({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
