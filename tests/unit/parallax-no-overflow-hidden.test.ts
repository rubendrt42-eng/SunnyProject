import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Ningún elemento con movimiento ligado al scroll puede vivir dentro de un
 * `overflow-hidden`.
 *
 * POR QUÉ EXISTE
 *
 * Todos los parallax del sitio estuvieron congelados desde que se escribieron.
 * La foto de Emmy, las fotografías de las tarjetas de experiencia y el hero: la
 * animación existía, el navegador la reportaba como `running`, y su tiempo
 * nunca avanzaba. Se quedaba clavada a mitad de recorrido.
 *
 * LA CAUSA
 *
 * `animation-timeline: view()` mide el avance contra el **contenedor de scroll
 * más cercano**. `overflow: hidden` convierte un elemento en contenedor de
 * scroll aunque nunca se desplace. Así que una caja `overflow-hidden` —puesta
 * para recortar la foto al redondeo de la tarjeta, que es su uso obvio y
 * correcto en cualquier otro contexto— dejaba a la animación midiéndose contra
 * algo que no se mueve. Progreso constante, animación inmóvil.
 *
 * `overflow: clip` recorta exactamente igual, respeta el redondeo, y **no**
 * crea contenedor de scroll.
 *
 * POR QUÉ ESTA PRUEBA LEE EL CÓDIGO
 *
 * Porque el fallo no lanza ningún error, no rompe el layout, no sale en la
 * consola y no lo detecta ninguna prueba de renderizado: se ve idéntico a una
 * página donde el parallax simplemente es muy sutil. La única señal era medir
 * `currentTime` durante un scroll real. Un `overflow-hidden` reintroducido en
 * cualquiera de estos archivos volvería a apagarlo en silencio.
 */
const ARCHIVOS_CON_MOVIMIENTO = [
  "components/lean/LeanHero.tsx",
  "components/lean/ExperienceCard.tsx",
  "components/lean/BrandCanvas.tsx",
  "components/home/WhatIsSunny.tsx",
  "app/experiencias/[slug]/page.tsx",
];

describe("el movimiento ligado al scroll no vive dentro de contenedores de scroll", () => {
  for (const archivo of ARCHIVOS_CON_MOVIMIENTO) {
    it(`${archivo} recorta con overflow-clip, no con overflow-hidden`, () => {
      // Se quitan los comentarios antes de buscar: estos archivos explican por
      // escrito por qué NO usan `overflow-hidden`, y esas menciones no son
      // código. Se sustituyen por espacios para no mover los números de línea.
      const fuente = readFileSync(archivo, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
        .replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));

      const lineas = fuente
        .split("\n")
        .map((linea, i) => ({ n: i + 1, linea }))
        .filter(({ linea }) => /\boverflow-hidden\b/.test(linea));

      expect(
        lineas,
        `overflow-hidden crea un contenedor de scroll y congela las animaciones ` +
          `de \`animation-timeline: view()\` que haya dentro. Usa overflow-clip.\n` +
          lineas.map(({ n, linea }) => `  ${archivo}:${n}  ${linea.trim()}`).join("\n"),
      ).toEqual([]);
    });
  }
});
