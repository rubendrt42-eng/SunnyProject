import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

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
};

export default nextConfig;
