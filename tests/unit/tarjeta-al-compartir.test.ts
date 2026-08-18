import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Compartir una experiencia tiene que producir una tarjeta con imagen.
 *
 * QUÉ PASABA
 *
 * La página de experiencia declara su propio bloque `openGraph`, y los
 * metadatos de Next se combinan de forma **superficial**: si un segmento
 * declara `openGraph`, reemplaza entero el del layout raíz, imagen incluida.
 * Como la imagen se ponía solo `experience.image ? [...] : []`, y hoy ninguna
 * experiencia tiene fotografía, el resultado era `og:image` ausente.
 *
 * Es decir: el botón «Compartir» que manda la experiencia por WhatsApp
 * mandaba un enlace pelón. Medido en producción: `og:image` presente en las
 * seis páginas fijas y ausente en la de experiencia — la única que se
 * comparte.
 *
 * QUÉ PROTEGE
 *
 * 1. Que exista la tarjeta generada para `[slug]`.
 * 2. Que la página no vuelva a declarar una lista de imágenes vacía.
 * 3. Que la tarjeta espere `params`, que es una promesa en esta convención de
 *    archivo. Sin el `await`, `params.slug` sale `undefined`, todas las
 *    experiencias comparten la misma tarjeta genérica y no falla nada: se ve
 *    igual de bien, solo que dice lo que no es.
 */
const TARJETA = "app/experiencias/[slug]/opengraph-image.tsx";
const PAGINA = "app/experiencias/[slug]/page.tsx";

describe("la tarjeta que se manda al compartir una experiencia", () => {
  it("existe una imagen generada para la ruta de experiencia", () => {
    expect(existsSync(TARJETA), `falta ${TARJETA}`).toBe(true);
  });

  it("la página no declara una lista de imágenes vacía", () => {
    const fuente = readFileSync(PAGINA, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");

    expect(
      /images:\s*\[\s*\]/.test(fuente),
      "`images: []` no hereda la imagen del layout: la borra. Omite `images` " +
        "cuando no haya fotografía para que entre `opengraph-image.tsx`.",
    ).toBe(false);
  });

  it("la tarjeta espera `params` antes de usar el slug", () => {
    // Sin comentarios: el archivo explica por escrito el fallo que evita, y esa
    // explicación menciona `params.slug` sin ser código.
    const fuente = readFileSync(TARJETA, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");

    expect(/await\s+params/.test(fuente), "`params` es una promesa: sin `await`, el slug sale undefined").toBe(true);
    expect(
      /params\.slug/.test(fuente.replace(/const\s*\{\s*slug\s*\}\s*=\s*await\s+params/, "")),
      "no leas `params.slug` directamente; desestructura tras el `await`",
    ).toBe(false);
  });
});
