import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * El sitio manda cuatro cabeceras de seguridad además de la que pone Vercel.
 *
 * POR QUÉ IMPORTA AQUÍ Y NO ES BUROCRACIA
 *
 * Esto no es una página de solo lectura: hay dos formularios públicos que
 * piden nombre, WhatsApp y correo. Sin `X-Frame-Options: DENY`, cualquiera
 * puede meter el sitio en un iframe invisible sobre su propia página y
 * conseguir que alguien pulse «Enviar solicitud» creyendo que pulsa otra cosa.
 * El sitio no necesita incrustarse en ningún lado, así que esa puerta se
 * cierra sin coste.
 *
 * Medido antes: la única cabecera que llegaba era `Strict-Transport-Security`,
 * la que añade Vercel por su cuenta.
 *
 * La prueba lee la configuración en vez de hacer una petición porque una
 * petición necesita el sitio levantado, y esto tiene que fallar en el momento
 * en que alguien borre la lista, no cuando ya esté publicado.
 */
const REQUERIDAS = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=()"],
];

describe("cabeceras de seguridad", () => {
  const config = readFileSync("next.config.ts", "utf8");

  it("la configuración declara un bloque de cabeceras", () => {
    expect(/async headers\s*\(/.test(config), "falta `async headers()` en next.config.ts").toBe(true);
  });

  it("se aplican a todas las rutas", () => {
    expect(/source:\s*["']\/:path\*["']/.test(config), "el patrón debe cubrir todas las rutas").toBe(true);
  });

  for (const [clave, valor] of REQUERIDAS) {
    it(`declara ${clave}`, () => {
      expect(config).toContain(clave);
      expect(config).toContain(valor);
    });
  }
});
