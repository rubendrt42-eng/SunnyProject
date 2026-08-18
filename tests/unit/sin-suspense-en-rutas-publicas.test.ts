import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Las páginas públicas no pueden depender de JavaScript para mostrar su texto.
 *
 * QUÉ PASÓ
 *
 * Había un `app/loading.tsx` en la raíz. En el App Router, ese archivo envuelve
 * **todas** las rutas en un límite de Suspense, y Next sirve primero el
 * esqueleto con el `loading` dentro y manda el contenido después, en el mismo
 * documento pero dentro de un contenedor oculto que un script coloca en su
 * sitio al llegar.
 *
 * Con JavaScript activado no se nota: el intercambio ocurre en milisegundos.
 * Sin JavaScript, el intercambio nunca ocurre y la página se queda en el
 * spinner. Medido sobre la portada publicada:
 *
 *     con JavaScript ..... 2996 caracteres de texto (titular, tarjetas, todo)
 *     sin JavaScript .....  365 caracteres (cabecera, «Cargando…» y pie)
 *
 * POR QUÉ NO LO DETECTÓ LA COMPROBACIÓN ANTERIOR
 *
 * La comprobación que ya existía cuenta apariciones de `opacity:0` en el HTML
 * del servidor. Eso cubre un fallo distinto —contenido presente pero
 * invisible— y aquí el contenido directamente no estaba en el flujo del
 * documento. Un `opacity:0` de cero no dice nada sobre esto.
 *
 * POR QUÉ NINGUNA RUTA PÚBLICA DEL MVP NECESITA `loading.tsx`
 *
 * Todas son estáticas o ISR: se sirven ya renderizadas desde la caché, así que
 * no hay espera que amortiguar. El archivo estaba pagando un coste real —la
 * página sin JavaScript— a cambio de un estado de carga que nunca se ve.
 */
const SEGMENTOS_PUBLICOS = [
  "app",
  "app/experiencias",
  "app/experiencias/[slug]",
  "app/como-funciona",
  "app/para-negocios",
  "app/preguntas-frecuentes",
  "app/privacidad",
];

describe("las rutas públicas se renderizan enteras en el servidor", () => {
  for (const segmento of SEGMENTOS_PUBLICOS) {
    it(`${segmento} no tiene loading.tsx`, () => {
      const ruta = join(segmento, "loading.tsx");
      expect(
        existsSync(ruta),
        `${ruta} envolvería esta ruta en un límite de Suspense y su contenido ` +
          `dejaría de estar en el HTML del servidor: sin JavaScript se vería ` +
          `solo el estado de carga.`,
      ).toBe(false);
    });
  }

  it("no aparece ningún loading.tsx nuevo en app/", () => {
    const encontrados: string[] = [];
    const recorrer = (dir: string) => {
      for (const entrada of readdirSync(dir)) {
        const ruta = join(dir, entrada);
        if (statSync(ruta).isDirectory()) recorrer(ruta);
        else if (entrada === "loading.tsx") encontrados.push(ruta);
      }
    };
    recorrer("app");

    // Las rutas privadas (admin, cuenta) están fuera del MVP y redirigidas: si
    // algún día vuelven, sí pueden tener su propio estado de carga. Lo que no
    // puede volver es uno que cubra las públicas.
    const enPublicas = encontrados.filter((r) => !/^app\/(admin|auth|mi-|historial)/.test(r));
    expect(enPublicas, `loading.tsx en rutas públicas: ${enPublicas.join(", ")}`).toEqual([]);
  });
});
