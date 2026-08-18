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
  /**
   * `/terminos` describe reglas que no existen —pase semanal, cancelación a 12
   * horas, folios, número de reservas por semana— y no hay una política real
   * definida por la clienta que ponga en su lugar. Se retira del sitio en vez
   * de publicar un documento inventado: un texto legal falso es peor que no
   * tener página. Vuelve en cuanto exista una versión validada.
   */
  "/terminos",
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

  /**
   * Cabeceras de seguridad.
   *
   * Hoy la única que manda Vercel por su cuenta es `Strict-Transport-Security`.
   * Faltaban las cuatro de abajo, y este sitio pide nombre, WhatsApp y correo
   * en dos formularios públicos: no es una página de solo lectura.
   *
   * `X-Frame-Options: DENY` es la que de verdad importa aquí. Sin ella,
   * cualquiera puede meter el sitio dentro de un iframe invisible sobre su
   * propia página y conseguir que alguien pulse «Enviar solicitud» creyendo
   * que pulsa otra cosa. Con dos formularios que recogen datos personales, esa
   * puerta no tiene por qué estar abierta: el sitio no necesita incrustarse en
   * ningún sitio.
   *
   * Las otras tres son higiene estándar y no cambian nada de lo que se ve:
   * `nosniff` impide que el navegador adivine el tipo de un archivo y lo trate
   * como algo que no es; `Referrer-Policy` evita mandar la dirección completa
   * a otros dominios; y `Permissions-Policy` apaga cámara, micrófono y
   * ubicación, que este sitio no usa en ninguna parte.
   *
   * NO se añade `Content-Security-Policy`. Una CSP de verdad hay que ajustarla
   * a cada script y estilo que emite Next, y una mal puesta rompe el sitio en
   * silencio para parte de la gente. Es un trabajo aparte, no una línea más en
   * esta lista.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
    ];
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
