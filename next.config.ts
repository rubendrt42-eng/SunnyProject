import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

/**
 * Las rutas de la versión avanzada que en el MVP lean no forman parte del
 * producto: cuentas, pase, historial, panel de administración y el callback de
 * autenticación.
 *
 * **Los archivos siguen en el repositorio.** No se borra nada: la segunda etapa
 * los va a necesitar y están intactos aquí y en las ramas avanzadas. Lo que se
 * cierra es la puerta — sin esto, alguien que escriba /admin o /mi-pase en la
 * barra de direcciones llegaría a una pantalla que pide una sesión que en este
 * MVP no existe, y vería un error en vez de una explicación.
 *
 * Se resuelve con `redirects` y no dentro del proxy porque la documentación de
 * Next lo recomienda explícitamente para redirecciones simples: se aplican
 * antes y no cuestan una ejecución de código por petición.
 */
const RUTAS_FUERA_DEL_MVP = [
  "/acceso",
  "/mi-pase",
  "/mi-cuenta",
  "/historial",
  "/admin",
  "/admin/:path*",
  "/auth/:path*",
];

const nextConfig: NextConfig = {
  images: {
    // Placeholder demo art in /public/images is local SVG we author ourselves.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    remotePatterns: [
      /**
       * Las fotografías que sube Emmy viven en el CDN de Sanity. Es el origen
       * de imagen del MVP lean.
       */
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      /**
       * Supabase Storage sigue permitido porque las pantallas de la versión
       * avanzada continúan existiendo en el repositorio. No forma parte del
       * flujo del MVP lean.
       */
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname, pathname: "/storage/v1/object/public/**" }]
        : []),
    ],
  },

  async redirects() {
    return RUTAS_FUERA_DEL_MVP.map((source) => ({
      source,
      destination: "/",
      /**
       * Temporal (307), no permanente. Un 301 se queda cacheado en el
       * navegador de quien lo reciba, así que el día que la segunda etapa
       * encienda las cuentas, esa gente seguiría rebotando a la portada sin
       * forma de saber por qué.
       */
      permanent: false,
    }));
  },
};

export default nextConfig;
