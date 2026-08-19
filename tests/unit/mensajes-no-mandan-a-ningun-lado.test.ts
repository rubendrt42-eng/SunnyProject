import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { spotRequestSchema, firstErrorMessage } from "@/lib/mvp-validation";

/**
 * Ningún mensaje puede mandar a la persona a un canal que no existe.
 *
 * QUÉ PASABA
 *
 * El tope de tamaño de grupo respondía «Para grupos de más de 10 personas,
 * escríbenos directamente». Medido en la página de la experiencia: no hay
 * ningún canal de contacto. El único `wa.me` del HTML es el de **compartir**
 * —`wa.me/?text=…`, un enlace sin número— y el documento de contenido tiene
 * WhatsApp, Instagram y correo vacíos. «Escríbenos» no llevaba a ninguna parte.
 *
 * Hoy nadie llega a ese mensaje desde el formulario: el selector ofrece hasta 5
 * personas, así que el tope de 10 solo lo toca quien manda la petición a mano.
 * Se corrigió antes de que sea alcanzable, porque subir el selector a 10 —la
 * decisión que está pendiente— lo pondría delante de cualquiera.
 *
 * QUÉ PROTEGE
 *
 * Que los mensajes de error no manden a escribir a un sitio que el sitio no
 * publica. Comprueba el mecanismo, no la redacción: si algún día hay un canal
 * de contacto de verdad, nombrarlo será correcto y esta prueba habrá que
 * ajustarla a propósito.
 */
const BASE = {
  experienceId: "abc",
  experienceName: "Yoga",
  name: "Ruben Diaz",
  whatsapp: "8112345678",
  email: "a@b.mx",
};

describe("los mensajes no mandan a canales inexistentes", () => {
  it("el tope de grupo ofrece algo que la persona sí tiene delante", () => {
    const r = spotRequestSchema.safeParse({ ...BASE, numberOfPeople: 11 });
    expect(r.success).toBe(false);
    const msg = firstErrorMessage(r.error!);

    expect(msg, "vuelve a mandar a «escribirnos» sin decir por dónde").not.toMatch(/escríbenos/i);
    // El campo de comentarios existe siempre en el mismo formulario.
    expect(msg, "no ofrece ninguna salida concreta").toMatch(/Algo que debamos saber/);
  });

  it("ese campo sigue existiendo en el formulario", () => {
    const form = readFileSync("components/lean/SpotRequestForm.tsx", "utf8");
    expect(form, "desapareció el campo al que apunta el mensaje").toMatch(/name="comments"/);
    expect(form).toMatch(/¿Algo que debamos saber\?/);
  });

  it("no hay ningún contacto de Sunny escrito a mano en la validación", () => {
    const fuente = readFileSync("lib/mvp-validation.ts", "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");
    expect(fuente, "hay un WhatsApp fijo en el código").not.toMatch(/wa\.me\/\d/);
    expect(fuente, "hay un correo fijo en el código").not.toMatch(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  });
});
