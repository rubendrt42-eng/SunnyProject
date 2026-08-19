import { NextResponse, type NextRequest } from "next/server";
import { appendSpotRequest, SheetsNotConfiguredError } from "@/lib/sheets";
import { firstErrorMessage, rateLimit, spotRequestSchema } from "@/lib/mvp-validation";

/**
 * Recibe una solicitud de lugar.
 *
 * DOS PASOS, NO TRES: validar y escribir en la hoja de cálculo. No hay correo.
 *
 * Esta versión no manda ningún aviso automático — ni a quien solicita ni a
 * Emmy. La hoja de Google **es** el sistema: ahí caen las solicitudes y ahí las
 * revisa ella. Quitar el correo quita un servicio que configurar, un dominio
 * que verificar y una forma más de que el flujo falle a medias.
 *
 * Consecuencia operativa que conviene tener presente: **nadie recibe una
 * notificación empujada.** Emmy tiene que abrir la hoja para enterarse de que
 * entró una solicitud. Es una decisión consciente de esta etapa, no un
 * descuido.
 *
 * La escritura en la hoja es la única operación crítica. Si falla, se responde
 * error y la persona ve que su solicitud no se envió — nunca un éxito falso,
 * que la llevaría a presentarse a una clase donde nadie la espera.
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
    /**
     * DOS FALLOS DISTINTOS, DOS MENSAJES DISTINTOS
     *
     * «Inténtalo nuevamente en unos minutos» es verdad cuando la hoja está
     * configurada y el fallo es pasajero. Es mentira cuando la hoja **no** está
     * configurada: por muchos minutos que espere, nunca va a funcionar.
     *
     * Y esa es exactamente la situación de hoy — el sitio está publicado y
     * `GOOGLE_SHEET_ID` todavía no existe, así que cualquiera que entre, llene
     * el formulario y pulse enviar recibe una promesa que el sistema no puede
     * cumplir. El aviso se guarda bien, se lee y se anuncia; lo que estaba mal
     * era lo que decía.
     *
     * En cuanto la hoja esté configurada este camino deja de ocurrir y vuelve a
     * mandar el mensaje de reintento, que entonces sí es cierto.
     */
    if (err instanceof SheetsNotConfiguredError) {
      console.error("[solicitudes] Google Sheets sin configurar:", err.message);
      return NextResponse.json(
        { error: "El formulario todavía no está disponible. Vuelve en unos días." },
        { status: 503 },
      );
    }

    console.error("[solicitudes] falló el registro en la hoja:", err);
    return NextResponse.json(
      { error: "No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
