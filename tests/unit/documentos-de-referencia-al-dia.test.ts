import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Los tres documentos de referencia no pueden afirmar cosas que ya no ocurren.
 *
 * QUÉ PASABA
 *
 * `MVP_AUDIT_PACKAGE.md`, `qa/VISUAL_AUDIT.md` y `qa/RESPONSIVE_AUDIT.md` son las
 * referencias obligatorias del proyecto: lo que alguien lee para saber en qué
 * estado está el sitio. Se escribieron el 18 de agosto y no se habían tocado en
 * 32 commits, así que describían un sitio que ya no existe:
 *
 *     decían                              se mide hoy
 *     ------------------------------      -----------------------------
 *     /api/solicitudes responde 502       responde 503
 *     el HTML nace con opacity:0 (P1)     0 apariciones en las 7 rutas
 *     155 pruebas                         282
 *     «2 experiencias disponibles»        «2 experiencias»
 *     heading-order en /experiencias      axe: 0 violaciones
 *     desborde de 41 px a 768             scrollWidth 768 = clientWidth
 *
 * Un documento de estado que miente sobre el estado es peor que no tenerlo:
 * manda a arreglar lo que ya está arreglado y da por bueno lo que no.
 *
 * QUÉ PROTEGE
 *
 * Los hechos que hoy son verificables y que estos documentos afirmaban al revés.
 * No revisa la redacción ni el juicio de diseño —eso es criterio, no dato— sino
 * los números y códigos concretos que se pueden contrastar con el código.
 */
const PAQUETE = "MVP_AUDIT_PACKAGE.md";
const VISUAL = "qa/VISUAL_AUDIT.md";
const RESPONSIVE = "qa/RESPONSIVE_AUDIT.md";

function leer(ruta: string) {
  return readFileSync(ruta, "utf8");
}

describe("los documentos de referencia describen el sitio que existe", () => {
  it("no dicen que el formulario responda 502", () => {
    const paquete = leer(PAQUETE);

    // 502 solo puede aparecer como historia: o la línea explica que antes lo era,
    // o contrapone el 502 viejo con el 503 de hoy. Nunca a secas.
    const comoEstado = paquete
      .split("\n")
      .filter((l) => /\b502\b/.test(l))
      .filter((l) => !/era 502|Era 502|se reserva|pasajero/.test(l))
      .filter((l) => !/\b503\b/.test(l));

    expect(comoEstado, `líneas que aún dan 502 por vigente:\n${comoEstado.join("\n")}`).toEqual([]);
  });

  it("el código real responde 503 cuando falta la hoja", () => {
    // El ancla del documento: si esto cambia, el documento vuelve a mentir.
    const ruta = leer("app/api/solicitudes/route.ts");
    expect(ruta).toMatch(/SheetsNotConfiguredError[\s\S]{0,400}status:\s*503/);
  });

  it("no dan por abierto el hallazgo del contenido invisible", () => {
    for (const [nombre, doc] of [
      [PAQUETE, leer(PAQUETE)],
      [VISUAL, leer(VISUAL)],
    ] as const) {
      const i = doc.indexOf("MOTION-01");
      expect(i, `${nombre} ya no menciona MOTION-01`).toBeGreaterThan(-1);
      expect(
        doc.slice(i, i + 700),
        `${nombre} sigue presentando MOTION-01 como abierto`,
      ).toMatch(/CERRADO|cerrado/);
    }
  });

  it("no dan por abierto el desborde de 768 px", () => {
    const doc = leer(RESPONSIVE);
    const i = doc.indexOf("RESP-01 · El único desborde real");
    expect(i, "desapareció RESP-01").toBeGreaterThan(-1);
    expect(doc.slice(i, i + 400), "RESP-01 sigue presentándose como abierto").toMatch(/CERRADO/);
  });

  it("los tres llevan nota de vigencia con fecha", () => {
    for (const ruta of [PAQUETE, VISUAL, RESPONSIVE]) {
      expect(leer(ruta), `${ruta} no dice desde cuándo vale lo que cuenta`).toMatch(
        /Nota de vigencia — \d{1,2} de \w+ de \d{4}/,
      );
    }
  });
});
