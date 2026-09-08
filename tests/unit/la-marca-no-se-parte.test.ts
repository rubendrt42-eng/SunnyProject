import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * NINGUNA PALABRA CON GUION PUEDE PARTIRSE A MITAD DE LÍNEA.
 *
 * QUÉ PASABA
 *
 * El navegador trata el guion como un sitio válido para cortar, así que el
 * nombre de la marca se rompía solo. Medido: a 240 px de ancho, «Donde la vida
 * sucede, Sun-i pertenece» dejaba «Sun-» al final de una línea y «i pertenece»
 * al principio de la siguiente. La marca se leía como dos cosas.
 *
 * Lo mismo con «micro-momentos», «self-care» y «Co-branding».
 *
 * LA SOLUCIÓN, Y POR QUÉ ESTA
 *
 * El guion duro U+2011 (‑) prohíbe el corte. Se comparó contra las otras dos
 * opciones y gana por una razón concreta: `white-space: nowrap` solo funciona
 * donde hay marcado, y el nombre de la marca también viaja por sitios que son
 * texto plano —el `<title>`, la descripción de Google, el mensaje de WhatsApp
 * al compartir, el texto alternativo de las imágenes—. El guion duro los
 * protege todos.
 *
 * Se verificó que Poppins y DM Sans lo dibujan idéntico al guion normal, así
 * que no hay diferencia visible.
 *
 * DÓNDE NO VA
 *
 * En el nombre de la pestaña de Google Sheets, que tiene que seguir siendo
 * exactamente «Sun-i» con guion normal: cambiarlo crearía una pestaña nueva y
 * los contactos se partirían en dos sitios.
 */
const DURO = "‑";

/** Archivos con texto que se dibuja en pantalla. */
const RUTAS = [
  "lib/sunni-content.ts",
  "lib/lean-content.ts",
  "app/page.tsx",
  "components/site/Wordmark.tsx",
  "components/site/Header.tsx",
  "components/lean/SunniModal.tsx",
  "components/lean/SunniCTA.tsx",
];

/** Los comentarios explican la marca; no se dibujan y pueden usar guion normal. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

describe("la marca no se parte a mitad de línea", () => {
  it("el nombre usa guion duro en todo el texto que se dibuja", () => {
    const infracciones: string[] = [];

    for (const ruta of RUTAS) {
      if (!existsSync(ruta)) continue;
      const fuente = sinComentarios(readFileSync(ruta, "utf8"));
      for (const linea of fuente.split("\n")) {
        // La etiqueta de accesibilidad no se maqueta: no puede partirse.
        if (linea.includes("aria-label")) continue;
        if (linea.includes("Sun-i")) infracciones.push(`${ruta}: ${linea.trim().slice(0, 80)}`);
      }
    }

    expect(
      infracciones,
      `«Sun-i» con guion normal se parte solo: a 240 px deja «Sun-» arriba e ` +
        `«i» abajo. Usa «Sun${DURO}i» (guion duro U+2011).\n` +
        infracciones.map((i) => `  ${i}`).join("\n"),
    ).toEqual([]);
  });

  it("la pestaña de la hoja conserva el guion normal", () => {
    // Si esto cambia, Google Sheets crea una pestaña nueva y los contactos se
    // reparten entre dos sitios sin que nadie se entere.
    const sheets = readFileSync("lib/sheets.ts", "utf8");
    expect(sheets, "el nombre de la pestaña dejó de ser exactamente «Sun-i»").toContain('sunni: "Sun-i"');
  });

  it("ninguna otra palabra con guion queda expuesta al corte", () => {
    const expuestas = ["micro-momentos", "self-care", "Co-branding", "Micro-workouts"];
    const infracciones: string[] = [];

    for (const ruta of RUTAS) {
      if (!existsSync(ruta)) continue;
      const fuente = sinComentarios(readFileSync(ruta, "utf8"));
      for (const palabra of expuestas) {
        if (fuente.includes(palabra)) infracciones.push(`${ruta}: ${palabra}`);
      }
    }

    expect(
      infracciones,
      "Estas palabras se parten por el guion. Usa guion duro, o quítalo si el " +
        "español no lo pide («micromomentos» se escribe junto).\n" +
        infracciones.map((i) => `  ${i}`).join("\n"),
    ).toEqual([]);
  });
});
