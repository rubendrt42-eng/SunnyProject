import { ImageResponse } from "next/og";

/**
 * La imagen que aparece cuando alguien pega el enlace en WhatsApp.
 *
 * POR QUÉ IMPORTA MÁS DE LO QUE PARECE
 *
 * Sin esto, compartir el sitio produce un enlace pelón: sin foto, sin título,
 * sin nada. Y compartir por WhatsApp es el canal de crecimiento real de este
 * producto en Monterrey. Cada vez que alguien recomendaba Sunny, se perdía
 * prácticamente todo el impacto.
 *
 * Se genera en el servidor con la paleta y la tipografía del sitio, así que no
 * hay un archivo que mantener a mano ni que se quede desactualizado.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Sunny Project — Experiencias en Monterrey";

export default async function Image() {
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
            fontSize: 30,
            color: "#f8d347",
            letterSpacing: 4,
            textTransform: "uppercase",
            marginBottom: 28,
          }}
        >
          Monterrey · Cada semana
        </div>
        <div
          style={{
            fontSize: 82,
            color: "#fffdfc",
            lineHeight: 1.02,
            letterSpacing: -2.5,
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Descubre algo nuevo.</span>
          <span style={{ color: "#f8d347" }}>Vívelo con alguien.</span>
        </div>
        <div style={{ fontSize: 32, color: "rgba(255,253,252,.7)", marginTop: 32 }}>
          The Sunny Project · Experiencias en Monterrey
        </div>
      </div>
    ),
    size,
  );
}
