import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Con el tamaño de texto del navegador al 200%, ninguna página puede obligar a
 * desplazarse en horizontal (WCAG 1.4.4).
 *
 * QUÉ PASABA
 *
 * Medido con la raíz a 32px, en las siete rutas públicas:
 *
 *     320px  documento 387px  ->  la marca del encabezado, 347px, sin poder
 *                                 encogerse ni partirse
 *     320px  documento 359px  ->  «Explorar experiencias», 319px, en un botón
 *                                 que se dimensiona a su contenido
 *     320px  documento 335px  ->  «Preguntas frecuentes» saliéndose de una
 *                                 columna del pie de 88px
 *     768px  documento 944px  ->  once huecos de rejilla de 80px dentro de un
 *                                 contenedor de 640px
 *
 * Las tres primeras eran cajas sin salida: se les prohibía encogerse **y**
 * partirse a la vez. La cuarta era un hueco en `rem`, que se duplica con el
 * texto aunque el contenedor no.
 *
 * QUÉ PROTEGE
 *
 * Cada una de las cuatro decisiones. No mide anchos —eso necesita un navegador
 * de verdad y la suite corre en jsdom— sino las reglas que los producen, que es
 * lo que alguien podría deshacer sin darse cuenta al retocar estilos.
 */
function leer(ruta: string) {
  return readFileSync(ruta, "utf8");
}

/** Quita comentarios sin mover los números de línea. */
function soloCodigo(fuente: string) {
  return fuente
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
}

describe("el texto al 200% no rompe el ancho", () => {
  it("la marca del encabezado puede partirse si no cabe", () => {
    const fuente = soloCodigo(leer("components/site/HeaderInteractive.tsx"));
    const marca = fuente.split("\n").find((l) => l.includes("font-serif") && l.includes("shrink-0"));

    expect(marca, "ya no se encuentra la clase de la marca en el encabezado").toBeDefined();
    expect(
      marca,
      "prohibir encoger y prohibir partir a la vez deja al nombre sin salida cuando el texto crece",
    ).not.toContain("whitespace-nowrap");
    expect(marca, "sin tope de ancho vuelve a empujar el documento").toContain("max-w-full");
  });

  it("los botones se topan al ancho disponible y crecen a lo alto", () => {
    const fuente = soloCodigo(leer("components/ui/Button.tsx"));

    expect(fuente, "el botón se dimensiona a su contenido: sin tope, se sale").toContain("max-w-full");

    // Alturas fijas: cortarían una etiqueta de dos líneas.
    const alturasFijas = fuente
      .split("\n")
      .filter((l) => /\b(sm|md|lg):\s*"/.test(l))
      .filter((l) => /["\s]h-(\d|\[)/.test(l));

    expect(alturasFijas, `altura fija en un botón: ${alturasFijas.join(" | ")}`).toEqual([]);
  });

  it("los enlaces sueltos pueden partir una palabra larga", () => {
    const css = leer("app/globals.css");
    const regla = css.match(/(?:^|\n)((?:[a-z0-9]+,\s*\n)*a)\s*\{\s*\n\s*overflow-wrap:\s*anywhere/);

    expect(
      regla,
      "sin `a` en la regla, un enlace que no está dentro de un p o un li no hereda el ajuste",
    ).not.toBeNull();
  });

  it("el hueco de la rejilla de «Cómo funciona» no escala con el texto", () => {
    const fuente = soloCodigo(leer("app/como-funciona/page.tsx"));
    const rejilla = fuente.split("\n").find((l) => l.includes("sm:grid-cols-12"));

    expect(rejilla, "ya no se encuentra la rejilla de los pasos").toBeDefined();
    expect(
      rejilla,
      "once huecos en rem dentro de una rejilla de 12 columnas se duplican con el texto y desbordan",
    ).not.toMatch(/sm:gap-\d/);
  });
});
