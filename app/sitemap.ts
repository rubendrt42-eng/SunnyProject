import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * EL MAPA DEL SITIO.
 *
 * Son dos direcciones porque el sitio son dos páginas: la portada —que cuenta
 * el ecosistema entero de arriba abajo— y el aviso de privacidad. Las
 * secciones de la portada no van aquí: son anclas dentro de la misma página,
 * no páginas, y listarlas le diría a Google que hay seis páginas donde hay
 * una.
 *
 * Se escribe a mano y no recorriendo el directorio `app/` a propósito: ahí
 * viven también las pantallas de administración y de cuenta de la versión
 * avanzada, y un mapa automático las publicaría.
 *
 * `/privacidad` va con prioridad baja: es una página que debe existir y poder
 * encontrarse, no una por la que se quiera competir.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();
  return [
    { url: env.siteUrl, lastModified: ahora, changeFrequency: "weekly", priority: 1 },
    { url: `${env.siteUrl}/privacidad`, lastModified: ahora, changeFrequency: "yearly", priority: 0.3 },
  ];
}
