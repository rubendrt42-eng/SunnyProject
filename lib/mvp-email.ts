import "server-only";
import { Resend } from "resend";

/**
 * Los dos correos del MVP lean.
 *
 * DESACOPLADO A PROPÓSITO DE `lib/email/`
 *
 * La versión avanzada tiene plantillas de correo atadas a reservaciones,
 * folios y pases: `PaseConfirmado`, `PaseCancelado`. Nada de eso existe en este
 * MVP, y reutilizarlas obligaría a arrastrar sus tipos y su lógica. Dos correos
 * pequeños escritos desde cero son menos código que desenredar los otros.
 *
 * VARIABLES PROPIAS, NO LAS DE PRODUCCIÓN
 *
 * Los nombres llevan prefijo `MVP_` para que sea **imposible** que este flujo
 * herede por accidente la configuración de la versión avanzada. Si el MVP se
 * despliega sin configurar, no manda nada — no manda desde la cuenta de
 * producción.
 *
 * EL LENGUAJE IMPORTA
 *
 * Aquí nunca se dice «reservación confirmada», «lugar reservado», «pase» ni
 * «folio». En esta etapa el sitio **recibe una solicitud**; la confirmación la
 * da Emmy después, por su cuenta. Prometer un lugar confirmado en el correo
 * automático sería mentir, y la persona se presentaría a una clase donde nadie
 * la espera.
 */

export interface SpotRequestEmailData {
  experienceName: string;
  name: string;
  whatsapp: string;
  email: string;
  numberOfPeople: number;
  comments?: string;
}

function config() {
  const apiKey = process.env.MVP_RESEND_API_KEY;
  const from = process.env.MVP_EMAIL_FROM;
  const notify = process.env.MVP_NOTIFY_EMAIL;
  return { apiKey, from, notify, ready: Boolean(apiKey && from && notify) };
}

export function isEmailConfigured(): boolean {
  return config().ready;
}

/** Escapa el texto que entra en el HTML del correo. Lo escribe una persona desconocida en un formulario público. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL = (body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171714;line-height:1.6">
  ${body}
  <p style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e0d9;font-size:12px;color:#6d6d65">
    The Sunny Project · Monterrey
  </p>
</div>`;

/**
 * Aviso a Emmy de que entró una solicitud.
 *
 * Lleva todo lo que necesita para contactar a la persona sin abrir la hoja de
 * cálculo. El WhatsApp va como enlace pulsable porque es el canal por el que
 * realmente va a responder.
 */
async function notifyEmmy(resend: Resend, from: string, to: string, data: SpotRequestEmailData) {
  const waLink = `https://wa.me/${data.whatsapp.replace(/\D/g, "")}`;

  return resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `Nueva solicitud — ${data.experienceName}`,
    html: SHELL(`
      <h1 style="font-size:20px;margin:0 0 4px">Nueva solicitud</h1>
      <p style="margin:0 0 20px;color:#6d6d65">${esc(data.experienceName)}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6d6d65;width:120px">Nombre</td><td style="padding:8px 0;font-weight:600">${esc(data.name)}</td></tr>
        <tr><td style="padding:8px 0;color:#6d6d65">WhatsApp</td><td style="padding:8px 0"><a href="${waLink}" style="color:#bf4408">${esc(data.whatsapp)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6d6d65">Correo</td><td style="padding:8px 0"><a href="mailto:${esc(data.email)}" style="color:#bf4408">${esc(data.email)}</a></td></tr>
        <tr><td style="padding:8px 0;color:#6d6d65">Personas</td><td style="padding:8px 0;font-weight:600">${data.numberOfPeople}</td></tr>
        ${data.comments ? `<tr><td style="padding:8px 0;color:#6d6d65;vertical-align:top">Comentarios</td><td style="padding:8px 0">${esc(data.comments)}</td></tr>` : ""}
      </table>
      <p style="margin-top:24px;font-size:14px;color:#6d6d65">
        La solicitud ya quedó registrada en tu hoja de solicitudes.
      </p>
    `),
  });
}

/** Acuse de recibo para quien mandó la solicitud. No promete un lugar. */
async function confirmReceipt(resend: Resend, from: string, data: SpotRequestEmailData) {
  return resend.emails.send({
    from,
    to: data.email,
    subject: "Recibimos tu solicitud — The Sunny Project",
    html: SHELL(`
      <h1 style="font-size:20px;margin:0 0 16px">Recibimos tu solicitud</h1>
      <p style="margin:0 0 16px">
        Hola ${esc(data.name.split(" ")[0])}, recibimos tu solicitud para
        <strong>${esc(data.experienceName)}</strong>.
      </p>
      <p style="margin:0">
        The Sunny Project revisará la disponibilidad y se pondrá en contacto contigo
        para confirmar tu lugar.
      </p>
    `),
  });
}

/**
 * Manda los dos correos y devuelve si funcionaron.
 *
 * **No lanza.** Es deliberado: quien llama a esto ya guardó la solicitud en la
 * hoja, que es la operación que de verdad no se puede perder. Si el correo
 * falla, la solicitud existe igual y Emmy la va a ver — así que el fallo se
 * registra y la persona sigue viendo éxito, porque su solicitud sí se envió.
 *
 * Lo contrario sería peor: mostrarle un error después de haber guardado la
 * fila haría que volviera a enviar, y Emmy tendría la misma solicitud dos
 * veces.
 */
export async function sendSpotRequestEmails(data: SpotRequestEmailData): Promise<{
  emmy: boolean;
  user: boolean;
}> {
  const { apiKey, from, notify, ready } = config();
  if (!ready) {
    console.warn("[mvp-email] sin configurar; no se envió ningún correo");
    return { emmy: false, user: false };
  }

  const resend = new Resend(apiKey);

  // En paralelo y por separado: que el acuse al usuario falle no debe impedir
  // que Emmy reciba su aviso, ni al revés.
  const [emmyResult, userResult] = await Promise.allSettled([
    notifyEmmy(resend, from!, notify!, data),
    confirmReceipt(resend, from!, data),
  ]);

  const ok = (r: PromiseSettledResult<{ error: unknown }>) => r.status === "fulfilled" && !r.value.error;

  if (!ok(emmyResult)) console.error("[mvp-email] falló el aviso a Emmy", emmyResult);
  if (!ok(userResult)) console.error("[mvp-email] falló el acuse al usuario", userResult);

  return { emmy: ok(emmyResult), user: ok(userResult) };
}

/** Aviso a Emmy de que un negocio quiere crear una experiencia. */
export async function sendBusinessRequestEmail(data: {
  businessName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  message?: string;
}): Promise<boolean> {
  const { apiKey, from, notify, ready } = config();
  if (!ready) {
    console.warn("[mvp-email] sin configurar; no se envió el aviso de negocio");
    return false;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: from!,
      to: notify!,
      replyTo: data.email,
      subject: `Nuevo negocio interesado — ${data.businessName}`,
      html: SHELL(`
        <h1 style="font-size:20px;margin:0 0 16px">Nuevo negocio interesado</h1>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6d6d65;width:120px">Negocio</td><td style="padding:8px 0;font-weight:600">${esc(data.businessName)}</td></tr>
          <tr><td style="padding:8px 0;color:#6d6d65">Contacto</td><td style="padding:8px 0">${esc(data.contactName)}</td></tr>
          <tr><td style="padding:8px 0;color:#6d6d65">WhatsApp</td><td style="padding:8px 0">${esc(data.whatsapp)}</td></tr>
          <tr><td style="padding:8px 0;color:#6d6d65">Correo</td><td style="padding:8px 0">${esc(data.email)}</td></tr>
          ${data.message ? `<tr><td style="padding:8px 0;color:#6d6d65;vertical-align:top">Mensaje</td><td style="padding:8px 0">${esc(data.message)}</td></tr>` : ""}
        </table>
      `),
    });
    if (error) {
      console.error("[mvp-email] falló el aviso de negocio", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mvp-email] falló el aviso de negocio", err);
    return false;
  }
}
