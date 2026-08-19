import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Con el catálogo vacío, ninguna pantalla puede anunciar inventario.
 *
 * QUÉ PASABA
 *
 * Renderizando la portada sin ninguna experiencia vigente —la semana en que
 * todavía no hay nada publicado, o en que todo ya pasó— la sección decía:
 *
 *     Esta semana
 *     Planes para moverte, recuperarte, conectar y probar algo diferente.
 *     Próximamente nuevas experiencias
 *     Estamos cerrando las próximas fechas [...] Vuelve en unos días.
 *
 * El antetítulo prometía que había algo esta semana y el bloque de abajo lo
 * desmentía cuatro líneas después, en la misma pantalla. El catálogo ya
 * condicionaba su titular por este mismo motivo; la portada no.
 *
 * QUÉ PROTEGE
 *
 * Que las dos páginas sigan mirando la lista antes de hablar de ella. No
 * comprueba la redacción exacta —eso cambia— sino que el texto dependa del
 * número de experiencias.
 */
function leer(ruta: string) {
  return readFileSync(ruta, "utf8");
}

function soloCodigo(fuente: string) {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
}

describe("sin experiencias, nadie promete que las hay", () => {
  it("el antetítulo de la portada depende de que haya lista", () => {
    const fuente = soloCodigo(leer("app/page.tsx"));
    const linea = fuente.split("\n").find((l) => l.includes('className="eyebrow"'));

    expect(linea, "ya no se encuentra el antetítulo de la sección semanal").toBeDefined();
    expect(
      linea,
      `«${linea?.trim()}» anuncia la semana sin mirar si hay algo publicado`,
    ).toMatch(/experiences\.length/);
  });

  it("el titular del catálogo depende de que haya lista", () => {
    const fuente = soloCodigo(leer("app/experiencias/page.tsx"));

    expect(fuente, "el catálogo dejó de distinguir el caso vacío").toMatch(
      /experiences\.length > 0\s*\n?\s*\?/,
    );
  });

  it("el bloque de lista vacía sigue existiendo y no inventa fecha", () => {
    const contenido = leer("components/lean/ExperienceGrid.tsx");
    const vacio = contenido.match(/Próximamente nuevas experiencias[\s\S]{0,260}/)?.[0] ?? "";

    expect(vacio, "desapareció el texto de catálogo vacío").not.toBe("");
    // Prometer un día concreto es una promesa que el sistema no puede cumplir.
    expect(vacio).not.toMatch(/\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b/i);
    expect(vacio).not.toMatch(/\b\d{1,2}\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
  });
});
