import { NextResponse, type NextRequest } from "next/server";
import { appendSunniLead, SheetsNotConfiguredError } from "@/lib/sheets";
import { firstErrorMessage, rateLimit, sunniLeadSchema } from "@/lib/mvp-validation";

/**
 * Los tres formularios de la portada de Sun-i: vending, experiencias y marcas.
 *
 * LA DIFERENCIA CON LA VERSIÓN QUE VIO EMMY
 *
 * En la página que ella armó en Lovable, los tres formularios hacen
 * `preventDefault()` y enseñan una pantalla de «gracias». No guardan nada, no
 * mandan nada: el contacto se pierde en el navegador de quien lo escribió.
 * Está anotado como pendiente en su propia especificación.
 *
 * Aquí escriben en la misma hoja de cálculo que ya usan los otros dos
 * formularios del sitio, en la pestaña «Sun-i», y con el mismo control de
 * ritmo por IP y el mismo campo trampa contra robots.
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

  const parsed = sunniLeadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: firstErrorMessage(parsed.error) }, { status: 400 });
  }

  const d = parsed.data;
  const ETIQUETA = { vending: "Vending", experiences: "Experiencia", brands: "Marca" } as const;

  try {
    await appendSunniLead({
      tipo: ETIQUETA[d.tipo],
      nombre: d.nombre,
      email: d.email,
      telefono: d.telefono,
      espacio: d.espacio,
      categoria: d.categoria,
      ciudad: d.ciudad,
      personas: d.personas,
      interes: d.interes,
      web: d.web,
      mensaje: d.mensaje,
    });
  } catch (err) {
    // Mismo criterio que el resto de las rutas: falta de configuración y fallo
    // pasajero no son lo mismo, y decir «inténtalo en unos minutos» cuando la
    // hoja no existe es prometer algo que no va a pasar.
    if (err instanceof SheetsNotConfiguredError) {
      console.error("[sun-i] Google Sheets sin configurar:", err.message);
      return NextResponse.json(
        { error: "El formulario todavía no está disponible. Vuelve en unos días." },
        { status: 503 },
      );
    }

    console.error("[sun-i] falló el registro en la hoja:", err);
    return NextResponse.json(
      { error: "No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
