import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { HERO, MARCA } from "@/lib/sunni-content";

/**
 * La imagen que aparece cuando alguien pega el enlace en WhatsApp.
 *
 * POR QUÉ IMPORTA MÁS DE LO QUE PARECE
 *
 * Compartir por WhatsApp es como se recomienda el sitio en Monterrey, y esta
 * imagen es lo primero —a veces lo único— que ve quien recibe el enlace.
 *
 * LA VERSIÓN ANTERIOR ERA DE OTRO PRODUCTO
 *
 * Decía «Monterrey · Cada semana — Descubre algo nuevo. Vívelo con alguien.»
 * sobre fondo oscuro: la promesa de la versión de experiencias semanales,
 * que ya no es lo que el sitio ofrece. Emmy la vio al compartir el enlace y
 * con razón dijo que eso no era Sun‑i.
 *
 * Ahora repite la primera pantalla de la portada —el mismo rótulo, el mismo
 * titular, el mismo coral— y lo toma de las mismas constantes, para que la
 * imagen y la portada no vuelvan a contar cosas distintas.
 *
 * El personaje va entero, sin recortar, en su proporción original.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${MARCA.nombre} — ${MARCA.tagline}`;

const INK = "#252525";
const GRAY = "#74695e";
const CREAM = "#fff9f1";
const CORAL = "#e84e32";
const CORAL_INK = "#d63518";
const SOL = "linear-gradient(90deg, #ffe47a 0%, #ffd77a 25%, #ffc17b 55%, #ffa876 100%)";

/*
  Poppins Bold, la tipografía de los titulares del sitio. Se pide a Google
  Fonts solo con las letras que se usan. Si la red falla al construir, la
  imagen sale igual con la letra por defecto: mejor una tipografía genérica
  que un sitio que no se publica.
*/
async function poppins(texto: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=Poppins:wght@700&text=${encodeURIComponent(texto)}`,
      )
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url);
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image() {
  const rotulo = HERO.badge.toUpperCase();
  const pie = `${MARCA.nombre} · suniproject.com`;

  const [sol, fuente] = await Promise.all([
    readFile(join(process.cwd(), "public/media/sunni/personaje-sol.png")),
    poppins(`${rotulo}${HERO.titulo}${HERO.tituloAcento}${HERO.tituloFin}${pie}`),
  ]);
  const solSrc = `data:image/png;base64,${sol.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: CREAM,
          fontFamily: fuente ? "Poppins" : undefined,
        }}
      >
        <div style={{ height: 14, width: "100%", backgroundImage: SOL }} />

        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 64px 0 80px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{ width: 56, height: 5, borderRadius: 99, backgroundImage: SOL, marginRight: 18 }} />
              <div style={{ fontSize: 24, fontWeight: 700, color: CORAL_INK, letterSpacing: 5 }}>{rotulo}</div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: 30,
                fontSize: 84,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: -3,
                color: INK,
                maxWidth: 700,
              }}
            >
              {/* Palabra por palabra, con el hueco como margen: un espacio
                  dentro del texto se queda al principio de la línea cuando
                  el titular salta de renglón. */}
              {[
                ...HERO.titulo.split(" ").map((p) => ({ p, acento: false })),
                ...HERO.tituloAcento.split(" ").map((p) => ({ p, acento: true })),
                ...HERO.tituloFin.split(" ").map((p) => ({ p, acento: false })),
              ].map(({ p, acento }, i) => (
                <span key={i} style={{ marginRight: 22, color: acento ? CORAL : INK }}>
                  {p}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 40, fontSize: 28, color: GRAY }}>{pie}</div>
          </div>

          {/* 506×560, la proporción del archivo: el personaje entero, sin recortar. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={solSrc} width={343} height={380} alt="" />
        </div>
      </div>
    ),
    {
      ...size,
      ...(fuente ? { fonts: [{ name: "Poppins", data: fuente, weight: 700 as const, style: "normal" as const }] } : {}),
    },
  );
}
