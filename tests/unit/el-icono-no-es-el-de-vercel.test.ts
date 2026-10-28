import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * El icono de la pestaña tiene que ser el de Sun-i, no el de Vercel.
 *
 * QUÉ PASABA
 *
 * `app/favicon.ico` seguía siendo el archivo que deja `create-next-app`: el
 * triángulo blanco dentro de un círculo negro, o sea el logo de Vercel. Nadie
 * lo nota revisando la página —vive en la pestaña del navegador, fuera del
 * documento— así que sobrevivió hasta que el sitio ya estaba en su dominio
 * propio y el cliente vio el logo de otra empresa junto a su nombre.
 *
 * QUÉ PROTEGE
 *
 * Que el archivo por defecto no vuelva a entrar, y que los tres iconos que
 * genera Next (pestaña, PNG grande y pantalla de inicio de iOS) existan.
 */
const EL_DE_VERCEL = "c30c7d42707a47a3f4591831641e50dc";

function md5(ruta: string) {
  return createHash("md5").update(readFileSync(ruta)).digest("hex");
}

describe("el icono del sitio", () => {
  it("no es el que viene por defecto con Next.js", () => {
    expect(
      md5("app/favicon.ico"),
      "app/favicon.ico es el logo de Vercel que deja create-next-app",
    ).not.toBe(EL_DE_VERCEL);
  });

  it("tiene los tres archivos que Next convierte en <link rel=icon>", () => {
    for (const ruta of ["app/favicon.ico", "app/icon.png", "app/apple-icon.png"]) {
      expect(existsSync(ruta), `falta ${ruta}`).toBe(true);
    }
  });

  it("el .ico trae varios tamaños, no uno solo", () => {
    /*
      A 16px el navegador no reescala bien un PNG de 512: las líneas finas de
      la cara se deshacen. Por eso el .ico lleva 16, 32 y 48 ya calculados.
      La cabecera ICO guarda esa cuenta en los bytes 4 y 5.
    */
    const cabecera = readFileSync("app/favicon.ico");
    expect(cabecera.readUInt16LE(0), "no parece un .ico").toBe(0);
    expect(cabecera.readUInt16LE(2), "el tipo debería ser 1 (icono)").toBe(1);
    expect(cabecera.readUInt16LE(4)).toBeGreaterThanOrEqual(3);
  });
});
