import { describe, expect, it } from "vitest";
import { businessRequestSchema, firstErrorMessage, spotRequestSchema } from "@/lib/mvp-validation";

/**
 * Ningún error de formulario puede salir en inglés.
 *
 * QUÉ PASABA
 *
 * `firstErrorMessage` devuelve el primer error tal cual, así que cualquier
 * regla sin mensaje propio enseñaba el texto por omisión de Zod. Medido contra
 * el endpoint de negocios:
 *
 *     sin nombre de negocio -> «Invalid input: expected string, received undefined»
 *     mensaje muy largo ---> «Too big: expected string to have <=700 characters»
 *
 * En un sitio en español, a alguien que solo quiere ofrecer su estudio. Y era
 * alcanzable desde el formulario: los campos opcionales no tienen `maxLength`
 * en el marcado, así que escribir 150 caracteres en «Zona o dirección» bastaba.
 *
 * QUÉ PROTEGE
 *
 * Que el mensaje esté en español, no su redacción exacta. Se recorren casos que
 * rompen cada regla y se comprueba que ninguno devuelve jerga de la librería.
 */
const JERGA = [
  "Invalid input",
  "Too big",
  "Too small",
  "expected",
  "received",
  "String must contain",
  "Required",
  "Invalid email",
];

function mensajeDe(schema: typeof spotRequestSchema | typeof businessRequestSchema, entrada: unknown): string {
  const r = schema.safeParse(entrada);
  expect(r.success, `se esperaba que fallara: ${JSON.stringify(entrada).slice(0, 90)}`).toBe(false);
  return firstErrorMessage(r.error!);
}

const SOLICITUD_OK = {
  experienceId: "abc",
  experienceName: "Yoga",
  name: "Ruben Diaz",
  whatsapp: "8112345678",
  email: "a@b.mx",
  numberOfPeople: 1,
};

const NEGOCIO_OK = {
  businessName: "Estudio Norte",
  contactName: "Ruben Diaz",
  whatsapp: "8112345678",
  email: "a@b.mx",
};

describe("los errores de formulario están en español", () => {
  const casos: Array<[string, typeof spotRequestSchema | typeof businessRequestSchema, unknown]> = [
    // Solicitud de lugar
    ["solicitud sin experiencia", spotRequestSchema, { ...SOLICITUD_OK, experienceId: "" }],
    ["solicitud sin nombre", spotRequestSchema, { ...SOLICITUD_OK, name: "" }],
    ["solicitud nombre larguísimo", spotRequestSchema, { ...SOLICITUD_OK, name: "a".repeat(200) }],
    ["solicitud whatsapp corto", spotRequestSchema, { ...SOLICITUD_OK, whatsapp: "123" }],
    ["solicitud correo roto", spotRequestSchema, { ...SOLICITUD_OK, email: "nope" }],
    ["solicitud correo larguísimo", spotRequestSchema, { ...SOLICITUD_OK, email: "a".repeat(130) + "@b.mx" }],
    ["solicitud grupo enorme", spotRequestSchema, { ...SOLICITUD_OK, numberOfPeople: 99 }],
    ["solicitud comentario larguísimo", spotRequestSchema, { ...SOLICITUD_OK, comments: "x".repeat(600) }],
    ["solicitud con trampa", spotRequestSchema, { ...SOLICITUD_OK, website: "spam" }],
    // Negocios
    ["negocio sin nombre", businessRequestSchema, { ...NEGOCIO_OK, businessName: undefined }],
    ["negocio nombre corto", businessRequestSchema, { ...NEGOCIO_OK, businessName: "a" }],
    ["negocio nombre larguísimo", businessRequestSchema, { ...NEGOCIO_OK, businessName: "a".repeat(120) }],
    ["negocio whatsapp roto", businessRequestSchema, { ...NEGOCIO_OK, whatsapp: "123" }],
    ["negocio correo roto", businessRequestSchema, { ...NEGOCIO_OK, email: "nope" }],
    ["negocio instagram larguísimo", businessRequestSchema, { ...NEGOCIO_OK, instagram: "a".repeat(120) }],
    ["negocio zona larguísima", businessRequestSchema, { ...NEGOCIO_OK, location: "a".repeat(200) }],
    ["negocio tipo larguísimo", businessRequestSchema, { ...NEGOCIO_OK, experienceType: "a".repeat(200) }],
    ["negocio mensaje larguísimo", businessRequestSchema, { ...NEGOCIO_OK, message: "a".repeat(900) }],
    ["negocio con trampa", businessRequestSchema, { ...NEGOCIO_OK, website: "spam" }],
  ];

  for (const [nombre, schema, entrada] of casos) {
    it(`${nombre}: mensaje en español, sin jerga de la librería`, () => {
      const msg = mensajeDe(schema, entrada);
      for (const j of JERGA) {
        expect(msg.toLowerCase(), `«${msg}» contiene jerga de Zod`).not.toContain(j.toLowerCase());
      }
      // Una frase en español de verdad: empieza en mayúscula y termina en punto.
      expect(msg, `«${msg}» no parece una frase escrita para una persona`).toMatch(/^[¿¡A-ZÁÉÍÓÚÑ].*[.?]$/);
    });
  }
});
