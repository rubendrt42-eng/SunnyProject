import { describe, expect, it } from "vitest";
import { antetituloDeLaLista } from "@/lib/lean-content";

/**
 * «Esta semana» tiene que ser verdad el día que se lee.
 *
 * QUÉ PASABA
 *
 * El antetítulo de la portada era «Esta semana» siempre que hubiera algo
 * publicado, sin mirar la fecha. Medido en producción el 20 de agosto de 2026:
 * la experiencia más próxima empezaba el 14 de septiembre —25 días después— y
 * la portada anunciaba «Esta semana» justo encima de dos tarjetas fechadas en
 * septiembre. El comentario del código ya decía «solo si de verdad hay algo
 * esta semana»; la condición solo comprobaba `experiences.length > 0`.
 *
 * QUÉ PROTEGE
 *
 * Que la etiqueta y la fecha de la tarjeta no se contradigan en la misma
 * pantalla. Importa porque la cadencia semanal se promete en otros dos sitios
 * —«Monterrey · Cada semana» y el paso 01—: si esta se cae, arrastra a las dos.
 */
const AHORA = new Date("2026-08-20T18:00:00.000Z");

function dentroDe(dias: number) {
  return { startDateTime: new Date(AHORA.getTime() + dias * 86_400_000).toISOString() };
}

describe("el antetítulo de la lista", () => {
  it("dice «Esta semana» cuando algo empieza dentro de siete días", () => {
    expect(antetituloDeLaLista([dentroDe(2)], AHORA)).toBe("Esta semana");
    expect(antetituloDeLaLista([dentroDe(6.9)], AHORA)).toBe("Esta semana");
  });

  it("no dice «Esta semana» cuando lo más próximo está a un mes", () => {
    // El caso medido en producción: 20 de agosto mirando al 14 de septiembre.
    expect(antetituloDeLaLista([dentroDe(25), dentroDe(26)], AHORA)).toBe("Próximas fechas");
  });

  it("basta con que una de la lista caiga dentro de la semana", () => {
    expect(antetituloDeLaLista([dentroDe(25), dentroDe(3)], AHORA)).toBe("Esta semana");
  });

  it("cuenta lo que ya empezó pero todavía no termina", () => {
    // `getUpcomingExperiences` filtra por endDateTime, así que una experiencia
    // en curso llega aquí con el inicio en el pasado.
    expect(antetituloDeLaLista([dentroDe(-0.2)], AHORA)).toBe("Esta semana");
  });

  it("con la lista vacía no anuncia semana", () => {
    expect(antetituloDeLaLista([], AHORA)).toBe("Próximas fechas");
  });

  it("una fecha ilegible no sostiene la promesa", () => {
    expect(antetituloDeLaLista([{ startDateTime: "" }], AHORA)).toBe("Próximas fechas");
    expect(antetituloDeLaLista([{ startDateTime: "cuando sea" }], AHORA)).toBe("Próximas fechas");
  });
});
