import { NextResponse, type NextRequest } from "next/server";
import { appendSpotRequest, SheetsNotConfiguredError } from "@/lib/sheets";
import { sendSpotRequestEmails } from "@/lib/mvp-email";
import { firstErrorMessage, rateLimit, spotRequestSchema } from "@/lib/mvp-validation";

/**
 * Recibe una solicitud de lugar.
 *
 * EL ORDEN DE LAS OPERACIONES ES LA DECISIÓN IMPORTANTE
 *
 * 1. Validar.
 * 2. **Escribir en la hoja de cálculo.** Si esto falla, se responde error y no
 *    se manda ningún correo.
 * 3. Mandar los correos. Si esto falla, se responde éxito igualmente.
 *
 * El motivo: la hoja es la única fuente de verdad de una solicitud. Un correo
 * es un aviso de algo que ya pasó.
 *
 * Si se hiciera al revés —correo primero— y la hoja fallara, la persona
 * recibiría «recibimos tu solicitud» por una solicitud que no existe en ninguna
 * parte, y se presentaría a una clase donde nadie la espera.
 *
 * Y si un fallo de correo devolviera error, la persona volvería a enviar el
 * formulario y Emmy tendría la misma solicitud dos veces en su hoja. Entre
 * «Emmy no recibe el aviso pero la fila está» y «hay filas duplicadas», lo
 * primero se arregla mirando la hoja; lo segundo genera dos conversaciones con
 * la misma persona.
 */
export async function POST(request: NextRequest) {
  // `x-forwarded-for` es lo que pone el proxy de Vercel. En local no existe y
  // el límite cae en una clave común, que es aceptable para desarrollo.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";

  if (!rateLimit(ip).ok) {
    return NextResponse.json(
      { error: "Recibimos varias solicitudes seguidas. Espera un minuto e inténtalo de nuevo." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "No pudimos leer los datos del formulario." }, { status: 400 });
  }

  const parsed = spotRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstErrorMessage(parsed.error) }, { status: 400 });
  }

  const data = parsed.data;

  // Paso crítico. Si esto no queda registrado, la solicitud no existe.
  try {
    await appendSpotRequest({
      experienceId: data.experienceId,
      experienceName: data.experienceName,
      name: data.name,
      whatsapp: data.whatsapp,
      email: data.email,
      numberOfPeople: data.numberOfPeople,
      comments: data.comments || undefined,
    });
  } catch (err) {
    if (err instanceof SheetsNotConfiguredError) {
      console.error("[solicitudes] Google Sheets sin configurar:", err.message);
    } else {
      console.error("[solicitudes] falló el registro en la hoja:", err);
    }
    return NextResponse.json(
      { error: "No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos." },
      { status: 502 },
    );
  }

  // Paso secundario. Un fallo aquí no invalida la solicitud.
  const emails = await sendSpotRequestEmails({
    experienceName: data.experienceName,
    name: data.name,
    whatsapp: data.whatsapp,
    email: data.email,
    numberOfPeople: data.numberOfPeople,
    comments: data.comments || undefined,
  });

  return NextResponse.json({ ok: true, emails });
}
