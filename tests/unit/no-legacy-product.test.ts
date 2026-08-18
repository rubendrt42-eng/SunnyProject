import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * El sitio público no puede describir el producto anterior.
 *
 * POR QUÉ EXISTE
 *
 * La auditoría encontró cuatro páginas publicadas —y enlazadas desde el menú y
 * el pie— que hablaban de pase semanal, folios, cuentas de usuario,
 * reservaciones y cancelación con doce horas de antelación. Nada de eso existe
 * en este MVP. Alguien leía en la portada «solicita tu lugar y te confirmamos»
 * y a un clic encontraba otro producto.
 *
 * Es una clase de fallo que no rompe ningún build: el sitio compila, se
 * despliega y se ve bien. Solo está mal escrito. Por eso hace falta una prueba
 * que lo vigile, y no basta con haberlo arreglado una vez.
 *
 * QUÉ VIGILA Y QUÉ NO
 *
 * Solo lo alcanzable por un visitante: rutas vivas y los componentes que
 * dibujan. Los archivos de la versión avanzada siguen en el repositorio a
 * propósito —la segunda etapa los necesita— y esta prueba no los mira.
 *
 * Se saltan los comentarios: explicar en el código por qué se quitó la palabra
 * «folio» exige escribir la palabra «folio».
 */

/** Archivos que un visitante puede acabar viendo. */
const SUPERFICIE_PUBLICA = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/experiencias/page.tsx",
  "app/experiencias/[slug]/page.tsx",
  "app/como-funciona/page.tsx",
  "app/para-negocios/page.tsx",
  "app/preguntas-frecuentes/page.tsx",
  "app/privacidad/page.tsx",
  "components/site/Header.tsx",
  "components/site/HeaderInteractive.tsx",
  "components/site/Footer.tsx",
  "components/site/FaqList.tsx",
  "components/home/WhatIsSunny.tsx",
  "components/home/CommunitySection.tsx",
  "lib/lean-content.ts",
  ...readdirSync("components/lean")
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => join("components/lean", f)),
];

/**
 * Vocabulario del producto anterior.
 *
 * «crear una cuenta» NO está en la lista: la pregunta frecuente «¿Necesito
 * crear una cuenta?» es correcta y necesaria — responde que no. Prohibir la
 * frase obligaría a no poder negarla.
 */
const PROHIBIDO = [
  /pase semanal/i,
  /mi pase/i,
  /\bfolios?\b/i,
  /reservaci[oó]n/i,
  /\breservar\b/i,
  /membres[ií]a/i,
  /iniciar sesi[oó]n/i,
  /proyecto de demostraci[oó]n/i,
  /12 horas antes/i,
  /lugares disponibles/i,
];

/** Datos de contacto inventados que llegaron a estar publicados. */
const CONTACTOS_FALSOS = [/@sunnyproject\.mx/i, /hola@sunnyproject\.mx/i];

/** Quita comentarios de línea y de bloque antes de buscar. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
}

describe("el sitio público no describe el producto anterior", () => {
  for (const ruta of SUPERFICIE_PUBLICA) {
    it(`${ruta} usa el lenguaje del MVP`, () => {
      const fuente = sinComentarios(readFileSync(ruta, "utf8"));
      for (const patron of PROHIBIDO) {
        expect(patron.test(fuente), `${ruta} contiene ${patron}`).toBe(false);
      }
    });
  }

  it("ninguna superficie pública publica datos de contacto inventados", () => {
    // También sin comentarios: el pie explica en una nota qué direcciones se
    // quitaron y por qué, y esa nota tiene que poder nombrarlas.
    for (const ruta of SUPERFICIE_PUBLICA) {
      const fuente = sinComentarios(readFileSync(ruta, "utf8"));
      for (const patron of CONTACTOS_FALSOS) {
        expect(patron.test(fuente), `${ruta} contiene ${patron}`).toBe(false);
      }
    }
  });

  it("no queda ninguna página de términos publicada", () => {
    // Describía reglas inexistentes y no hay política validada que la sustituya.
    // Se retira hasta que exista; ver next.config.ts.
    expect(() => statSync("app/terminos/page.tsx")).toThrow();
  });

  it("las rutas de la versión avanzada están bloqueadas fuera del runtime público", () => {
    const config = readFileSync("next.config.ts", "utf8");
    for (const ruta of ["/acceso", "/mi-pase", "/mi-cuenta", "/historial", "/admin", "/terminos"]) {
      expect(config, `${ruta} debe redirigir`).toContain(`"${ruta}"`);
    }

    // Las redirecciones cubren páginas, no endpoints. Los de la versión
    // avanzada se cierran en proxy.ts, que responde 404.
    const proxy = readFileSync("proxy.ts", "utf8");
    for (const api of ["/api/admin/:path*", "/api/reservations/:path*", "/api/partner-leads"]) {
      expect(proxy, `${api} debe estar en el matcher`).toContain(api);
    }
    expect(proxy).toContain("status: 404");
  });
});
