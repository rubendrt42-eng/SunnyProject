import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Cuando la hoja de cálculo no está configurada, no se le puede decir a nadie
 * que lo intente otra vez en unos minutos.
 *
 * POR QUÉ IMPORTA
 *
 * «Inténtalo nuevamente en unos minutos» es verdad si el fallo es pasajero. Es
 * mentira si la hoja no está configurada: por muchos minutos que espere, nunca
 * va a funcionar.
 *
 * Y esa era la situación real. El sitio está publicado, `GOOGLE_SHEET_ID` no
 * existe todavía, y cualquiera que entrara, llenara el formulario y pulsara
 * enviar recibía esa promesa. Comprobado renderizando el estado: el aviso se
 * ve, se anuncia como `role="alert"` y conserva lo que la persona escribió —
 * lo único que estaba mal era lo que decía.
 *
 * QUÉ PROTEGE
 *
 * Que los dos endpoints distingan los dos fallos. No la redacción exacta: lo
 * que no puede volver es que el camino de «sin configurar» prometa un
 * reintento.
 */
const RUTAS = ["app/api/solicitudes/route.ts", "app/api/negocios-lean/route.ts"];

describe("el mensaje cuando falta la hoja de cálculo", () => {
  for (const ruta of RUTAS) {
    const fuente = readFileSync(ruta, "utf8");

    // Sin comentarios: explican el fallo y mencionan las dos frases.
    const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

    it(`${ruta} distingue la hoja sin configurar de un fallo pasajero`, () => {
      expect(codigo).toContain("SheetsNotConfiguredError");
      // Tiene que responder ANTES de llegar al mensaje genérico.
      const iCatch = codigo.indexOf("SheetsNotConfiguredError");
      const iGenerico = codigo.indexOf("Inténtalo nuevamente");
      expect(iCatch, "falta el caso de hoja sin configurar").toBeGreaterThan(-1);
      expect(iGenerico, "falta el mensaje de fallo pasajero").toBeGreaterThan(-1);
      expect(iCatch).toBeLessThan(iGenerico);
    });

    it(`${ruta} no promete un reintento cuando la hoja no está configurada`, () => {
      // El bloque del error de configuración, hasta su `return`.
      const desde = codigo.indexOf("SheetsNotConfiguredError");
      const bloque = codigo.slice(desde, codigo.indexOf("}", codigo.indexOf("status: 503")) + 1);
      expect(bloque, "el camino sin configurar no debe hablar de reintentar").not.toContain("Inténtalo nuevamente");
      expect(bloque, "debe responder 503, no 502").toContain("503");
    });
  }
});
