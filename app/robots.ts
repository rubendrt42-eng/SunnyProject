import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * QUÉ PUEDE RASTREAR GOOGLE.
 *
 * Hasta ahora `/robots.txt` daba 404. No es que el sitio estuviera bloqueado
 * —sin archivo, un buscador entiende «entra a todo»— pero sí significaba dos
 * cosas: que nadie había decidido nada, y que no había dónde anunciar el
 * mapa del sitio.
 *
 * SE BLOQUEA LO QUE NO ES PÚBLICO
 *
 * `/admin`, `/api`, y las pantallas de cuenta que existen en el repositorio
 * desde la versión avanzada. Hoy el menú no las enlaza, pero un buscador no
 * navega por el menú: prueba direcciones. Que aparezca `/admin` en los
 * resultados de Google no rompe nada, pero enseña la puerta de servicio.
 *
 * LO QUE ESTO NO DECIDE
 *
 * Si conviene que Google indexe `sunny-mvp.vercel.app` mientras el dominio
 * oficial no esté conectado. Hoy puede, que es como estaba antes de este
 * archivo: no se cambia ese comportamiento a espaldas de nadie. Cuando se
 * decida, se cambia aquí en una línea.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/acceso", "/mi-cuenta", "/mi-pase", "/historial"],
      },
    ],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
