import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * El MVP lean no depende de Supabase. Esta prueba lo hace cumplir.
 *
 * POR QUÉ EXISTE
 *
 * El layout raíz tenía una condición que, si faltaban las credenciales de
 * Supabase, sustituía **el sitio entero** por una pantalla de «Falta configurar
 * Supabase». Sobrevivió a toda la conversión al MVP lean y tumbó la portada en
 * el primer despliegue limpio.
 *
 * No se detectó antes porque las comprobaciones locales corrían con un
 * `.env.local` que sí tenía esas credenciales, heredado del trabajo sobre la
 * versión avanzada. El entorno de desarrollo tenía justo las variables que el
 * MVP no debe necesitar, así que la condición siempre daba verdadero y la
 * pantalla nunca aparecía. Un build verde no probaba nada.
 *
 * De ahí que esta prueba lea el código fuente en vez de renderizar: una prueba
 * que ejecuta la aplicación hereda las variables del entorno donde corre, y ese
 * es exactamente el agujero por el que se coló el fallo. El texto de un archivo
 * no depende de quién lo ejecute.
 *
 * El layout raíz importa por partida doble: lo que se pone ahí corre en
 * **todas** las rutas. Una condición ahí no es una precaución local, es una
 * llave de paso de todo el sitio.
 */

/** Archivos que se ejecutan al servir cualquier página pública del MVP. */
const RUTAS_PUBLICAS = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/experiencias/page.tsx",
  "app/experiencias/[slug]/page.tsx",
  "app/para-negocios/page.tsx",
  "app/api/solicitudes/route.ts",
  "app/api/negocios-lean/route.ts",
];

/** Menciones en comentarios o en texto visible no cuentan: lo que importa es lo que se ejecuta. */
function importa(fuente: string, patron: RegExp): boolean {
  return fuente
    .split("\n")
    .filter((linea) => /^\s*(import|const .* = require)/.test(linea))
    .some((linea) => patron.test(linea));
}

describe("el MVP lean no depende de Supabase", () => {
  for (const ruta of RUTAS_PUBLICAS) {
    it(`${ruta} no importa nada de Supabase`, () => {
      const fuente = readFileSync(ruta, "utf8");
      expect(importa(fuente, /supabase/i), `${ruta} importa Supabase`).toBe(false);
    });
  }

  it("el layout raíz no condiciona el sitio a ninguna configuración", () => {
    // Lo que rompió la portada: `isSupabaseConfigured()` decidiendo si se
    // dibuja el sitio o una pantalla de configuración.
    const fuente = readFileSync("app/layout.tsx", "utf8");
    expect(fuente).not.toMatch(/isSupabaseConfigured|SetupRequired/);
  });

  it("ninguna ruta pública importa el cliente de correo", () => {
    // Misma clase de acoplamiento, mismo riesgo: esta versión no manda correos.
    for (const ruta of RUTAS_PUBLICAS) {
      const fuente = readFileSync(ruta, "utf8");
      expect(importa(fuente, /resend|mvp-email|lib\/email/i), `${ruta} importa correo`).toBe(false);
    }
  });
});
