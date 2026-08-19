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
 * 4. Que el título y el anfitrión lleven tope. Son texto que escribe Emmy y el
 *    esquema no los limita; renderizados tal cual se comían la tarjeta entera.
 *
 * EL DESBORDE DE LA TARJETA
 *
 * Renderizada con un título de 130 caracteres que incluía una palabra de 63
 * letras, la tarjeta salía rota de dos maneras a la vez: la palabra larga se
 * cortaba contra el borde derecho a media palabra, y las cinco líneas de título
 * empujaban la fecha contra el borde de arriba y la línea del anfitrión contra
 * el de abajo, donde también se cortaba.
 *
 * Un título de 96 caracteres con palabras normales cabe de sobra —tres líneas—
 * y su tarjeta sale byte a byte idéntica antes y después del arreglo. Esto es
 * robustez para el caso raro, no un cambio de aspecto.
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

describe("un título larguísimo no rompe la tarjeta", () => {
  const fuente = readFileSync(TARJETA, "utf8");

  it("el título y el anfitrión se recortan antes de dibujarse", () => {
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

    expect(codigo, "el título vuelve a dibujarse sin tope de longitud").toMatch(
      /const titulo = recortar\(/,
    );
    expect(codigo, "el anfitrión vuelve a dibujarse sin tope de longitud").toMatch(
      /const anfitrion = .*recortar\(/,
    );
  });

  it("una palabra más ancha que la caja se parte en vez de salirse", () => {
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
    const veces = codigo.match(/wordBreak:\s*"break-word"/g) ?? [];

    // Los dos bloques de texto variable: el título y la línea del anfitrión.
    expect(veces.length, "falta el corte de palabra en alguno de los textos variables").toBe(2);
  });

  it("el tamaño del título baja cuando el texto es largo", () => {
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

    // Al menos dos cortes: si solo hay uno, un título largo vuelve a ocupar
    // cinco líneas antes de que el tamaño reaccione.
    const cortes = codigo.match(/titulo\.length > \d+/g) ?? [];
    expect(cortes.length, `solo hay ${cortes.length} escalón de tamaño`).toBeGreaterThanOrEqual(2);
  });
});
