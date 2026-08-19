import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * El aviso de privacidad tiene que ofrecer una vía real para ejercer derechos.
 *
 * QUÉ PASABA
 *
 * La sección «Tus derechos» decía, y nada más: «escríbenos por el mismo
 * WhatsApp por el que te contactamos». Eso solo sirve para quien ya recibió
 * respuesta. Quien mandó una solicitud y nunca tuvo contestación —hoy mismo,
 * con la hoja sin configurar, ninguna solicitud llega a ninguna parte— se
 * quedaba sin ninguna forma de pedir sus datos, corregirlos o borrarlos.
 *
 * Medido: la página no contenía ni un `wa.me` ni un `mailto:`, y el documento
 * de contenido tiene los tres canales vacíos.
 *
 * QUÉ PROTEGE
 *
 * Que el canal salga del contenido y no del código. No se inventa un contacto
 * —un aviso de privacidad con un dato de contacto falso es peor que uno
 * incompleto— pero la página queda lista para usarlo: en cuanto se llene el
 * campo de WhatsApp o el de correo, el hueco se cierra solo, sin desplegar.
 */
const RUTA = "app/privacidad/page.tsx";

describe("el aviso de privacidad ofrece una vía para ejercer derechos", () => {
  const fuente = readFileSync(RUTA, "utf8");
  const codigo = fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");

  it("lee los canales del documento de contenido", () => {
    expect(codigo, "la página dejó de leer los ajustes del sitio").toMatch(/getSiteSettings\(\)/);
    expect(codigo).toMatch(/settings\?\.whatsapp/);
    expect(codigo).toMatch(/settings\?\.contactEmail/);
  });

  it("no lleva ningún contacto escrito a mano", () => {
    // Un teléfono o correo escrito en el código sería un dato inventado: nadie
    // lo revisa al cambiarlo y nadie responde en el otro extremo.
    expect(codigo, "hay un enlace de WhatsApp fijo en el código").not.toMatch(/wa\.me\/\d/);
    expect(codigo, "hay un correo fijo en el código").not.toMatch(/mailto:[a-z0-9._%+-]+@/i);
  });

  it("sin canal configurado no promete uno que no existe", () => {
    expect(
      codigo,
      "desapareció el texto de reserva para cuando no hay ningún canal",
    ).toMatch(/mismo WhatsApp por el que te contactamos/);
  });
});
