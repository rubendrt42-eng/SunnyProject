import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Lo que `MVP_SETUP.md` le promete a Emmy tiene que coincidir con el código.
 *
 * QUÉ PASABA
 *
 * La instrucción para publicar decía «En menos de un minuto aparece en el
 * sitio». Medido contra el sitio publicado, con las cabeceras de caché:
 *
 *     dentro del minuto ......  x-vercel-cache: HIT    (versión guardada)
 *     pasado el minuto, 1.ª ..  x-vercel-cache: STALE  (versión VIEJA)
 *     la siguiente ...........  x-vercel-cache: HIT    (ya la nueva)
 *
 * O sea que la primera visita después de que expire el minuto todavía ve lo
 * anterior — es la que dispara la actualización— y la segunda ya ve lo nuevo.
 * Y esa primera visita, en un sitio sin tráfico, casi siempre es Emmy
 * comprobando su propio cambio: publicaría, esperaría, refrescaría, seguiría
 * viendo lo viejo y concluiría que algo está roto.
 *
 * QUÉ PROTEGE
 *
 * Que el documento y el código no se separen. Si alguien cambia el minuto de
 * revalidación, o añade revalidación bajo demanda —un webhook desde Sanity, que
 * quitaría el segundo refresco—, esta prueba obliga a revisar lo que Emmy lee.
 */
const SETUP = readFileSync("MVP_SETUP.md", "utf8");

describe("las instrucciones para Emmy dicen lo que el código hace", () => {
  it("todas las rutas públicas revalidan en el mismo plazo", () => {
    const rutas = [
      "app/page.tsx",
      "app/experiencias/page.tsx",
      "app/experiencias/[slug]/page.tsx",
      "app/preguntas-frecuentes/page.tsx",
      "app/privacidad/page.tsx",
    ];
    const plazos = rutas.map((r) => {
      const m = readFileSync(r, "utf8").match(/export const revalidate = (\d+)/);
      expect(m, `${r} dejó de declarar revalidate`).not.toBeNull();
      return Number(m![1]);
    });

    expect(new Set(plazos).size, `plazos distintos entre rutas: ${plazos.join(", ")}`).toBe(1);
    expect(plazos[0], "el documento habla de «un minuto»").toBe(60);
  });

  it("el documento avisa de que hay que refrescar dos veces", () => {
    expect(
      SETUP,
      "se perdió el aviso: Emmy verá su propio cambio en el segundo refresco, no en el primero",
    ).toMatch(/[Rr]efresca dos veces/);
  });

  it("el documento no promete que aparezca «en menos de un minuto»", () => {
    expect(
      SETUP,
      "vuelve a prometer menos de un minuto, que es menos de lo que el sitio hace",
    ).not.toMatch(/En menos de un minuto aparece/);
  });

  it("no hay revalidación bajo demanda que haga innecesario el aviso", () => {
    // Si algún día se añade un webhook de Sanity, el aviso sobra y hay que
    // reescribirlo. Esta prueba lo recuerda fallando.
    const hayRuta = ["app/api/revalidate/route.ts", "app/api/webhook/route.ts"].some((r) => {
      try {
        readFileSync(r, "utf8");
        return true;
      } catch {
        return false;
      }
    });
    expect(hayRuta, "hay revalidación bajo demanda: revisa el aviso de «refresca dos veces»").toBe(false);
  });
});
