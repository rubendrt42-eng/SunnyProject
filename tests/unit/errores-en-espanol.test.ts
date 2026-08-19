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
 * EL HUECO QUE DEJÓ LA PRIMERA PASADA
 *
 * Todos los casos de abajo mandaban el campo como cadena vacía, así que siempre
 * fallaba un `min` o un `max` —que sí tenían mensaje— y nunca la comprobación
 * de tipo. Con el campo **ausente** o en `null` el error lo daba el tipo base,
 * que no tenía mensaje propio, y volvía a salir en inglés:
 *
 *     spotRequestSchema.safeParse({}) -> «Invalid input: expected string, received undefined»
 *
 * Por eso ahora cada caso se prueba de tres formas: vacío, pasado de largo y
 * ausente. Y los campos opcionales se prueban además con `null`, que es lo que
 * devuelve `FormData.get` cuando el campo no está en el formulario.
 *
 * EL TERCER HUECO: EL ENVOLTORIO
 *
 * Con cada regla y cada tipo base ya en español, seguía faltando el `z.object`
 * que los envuelve. Si el cuerpo de la petición no era un objeto, el error lo
 * daba el envoltorio y volvía a salir en inglés. Medido contra las dos rutas
 * públicas:
 *
 *     [1,2,3]  -> «Invalid input: expected object, received array»
 *     null     -> «Invalid input: expected object, received null»
 *     "hola"   -> «Invalid input: expected object, received string»
 *
 * Los casos de abajo mandaban siempre un objeto, así que nunca tocaban esa
 * comprobación.
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
    // Campos que no llegan. Antes salían en inglés porque el error lo producía
    // la comprobación de tipo, no una regla con mensaje.
    ["solicitud completamente vacía", spotRequestSchema, {}],
    ["solicitud sin experienceId", spotRequestSchema, { ...SOLICITUD_OK, experienceId: undefined }],
    ["solicitud sin experienceName", spotRequestSchema, { ...SOLICITUD_OK, experienceName: undefined }],
    ["solicitud sin nombre del todo", spotRequestSchema, { ...SOLICITUD_OK, name: undefined }],
    ["solicitud sin whatsapp del todo", spotRequestSchema, { ...SOLICITUD_OK, whatsapp: undefined }],
    ["solicitud sin correo del todo", spotRequestSchema, { ...SOLICITUD_OK, email: undefined }],
    ["solicitud sin número de personas", spotRequestSchema, { ...SOLICITUD_OK, numberOfPeople: undefined }],
    ["solicitud con experiencia en null", spotRequestSchema, { ...SOLICITUD_OK, experienceId: null }],
    ["solicitud con nombre en null", spotRequestSchema, { ...SOLICITUD_OK, name: null }],
    ["negocio vacío del todo", businessRequestSchema, {}],
    ["negocio sin contacto", businessRequestSchema, { ...NEGOCIO_OK, contactName: undefined }],
    ["negocio sin whatsapp del todo", businessRequestSchema, { ...NEGOCIO_OK, whatsapp: undefined }],
    ["negocio sin correo del todo", businessRequestSchema, { ...NEGOCIO_OK, email: undefined }],
    ["negocio con correo en null", businessRequestSchema, { ...NEGOCIO_OK, email: null }],
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

/**
 * El otro lado de lo mismo: un campo opcional que llega como `null` no es un
 * error, es un campo en blanco. `FormData.get` devuelve `null` —no `undefined`—
 * para un campo que no está en el formulario, y rechazarlo obligaría a la
 * persona a corregir algo que nunca escribió.
 */
describe("los campos opcionales aceptan venir en blanco", () => {
  it("una solicitud sin comentario ni trampa se acepta", () => {
    const r = spotRequestSchema.safeParse({ ...SOLICITUD_OK, comments: null, website: null });
    expect(r.success, r.success ? "" : firstErrorMessage(r.error!)).toBe(true);
    expect(r.data?.comments).toBeUndefined();
  });

  it("un negocio sin instagram, zona, tipo ni mensaje se acepta", () => {
    const r = businessRequestSchema.safeParse({
      ...NEGOCIO_OK,
      instagram: null,
      location: null,
      experienceType: null,
      message: null,
      website: null,
    });
    expect(r.success, r.success ? "" : firstErrorMessage(r.error!)).toBe(true);
    expect(r.data?.instagram).toBeUndefined();
  });
});

/**
 * El cuerpo entero, no solo sus campos. Las rutas son públicas: cualquiera
 * puede mandar algo que no sea un objeto, y la respuesta la lee una persona.
 */
describe("un cuerpo que no es un objeto también responde en español", () => {
  const cuerpos: Array<[string, unknown]> = [
    ["un array", [1, 2, 3]],
    ["null", null],
    ["una cadena", "hola"],
    ["un número", 42],
    ["un booleano", true],
  ];

  for (const [nombre, cuerpo] of cuerpos) {
    for (const [donde, schema] of [
      ["solicitud", spotRequestSchema],
      ["negocios", businessRequestSchema],
    ] as const) {
      it(`${donde} con ${nombre}: mensaje en español`, () => {
        const msg = mensajeDe(schema, cuerpo);
        for (const j of JERGA) {
          expect(msg.toLowerCase(), `«${msg}» contiene jerga de Zod`).not.toContain(j.toLowerCase());
        }
        expect(msg, `«${msg}» no parece una frase escrita para una persona`).toMatch(/^[¿¡A-ZÁÉÍÓÚÑ].*[.?]$/);
      });
    }
  }
});
