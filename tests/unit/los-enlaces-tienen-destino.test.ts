import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { portadaConSanity, PORTADA_POR_DEFECTO } from "@/lib/sunni-content";

/**
 * «VER SUN-I VENDING» TIENE QUE LLEVAR A ALGUNA PARTE.
 *
 * QUÉ PASÓ
 *
 * Los dos bloques de «Hoy Sun‑i llega de dos maneras» llevan un enlace cada
 * uno, y su destino (`ancla`) vive solo en el código: es estructura, no
 * contenido, igual que los destinos del menú y del pie.
 *
 * Al abrir esos bloques a edición en Sanity, la consulta pidió los cuatro
 * campos de texto y no `ancla` —correcto, no se edita—. Pero la mezcla
 * sustituye los ARRAYS ENTEROS, no campo por campo: en cuanto Sanity tuvo los
 * dos bloques, el array del código desapareció con el destino dentro.
 *
 * El resultado era `<a>` sin `href`. No es un enlace que lleva mal: es un
 * texto que parece enlace, no navega, no se alcanza con el tabulador y un
 * lector de pantalla no lo anuncia como enlace. Sin un solo error en consola.
 *
 * Lo encontró el cliente pulsándolo. Las pruebas de accesibilidad miraban
 * `a[href*="#"]` —que por definición no podía incluirlo— y daban verde.
 *
 * POR QUÉ ESTA PRUEBA
 *
 * Porque el fallo no está en el componente ni en la consulta por separado,
 * sino en lo que pasa cuando se juntan. Se comprueba justo eso: lo que sale
 * de la mezcla cuando Sanity manda contenido sin destinos.
 */
describe("los enlaces de la portada llevan a alguna parte", () => {
  it("conserva el destino aunque Sanity mande los bloques sin él", () => {
    // Exactamente lo que devuelve la consulta: los textos, ningún destino.
    const deSanity = {
      queHacemos: {
        titulo: "Un titular nuevo",
        bloques: [
          { rotulo: "Sun‑i Vending", titulo: "A", texto: "B", enlace: "Ver A" },
          { rotulo: "Sun‑i Experiences", titulo: "C", texto: "D", enlace: "Ver C" },
        ],
      },
    };

    const portada = portadaConSanity(deSanity as never);

    expect(portada.queHacemos.titulo, "el texto de Sanity sí debe mandar").toBe("Un titular nuevo");
    portada.queHacemos.bloques.forEach((b, i) => {
      expect(b.ancla, `el bloque ${i} («${b.enlace}») se quedó sin destino`).toBeTruthy();
      expect(b.ancla, `el destino del bloque ${i} no apunta a una sección`).toMatch(/^#/);
    });
    expect(portada.queHacemos.bloques.map((b) => b.ancla)).toEqual(
      PORTADA_POR_DEFECTO.queHacemos.bloques.map((b) => b.ancla),
    );
  });

  it("también cuando Sanity está vacío", () => {
    for (const vacio of [null, undefined, {}]) {
      const portada = portadaConSanity(vacio as never);
      for (const b of portada.queHacemos.bloques) expect(b.ancla).toMatch(/^#/);
    }
  });

  it("cada destino apunta a una sección que existe en la portada", () => {
    const pagina = readFileSync("app/page.tsx", "utf8");
    for (const b of portadaConSanity(null).queHacemos.bloques) {
      const id = b.ancla.replace("#", "");
      expect(pagina, `no hay ninguna sección con id="${id}"`).toContain(`id="${id}"`);
    }
  });
});
