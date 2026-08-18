import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * En las rutas públicas solo puede publicarse fotografía autorizada.
 *
 * EL RIESGO
 *
 * `lib/media.ts` contiene 16 fotografías de mood board: imágenes guardadas de
 * contenido publicado por otras marcas —15 de las 16 miden exactamente 736 px
 * de ancho, el ancho canónico del feed de Pinterest— y varias muestran marcas
 * ajenas legibles y ciudades que no son Monterrey. `SUNNY_ASSET_MANIFEST.md`
 * §0 las bloquea para producción.
 *
 * Hoy el sitio publicado sirve exactamente una de ellas: `EMMY_PHOTO`. Es la
 * única excepción, y es deliberada — venía en la carpeta `FotoEmmy` de la
 * propia entrega de Emmy, mide 1080×1080 (formato nativo de Instagram) y el
 * cliente pidió expresamente que apareciera en su presentación.
 *
 * Pero en el árbol siguen existiendo tres componentes de la versión avanzada
 * —`Hero`, `ForBusinessSection`, `OriginalsSection`— que importan fotografías
 * bloqueadas. Ninguno se renderiza en una ruta lean. Basta con que alguien
 * añada uno a la portada para publicar una imagen de terceros sin licencia, y
 * **nada fallaría**: compila, se ve bien, y el problema es legal, no técnico.
 *
 * Esta prueba recorre lo que de verdad alcanza cada ruta pública y comprueba
 * que ninguna llega a una fotografía distinta de `EMMY_PHOTO`.
 */
const RAICES_PUBLICAS = [
  "app/page.tsx",
  "app/experiencias/page.tsx",
  "app/experiencias/[slug]/page.tsx",
  "app/como-funciona/page.tsx",
  "app/para-negocios/page.tsx",
  "app/preguntas-frecuentes/page.tsx",
  "app/privacidad/page.tsx",
  "app/layout.tsx",
];

/** La única fotografía autorizada a salir en producción hoy. */
const AUTORIZADAS = new Set(["EMMY_PHOTO"]);

/** Resuelve un import `@/...` al archivo real, probando las extensiones usuales. */
function resolver(especificador: string): string | null {
  if (!especificador.startsWith("@/")) return null;
  const base = especificador.slice(2);
  for (const cand of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`]) {
    if (existsSync(cand)) return cand;
  }
  return null;
}

function alcanzables(raices: string[]): Set<string> {
  const vistos = new Set<string>();
  const pila = [...raices];
  while (pila.length) {
    const archivo = pila.pop()!;
    if (vistos.has(archivo) || !existsSync(archivo)) continue;
    vistos.add(archivo);
    const fuente = readFileSync(archivo, "utf8");
    for (const m of fuente.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      const destino = resolver(m[1]);
      if (destino && !vistos.has(destino)) pila.push(destino);
    }
  }
  return vistos;
}

describe("fotografía en las rutas públicas", () => {
  const archivos = alcanzables(RAICES_PUBLICAS);

  it("las rutas públicas alcanzan un árbol de componentes real", () => {
    // Salvaguarda del propio test: si el resolutor se rompiera y devolviera
    // casi nada, las comprobaciones de abajo pasarían sin comprobar nada.
    expect(archivos.size).toBeGreaterThan(15);
  });

  it("ninguna ruta pública llega a una fotografía bloqueada", () => {
    const infracciones: string[] = [];

    for (const archivo of archivos) {
      if (archivo === "lib/media.ts") continue;
      const fuente = readFileSync(archivo, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/[^\n]*/g, " ");

      for (const m of fuente.matchAll(/import\s*\{([^}]+)\}\s*from\s*["']@\/lib\/media["']/g)) {
        for (const nombre of m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean)) {
          if (!AUTORIZADAS.has(nombre)) infracciones.push(`${archivo} importa ${nombre}`);
        }
      }
    }

    expect(
      infracciones,
      "Las fotografías de `lib/media.ts` son imágenes de otras marcas, bloqueadas " +
        "para producción en SUNNY_ASSET_MANIFEST.md §0. La única autorizada es " +
        "EMMY_PHOTO.\n" + infracciones.map((i) => `  ${i}`).join("\n"),
    ).toEqual([]);
  });
});
