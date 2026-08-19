import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Una caída de Sanity no puede disfrazarse de «esta experiencia no existe».
 *
 * QUÉ PASABA
 *
 * Toda consulta a Sanity pasa por `safeFetch`, que registra el error y devuelve
 * un valor de reserva para que el sitio no reviente. Para las listas es una
 * degradación honesta: el catálogo se dibuja vacío y dice «Próximamente nuevas
 * experiencias».
 *
 * Para **una** experiencia no. El valor de reserva era `null`, indistinguible
 * de «este documento no existe», y la página lo convierte en `notFound()`.
 * Medido sirviendo el sitio contra un Sanity que responde 500: cada dirección
 * de experiencia devolvía **404**. Una caída ajena le decía al visitante que su
 * enlace está roto —cuando la experiencia sigue en pie— y a los buscadores que
 * retiren esa dirección. En un sitio que se mueve por enlaces de WhatsApp, eso
 * marca como muerto un enlace que no lo está.
 *
 * QUÉ PROTEGE
 *
 * Que esta consulta concreta no tenga valor de reserva en una petición real, y
 * que el resto lo conserven. Y que el build siga tolerando la caída: la primera
 * versión de este arreglo tumbaba el despliegue entero —«Export encountered an
 * error … exiting the build»— porque `generateStaticParams` pregenera cada
 * slug y esta consulta también corre al compilar.
 */
const FUENTE = readFileSync("lib/sanity/queries.ts", "utf8");

function bloque(nombre: string) {
  const i = FUENTE.indexOf(`export async function ${nombre}`);
  expect(i, `no se encuentra ${nombre}`).toBeGreaterThan(-1);
  return FUENTE.slice(i, FUENTE.indexOf("\n}", i));
}

describe("una caída de Sanity no se disfraza de 404", () => {
  it("la consulta de una experiencia no se traga el error", () => {
    const cuerpo = bloque("getExperienceBySlug");
    expect(cuerpo, "volvió a usar el envoltorio que devuelve null al fallar").not.toMatch(/\bsafeFetch\(/);
    expect(cuerpo, "ya no deja subir el error").toMatch(/\bfetchOrThrow\(/);
  });

  it("las listas sí conservan su valor de reserva", () => {
    for (const nombre of ["getUpcomingExperiences", "getAllExperienceSlugs", "getSiteSettings"]) {
      expect(bloque(nombre), `${nombre} dejó de degradar con gracia`).toMatch(/\bsafeFetch\(/);
    }
  });

  it("el build sigue tolerando que Sanity no responda", () => {
    const i = FUENTE.indexOf("async function fetchOrThrow");
    const cuerpo = FUENTE.slice(i, FUENTE.indexOf("\n}", i));

    expect(
      cuerpo,
      "sin la salida durante el build, una caída al compilar tumba el despliegue entero",
    ).toMatch(/phase-production-build/);
  });
});
