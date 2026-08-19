import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Ningún recuento puede llamar «disponible» a una experiencia agotada.
 *
 * QUÉ PASABA
 *
 * El catálogo decía «2 experiencias disponibles» contando todo lo publicado, y
 * justo debajo pintaba las dos tarjetas: una con la etiqueta «Disponible» y la
 * otra con «Agotada». La misma pantalla se contradecía a sí misma, con la misma
 * palabra, a cinco centímetros de distancia. Medido en el catálogo con el
 * contenido real de Sanity —una experiencia `available` y una `sold_out`—.
 *
 * El contador del hero tenía el mismo defecto y solo se salvaba por no llegar
 * al mínimo de tres para mostrarse.
 *
 * QUÉ PROTEGE
 *
 * Las dos mitades del arreglo:
 *
 *   - el hero recibe un número ya filtrado, porque ahí la palabra «disponibles»
 *     forma parte de la frase y tiene que ser cierta;
 *   - el catálogo no promete disponibilidad en el total, porque su lista
 *     incluye a propósito las agotadas. La disponibilidad la lleva cada
 *     tarjeta, que es donde es exacta.
 *
 * Se lee el código y no el render porque `app/page.tsx` es un componente de
 * servidor asíncrono: montarlo en una prueba exigiría simular Sanity entero
 * para comprobar una sola decisión de una línea.
 */
function leer(ruta: string) {
  return readFileSync(ruta, "utf8");
}

describe("los recuentos no cuentan las agotadas como disponibles", () => {
  it("la portada le pasa al hero solo las que se pueden solicitar", () => {
    const fuente = leer("app/page.tsx");
    const linea = fuente.split("\n").find((l) => l.includes("experienceCount="));

    expect(linea, "app/page.tsx ya no le pasa experienceCount al hero").toBeDefined();
    expect(
      linea,
      `«${linea?.trim()}» cuenta también las agotadas, y el hero dice «disponibles»`,
    ).toContain("sold_out");
  });

  it("el catálogo no llama «disponibles» al total que enseña", () => {
    const fuente = leer("app/experiencias/page.tsx");

    // Solo el cuerpo del componente: los comentarios explican justamente por
    // qué no se dice, y el `description` de arriba es el resumen para buscadores,
    // no el texto que la persona lee sobre la lista.
    const cuerpo = fuente
      .slice(fuente.indexOf("export default"))
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    expect(cuerpo, "el total del catálogo vuelve a prometer disponibilidad").not.toMatch(
      /experiencias?\s+disponibles?/i,
    );
  });

  it("la tarjeta sigue distinguiendo agotada de disponible", () => {
    const fuente = leer("components/lean/ExperienceCard.tsx");
    expect(fuente).toMatch(/agotada \? "Agotada" : "Disponible"/);
  });
});
