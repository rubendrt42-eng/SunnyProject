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

  /**
   * Recorte de los textos editables.
   *
   * El título y el nombre del anfitrión los escribe Emmy y no tienen tope en el
   * esquema. Renderizado tal cual, un título largo se comía la tarjeta entera:
   * empujaba la fecha contra el borde de arriba y la línea del anfitrión contra
   * el de abajo, donde se cortaba. Con una sola palabra de 63 letras además se
   * salía por la derecha a media palabra.
   *
   * Medido: un título de 96 caracteres con palabras normales cabe de sobra —tres
   * líneas— y no lo toca este recorte. El problema aparece a partir de unas
   * cinco líneas, o con cualquier palabra más ancha que la caja.
   */
  const recortar = (texto: string, tope: number) =>
    texto.length > tope ? `${texto.slice(0, tope - 1).trimEnd()}…` : texto;

  // Sin datos no se inventa nada: se cae a la tarjeta de marca sin título.
  const titulo = recortar(experience?.title ?? "The Sunny Project", 120);
  const cuando = experience?.startDateTime
    ? `${formatDateShort(experience.startDateTime)} · ${formatTime(experience.startDateTime)}`
    : null;
  const anfitrion = experience?.hostName ? recortar(experience.hostName, 72) : null;

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
            fontSize: titulo.length > 100 ? 52 : titulo.length > 46 ? 62 : 78,
            color: "#fffdfc",
            lineHeight: 1.04,
            letterSpacing: -2.5,
            maxWidth: 1000,
            display: "flex",
            // Sin esto, una palabra más ancha que la caja no se parte: sigue
            // recto y se corta contra el borde de la tarjeta.
            wordBreak: "break-word",
          }}
        >
          {titulo}
        </div>

        <div
          style={{ fontSize: 30, color: "rgba(255,253,252,.7)", marginTop: 30, display: "flex", wordBreak: "break-word" }}
        >
          {anfitrion ? `${anfitrion} · The Sunny Project` : "The Sunny Project · Experiencias en Monterrey"}
        </div>
      </div>
    ),
    size,
  );
}
