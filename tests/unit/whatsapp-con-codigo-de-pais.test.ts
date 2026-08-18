import { describe, expect, it } from "vitest";
import { revisarWhatsapp } from "@/sanity/schemas/siteSettings";

/**
 * El número de WhatsApp de los ajustes tiene que llevar código de país.
 *
 * QUÉ PASABA
 *
 * La regla aceptaba «entre 10 y 15 dígitos». Un número mexicano se escribe con
 * 10: 8112345678. Emmy podía teclearlo tal cual, la validación no decía nada, y
 * `whatsappLink` armaba `https://wa.me/8112345678` — un enlace que WhatsApp
 * rechaza porque `wa.me` exige el código de país. Ese enlace aparece en el pie
 * de todas las páginas, así que el canal por el que se confirman los lugares
 * quedaba roto en todo el sitio sin un solo error visible.
 *
 * La descripción del campo sí pedía el código de país. La regla no lo exigía, y
 * lo que decide es la regla.
 */
describe("número de WhatsApp de los ajustes del sitio", () => {
  it("rechaza un número mexicano sin código de país y dice cómo arreglarlo", () => {
    const r = revisarWhatsapp("8112345678");
    expect(r).not.toBe(true);
    expect(String(r)).toContain("528112345678");
  });

  it("acepta el mismo número con el 52 delante", () => {
    expect(revisarWhatsapp("528112345678")).toBe(true);
  });

  it("acepta números de otros países", () => {
    expect(revisarWhatsapp("14155552671")).toBe(true); // Estados Unidos: 1 + 10
    expect(revisarWhatsapp("34612345678")).toBe(true); // España: 34 + 9
  });

  it("rechaza lo que no son solo dígitos", () => {
    for (const malo of ["+52 811 234 5678", "52-811-234-5678", "(81) 1234 5678"]) {
      expect(revisarWhatsapp(malo)).not.toBe(true);
    }
  });

  it("rechaza números demasiado cortos o demasiado largos", () => {
    expect(revisarWhatsapp("123456789")).not.toBe(true);
    expect(revisarWhatsapp("1234567890123456")).not.toBe(true);
  });
});
