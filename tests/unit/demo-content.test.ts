import { describe, expect, it } from "vitest";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";

describe("isDemoExperience", () => {
  it("detects the [Demostración] suffix", () => {
    expect(isDemoExperience("Pilates Reformer Intro [Demostración]")).toBe(true);
  });

  it("is false for titles without the tag", () => {
    expect(isDemoExperience("Pilates Reformer Intro")).toBe(false);
  });

  it("is case-insensitive on the accented character", () => {
    expect(isDemoExperience("Sunset Yoga [demostracion]")).toBe(true);
  });

  /**
   * La marca pasó de depender del título a depender de la columna `is_demo`.
   * Lo que protegen estas pruebas es la transición: el sitio tiene que ser
   * correcto ANTES y DESPUÉS de aplicar la migración.
   */
  it("sin la columna todavía, cae al sufijo del título", () => {
    expect(isDemoExperience({ title: "Mat Pilates Intro [Demostración]" })).toBe(true);
    expect(isDemoExperience({ title: "Mat Pilates Intro" })).toBe(false);
  });

  it("con la columna, manda la columna y no el título", () => {
    // El caso peligroso: alguien quita el sufijo del título pero sigue siendo
    // de prueba. Antes el badge desaparecía sin que nadie lo decidiera.
    expect(isDemoExperience({ title: "Mat Pilates Intro", is_demo: true })).toBe(true);
    // Y al revés: una experiencia real copiada de una de demo arrastraba el
    // sufijo y se marcaba sola.
    expect(isDemoExperience({ title: "Clase real [Demostración]", is_demo: false })).toBe(false);
  });

  it("`null` significa «no es de demostración», no «pregúntale al título»", () => {
    // La columna existe y está a null: alguien decidió que no lo es. Solo
    // `undefined` —columna ausente— debe caer al sufijo.
    expect(isDemoExperience({ title: "Clase [Demostración]", is_demo: null })).toBe(false);
  });
});

describe("displayTitle", () => {
  it("strips the demo tag and surrounding whitespace", () => {
    expect(displayTitle("Pilates Reformer Intro [Demostración]")).toBe("Pilates Reformer Intro");
  });

  it("leaves non-demo titles unchanged", () => {
    expect(displayTitle("Pilates Reformer Intro")).toBe("Pilates Reformer Intro");
  });
});
