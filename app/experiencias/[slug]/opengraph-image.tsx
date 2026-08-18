import { ImageResponse } from "next/og";
import { getExperienceBySlug } from "@/lib/sanity/queries";
import { formatDateShort, formatTime } from "@/lib/dates";

/**
 * La imagen que aparece al compartir UNA experiencia por WhatsApp.
 *
 * POR QUÉ EXISTE
 *
 * La página de experiencia declara su propio bloque `openGraph`, y los
 * metadatos de Next se combinan de forma **superficial**: declarar `openGraph`
 * en la página reemplaza entero el del layout, imagen incluida. Como la imagen
 * se ponía solo si la experiencia tenía fotografía —y hoy ninguna la tiene—,
 * compartir una experiencia producía una tarjeta sin imagen. Justo la página
 * que el botón «Compartir» está hecho para mandar.
 *
 * Esta tarjeta no es la genérica del sitio: lleva el título de la experiencia y
 * su fecha. Quien la recibe por WhatsApp ve de qué es y cuándo antes de abrir
 * nada, que es lo que decide si la abre.
 *
 * Cuando la experiencia sí tenga fotografía, `generateMetadata` la usa y esta
 * tarjeta no se emite. La fotografía real siempre gana.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Experiencia de The Sunny Project en Monterrey";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  // `params` es una promesa en esta convención de archivo, igual que en las
  // páginas. Sin el `await`, `params.slug` sale `undefined` y todas las
  // experiencias comparten la misma tarjeta genérica, sin ningún error.
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);

  // Sin datos no se inventa nada: se cae a la tarjeta de marca sin título.
  const titulo = experience?.title ?? "The Sunny Project";
  const cuando = experience?.startDateTime
    ? `${formatDateShort(experience.startDateTime)} · ${formatTime(experience.startDateTime)}`
    : null;
  const anfitrion = experience?.hostName ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background:
            "radial-gradient(85% 70% at 12% 8%, rgba(248,211,71,.55) 0%, rgba(248,211,71,.12) 42%, rgba(23,23,20,0) 72%)," +
            "radial-gradient(75% 65% at 92% 88%, rgba(255,122,61,.42) 0%, rgba(255,122,61,.08) 46%, rgba(23,23,20,0) 74%)," +
            "linear-gradient(160deg, #1d1d19 0%, #171714 55%, #221f1a 100%)",
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#f8d347",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {cuando ?? "Monterrey · Cada semana"}
        </div>

        <div
          style={{
            fontSize: titulo.length > 46 ? 62 : 78,
            color: "#fffdfc",
            lineHeight: 1.04,
            letterSpacing: -2.5,
            maxWidth: 1000,
            display: "flex",
          }}
        >
          {titulo}
        </div>

        <div style={{ fontSize: 30, color: "rgba(255,253,252,.7)", marginTop: 30, display: "flex" }}>
          {anfitrion ? `${anfitrion} · The Sunny Project` : "The Sunny Project · Experiencias en Monterrey"}
        </div>
      </div>
    ),
    size,
  );
}
