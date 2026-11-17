import "server-only";
import { sendEmail } from "@/lib/email/send";
import NuevaSolicitudSunni, { type SolicitudSunni } from "@/emails/NuevaSolicitudSunni";
import { env } from "@/lib/env";

/**
 * EL AVISO DE UNA SOLICITUD NUEVA.
 *
 * Vive aquí y no en `lib/email/notifications.ts` porque ese archivo importa
 * las cuatro plantillas de la versión avanzada —pases, cancelaciones— y los
 * tipos de la base de datos. La ruta del formulario de Sun-i no necesita nada
 * de eso, y pedirlo arrastraría todo ese código a una función que solo manda
 * un correo.
 *
 * NO LANZA. NUNCA.
 *
 * `sendEmail` ya se traga sus propios fallos, y esta función se llama DESPUÉS
 * de guardar en la hoja de cálculo. El orden es a propósito: la hoja es el
 * registro de verdad y el correo es el aviso. Si el correo falla, la
 * solicitud ya está guardada y la persona recibe su «gracias» igual; lo que
 * no puede pasar es que un problema del servicio de correo le diga a alguien
 * que su solicitud no se mandó cuando sí se guardó.
 */

/** Lo que se lee en la lista del correo, sin abrirlo. */
const ASUNTO = {
  vending: "Sun-i Vending",
  experiences: "Sun-i Experiences",
  brands: "For Brands",
} as const;

export async function avisarSolicitudSunni(solicitud: SolicitudSunni): Promise<void> {
  // Sin destinatarios no hay nada que hacer, y es el estado normal mientras
  // no se configure: el formulario tiene que seguir funcionando igual.
  if (env.leadsEmails.length === 0) return;

  const quien = solicitud.espacio?.trim() || solicitud.nombre;

  await Promise.all(
    env.leadsEmails.map((destinatario) =>
      sendEmail({
        to: destinatario,
        subject: `Nueva solicitud · ${ASUNTO[solicitud.tipo]} · ${quien}`,
        react: NuevaSolicitudSunni(solicitud),
        // Para que «Responder» le escriba a quien llenó el formulario.
        replyTo: solicitud.email,
      }),
    ),
  );
}
