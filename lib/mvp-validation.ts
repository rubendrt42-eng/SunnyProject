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
 * WhatsApp: dígitos, entre 10 y 15.
 *
 * Se limpian espacios, guiones y paréntesis antes de validar porque la gente
 * escribe su número como quiere —«81 1234 5678», «(81) 1234-5678»— y rechazar
 * eso sería hacerle pelear con el formulario por nada. Lo que se guarda es la
 * versión limpia, que es la que sirve para armar el enlace de WhatsApp.
 */
const whatsapp = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s\-().+]/g, ""))
  .refine((v) => /^\d{10,15}$/.test(v), {
    message: "Escribe tu WhatsApp a 10 dígitos, o con el código de país.",
  });

const nombre = z
  .string()
  .trim()
  .min(3, "Escribe tu nombre completo.")
  .max(80, "El nombre es demasiado largo.");

const correo = z.string().trim().toLowerCase().email("Revisa tu correo, parece que tiene un error.").max(120);

/**
 * Campo trampa para robots.
 *
 * Va oculto en el formulario. Una persona no lo ve y lo deja vacío; un script
 * que rellena todos los campos del formulario lo llena y se delata. Es la
 * protección antispam más barata que existe y no molesta a nadie: no hay
 * captcha, no hay que resolver nada.
 */
const trampa = z.string().max(0, "Solicitud rechazada.").optional();

export const spotRequestSchema = z.object({
  experienceId: z.string().trim().min(1),
  experienceName: z.string().trim().min(1).max(120),
  name: nombre,
  whatsapp,
  email: correo,
  numberOfPeople: z.coerce
    .number()
    .int("Escribe un número entero.")
    .min(1, "Al menos una persona.")
    .max(10, "Para grupos de más de 10 personas, escríbenos directamente."),
  comments: z.string().trim().max(500, "El comentario es demasiado largo.").optional().or(z.literal("")),
  website: trampa,
});

export const businessRequestSchema = z.object({
  businessName: z.string().trim().min(2, "Escribe el nombre de tu negocio.").max(80),
  contactName: nombre,
  whatsapp,
  email: correo,
  instagram: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  experienceType: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(700).optional().or(z.literal("")),
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
export function firstErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Revisa los datos del formulario.";
}
