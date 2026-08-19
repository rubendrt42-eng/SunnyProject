import { z } from "zod";

/**
 * Validación de los dos formularios públicos.
 *
 * Se valida en el servidor **además** de en el navegador. La validación del
 * navegador es una cortesía para quien escribe; la del servidor es la que de
 * verdad protege la hoja de cálculo, porque cualquiera puede mandar una
 * petición directa al endpoint sin pasar por el formulario.
 */

/**
 * Un campo que la persona puede dejar en blanco.
 *
 * POR QUÉ ACEPTA `null` Y NO SOLO `undefined`
 *
 * Los dos formularios arman su cuerpo con `data.get("campo")`, y `FormData.get`
 * devuelve **`null`** —no `undefined`— cuando ese campo no está en el formulario.
 * Hoy todos los campos existen siempre en el marcado, así que nunca llega
 * `null`; el día que uno se vuelva condicional, `.optional()` a secas lo
 * rechazaría con el texto por omisión de la librería, en inglés. Aceptar `null`
 * y tratarlo como vacío es lo que ya significa en el formulario.
 */
function opcional<T extends z.ZodType<string>>(regla: T) {
  return regla
    .or(z.literal(""))
    .nullish()
    .transform((v) => v ?? undefined);
}

/**
 * El mismo texto para las dos formas de perder la experiencia —que no venga y
 * que venga vacía—, porque para quien lo lee es el mismo problema.
 */
const FALTA_EXPERIENCIA = "Falta la experiencia. Vuelve a abrirla desde el listado.";

/**
 * WhatsApp: dígitos, entre 10 y 15.
 *
 * Se limpian espacios, guiones y paréntesis antes de validar porque la gente
 * escribe su número como quiere —«81 1234 5678», «(81) 1234-5678»— y rechazar
 * eso sería hacerle pelear con el formulario por nada. Lo que se guarda es la
 * versión limpia, que es la que sirve para armar el enlace de WhatsApp.
 */
const whatsapp = z
  .string({ error: "Escribe tu WhatsApp." })
  .trim()
  .transform((v) => v.replace(/[\s\-().+]/g, ""))
  .refine((v) => /^\d{10,15}$/.test(v), {
    message: "Escribe tu WhatsApp a 10 dígitos, o con el código de país.",
  });

const nombre = z
  .string({ error: "Escribe tu nombre completo." })
  .trim()
  .min(3, "Escribe tu nombre completo.")
  .max(80, "El nombre es demasiado largo.");

const correo = z
  .string({ error: "Escribe tu correo." })
  .trim()
  .toLowerCase()
  .email("Revisa tu correo, parece que tiene un error.")
  .max(120, "El correo es demasiado largo.");

/**
 * Campo trampa para robots.
 *
 * Va oculto en el formulario. Una persona no lo ve y lo deja vacío; un script
 * que rellena todos los campos del formulario lo llena y se delata. Es la
 * protección antispam más barata que existe y no molesta a nadie: no hay
 * captcha, no hay que resolver nada.
 */
const trampa = opcional(z.string().max(0, "Solicitud rechazada."));

export const spotRequestSchema = z.object({
  experienceId: z
    .string({ error: FALTA_EXPERIENCIA })
    .trim()
    .min(1, FALTA_EXPERIENCIA),
  experienceName: z
    .string({ error: FALTA_EXPERIENCIA })
    .trim()
    .min(1, FALTA_EXPERIENCIA)
    .max(120, "El nombre de la experiencia es demasiado largo."),
  name: nombre,
  whatsapp,
  email: correo,
  numberOfPeople: z.coerce
    .number({ error: "Dinos cuántas personas van." })
    .int("Escribe un número entero.")
    .min(1, "Al menos una persona.")
    .max(10, "Para grupos de más de 10 personas, escríbenos directamente."),
  comments: opcional(z.string().trim().max(500, "El comentario es demasiado largo.")),
  website: trampa,
});

export const businessRequestSchema = z.object({
  businessName: z
    .string({ error: "Escribe el nombre de tu negocio." })
    .trim()
    .min(2, "Escribe el nombre de tu negocio.")
    .max(80, "El nombre del negocio es demasiado largo."),
  contactName: nombre,
  whatsapp,
  email: correo,
  instagram: opcional(z.string().trim().max(80, "El usuario de Instagram es demasiado largo.")),
  location: opcional(z.string().trim().max(120, "La zona o dirección es demasiado larga.")),
  experienceType: opcional(z.string().trim().max(120, "Descríbelo un poco más corto, por favor.")),
  message: opcional(z.string().trim().max(700, "El mensaje es demasiado largo.")),
  website: trampa,
});

export type SpotRequestInput = z.infer<typeof spotRequestSchema>;
export type BusinessRequestInput = z.infer<typeof businessRequestSchema>;

/**
 * Límite de frecuencia por IP, en memoria.
 *
 * Honesto sobre lo que es: en un entorno sin servidor cada instancia tiene su
 * propia memoria, así que esto **no es un límite global**. Frena el caso real
 * —alguien pulsando enviar veinte veces, o un script simple— y no pretende
 * frenar un ataque distribuido. Para eso haría falta un almacén compartido, y
 * meterlo ahora sería sobreingeniería para un sitio que todavía no tiene
 * tráfico.
 */
const attempts = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

export function rateLimit(ip: string): { ok: boolean } {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    attempts.set(ip, recent);
    return { ok: false };
  }

  recent.push(now);
  attempts.set(ip, recent);

  // Limpieza perezosa: sin esto el mapa crece sin fin en una instancia de larga
  // vida. Se hace aquí y no con un temporizador porque un `setInterval` en una
  // función sin servidor mantiene la instancia despierta.
  if (attempts.size > 500) {
    for (const [key, times] of attempts) {
      if (times.every((t) => now - t >= WINDOW_MS)) attempts.delete(key);
    }
  }

  return { ok: true };
}

/** Primer mensaje de error legible de un fallo de Zod, para mostrárselo a la persona. */
/**
 * El mensaje que se le enseña a la persona.
 *
 * POR QUÉ TODOS LOS LÍMITES LLEVAN MENSAJE PROPIO
 *
 * Esto devuelve el primer error tal cual, así que cualquier regla sin mensaje
 * propio le enseña a la persona el texto por omisión de la librería — en inglés
 * y con jerga interna. Medido contra el endpoint de negocios antes de
 * arreglarlo:
 *
 *     sin nombre de negocio -> «Invalid input: expected string, received undefined»
 *     mensaje muy largo ---> «Too big: expected string to have <=700 characters»
 *
 * En un sitio en español, a alguien que solo quiere ofrecer su estudio.
 *
 * LO QUE FALTABA
 *
 * La primera pasada le puso mensaje a cada `min`, `max` y `email`, pero no al
 * **tipo base**: si un campo no llegaba —o llegaba como `null`— el error no lo
 * producía ninguna de esas reglas sino la comprobación de tipo, que seguía
 * respondiendo «Invalid input: expected string, received undefined». Los casos
 * de la prueba usaban cadenas vacías, así que ese hueco no se veía.
 *
 * Ahora cada tipo base lleva su propio mensaje y los campos opcionales aceptan
 * `null`, que es lo que devuelve `FormData.get` para un campo ausente. La
 * prueba recorre las tres formas de romper cada regla: vacío, demasiado largo
 * y ausente.
 */
export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisa los datos del formulario.";
}
