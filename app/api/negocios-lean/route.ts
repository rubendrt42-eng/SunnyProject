import { NextResponse, type NextRequest } from "next/server";
import { appendBusinessRequest, SheetsNotConfiguredError } from "@/lib/sheets";
import { businessRequestSchema, firstErrorMessage, rateLimit } from "@/lib/mvp-validation";

/**
 * Recibe la solicitud de un negocio que quiere crear una experiencia con Sunny.
 *
 * Igual que `/api/solicitudes`: se valida y se escribe en la hoja. No hay
 * correo automático en esta etapa; la pestaña «Negocios» de la hoja es donde
 * Emmy los revisa.
 *
 * Se llama `negocios-lean` y no `negocios` porque `/api/partner-leads` de la
 * versión avanzada sigue existiendo en el repositorio y escribe en Supabase.
 * Dos rutas con nombres parecidos apuntando a destinos distintos es la clase de
 * confusión que hace que alguien conecte el formulario al endpoint equivocado.
 *
 * **Nada de esto publica nada automáticamente.** Un negocio que llena el
 * formulario queda en una lista para que Emmy lo revise; no aparece en el sitio.
 */
export async function POST(request: NextRequest) {
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

  const parsed = businessRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstErrorMessage(parsed.error) }, { status: 400 });
  }

  const data = parsed.data;

  try {
    await appendBusinessRequest({
      businessName: data.businessName,
      contactName: data.contactName,
      whatsapp: data.whatsapp,
      email: data.email,
      instagram: data.instagram || undefined,
      location: data.location || undefined,
      experienceType: data.experienceType || undefined,
      message: data.message || undefined,
    });
  } catch (err) {
    if (err instanceof SheetsNotConfiguredError) {
      console.error("[negocios] Google Sheets sin configurar:", err.message);
    } else {
      console.error("[negocios] falló el registro en la hoja:", err);
    }
    return NextResponse.json(
      { error: "No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
