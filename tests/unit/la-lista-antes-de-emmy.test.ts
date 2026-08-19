import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * La lista de «antes de enseñárselo a Emmy» tiene que apuntar a lo que de
 * verdad falta.
 *
 * QUÉ PASABA
 *
 * Pedía «sustituir la fotografía del hero, la actual no está autorizada para
 * producción». Esa fotografía se retiró hace tiempo: el hero es hoy una
 * composición de marca hecha solo con CSS. Comprobado sobre el sitio publicado,
 * la única imagen que se sirve en las cuatro rutas con contenido es el retrato
 * de Emmy, en la portada.
 *
 * O sea que la lista mandaba a arreglar algo inexistente —y de paso daba a
 * entender que el sitio publica una imagen sin licencia, que es falso y
 * alarmante— mientras callaba lo que sí sigue pendiente: que nadie ha
 * confirmado por escrito que el retrato de Emmy se pueda publicar.
 *
 * QUÉ PROTEGE
 *
 * Que la lista no vuelva a hablar de una foto de hero que no existe, y que el
 * pendiente real siga escrito. Y ata la afirmación al código: si algún día el
 * hero lean vuelve a llevar una fotografía fija, esta prueba falla y hay que
 * revisar la lista.
 */
const SETUP = readFileSync("MVP_SETUP.md", "utf8");

describe("la lista de antes de enseñárselo a Emmy", () => {
  it("no pide sustituir una fotografía de hero que ya no existe", () => {
    expect(SETUP, "vuelve a pedir cambiar la foto del hero").not.toMatch(
      /Sustituir la fotografía del hero/,
    );
  });

  it("sí pide la autorización de la única foto publicada", () => {
    expect(SETUP, "se perdió el pendiente de la foto de Emmy").toMatch(
      /fotografía de Emmy se puede publicar/,
    );
  });

  it("el hero lean sigue sin fotografía fija en el código", () => {
    const hero = readFileSync("components/lean/LeanHero.tsx", "utf8");
    const codigo = hero.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

    // La foto del hero solo puede venir del gestor de contenido, nunca de un
    // archivo del repositorio.
    expect(codigo, "el hero volvió a llevar una imagen fija del repositorio").not.toMatch(
      /HERO_TOGETHER|from "@\/lib\/media"/,
    );
  });

  it("sigue pidiendo borrar las experiencias de prueba", () => {
    expect(SETUP).toMatch(/TEST —/);
  });
});
