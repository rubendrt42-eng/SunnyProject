import "server-only";
import { JWT } from "google-auth-library";

/**
 * Registro de solicitudes en Google Sheets.
 *
 * POR QUÉ UNA HOJA DE CÁLCULO Y NO UNA BASE DE DATOS
 *
 * Porque Emmy tiene que poder abrirla, ordenarla, filtrarla y escribir en la
 * columna de estado sin que nadie le construya una pantalla para eso. En esta
 * etapa el trabajo de dar seguimiento a una solicitud es manual por diseño, y
 * la herramienta para trabajo manual sobre una lista ya existe y ella ya la
 * sabe usar.
 *
 * POR QUÉ AQUÍ Y NO EN SANITY
 *
 * Esto contiene datos personales: nombres, teléfonos, correos. El dataset de
 * Sanity es **público** —cualquiera con el id del proyecto puede leerlo— porque
 * solo guarda el contenido del sitio. Meter una solicitud ahí sería publicar el
 * teléfono de una persona. Nunca.
 *
 * SEGURIDAD
 *
 * `server-only` en la primera línea: si algún día alguien importa este archivo
 * desde un componente de cliente, el build falla en vez de mandar la llave
 * privada al navegador. Las credenciales son de una cuenta de servicio con
 * acceso a UNA hoja, no a la cuenta de Google entera.
 */

/** Las dos pestañas de la hoja. Los nombres tienen que coincidir exactamente con los de Google Sheets. */
export const SHEET_TABS = {
  requests: "Solicitudes",
  businesses: "Negocios",
  /**
   * Los tres formularios de la portada de Sun-i —vending, experiencias y
   * marcas— caen en UNA sola pestaña con una columna «Tipo».
   *
   * Tres pestañas habrían sido más ordenadas sobre el papel y peores en la
   * práctica: quien revisa los contactos quiere una bandeja de entrada, no
   * tres sitios donde mirar cada mañana. Los campos de los tres se solapan
   * casi por completo, y los que no, caben en columnas de nombre general.
   */
  sunni: "Sun-i",
} as const;

/** Estado con el que entra toda solicitud. Emmy lo cambia a mano después. */
export const INITIAL_STATUS = "Nueva";

export interface SpotRequest {
  experienceId: string;
  experienceName: string;
  name: string;
  whatsapp: string;
  email: string;
  numberOfPeople: number;
  comments?: string;
}

/**
 * Un contacto de la portada de Sun-i.
 *
 * Los tres formularios comparten esta forma. Los campos que no aplican a una
 * variante llegan vacíos, y por eso las columnas tienen nombres generales:
 * «interés» es «¿cuándo lo quieres?» en vending, «qué tipo de experiencia» en
 * experiencias y «qué tipo de colaboración» en marcas.
 */
export interface SunniLead {
  tipo: "Vending" | "Experiencia" | "Marca";
  nombre: string;
  email: string;
  telefono?: string;
  /** Nombre del espacio, o de la marca en la variante de marcas. */
  espacio?: string;
  /** Tipo de espacio, o categoría de producto en la variante de marcas. */
  categoria?: string;
  ciudad?: string;
  personas?: string;
  interes?: string;
  web?: string;
  mensaje?: string;
}

export interface BusinessRequest {
  businessName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  instagram?: string;
  location?: string;
  experienceType?: string;
  message?: string;
}

/** Falta configuración. Se distingue de un fallo de red para poder decir cosas distintas en los logs. */
export class SheetsNotConfiguredError extends Error {
  constructor(missing: string[]) {
    super(`Google Sheets sin configurar. Faltan variables: ${missing.join(", ")}`);
    this.name = "SheetsNotConfiguredError";
  }
}

function readCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;

  const missing = [
    !email && "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    !rawKey && "GOOGLE_PRIVATE_KEY",
    !sheetId && "GOOGLE_SHEET_ID",
  ].filter(Boolean) as string[];

  if (missing.length) throw new SheetsNotConfiguredError(missing);

  /**
   * Los saltos de línea de la llave llegan escapados como `\n` literal.
   *
   * Es el error número uno al configurar esto: las llaves privadas son
   * multilínea, y los paneles de variables de entorno —incluido Vercel— las
   * guardan con los saltos escapados. Sin este reemplazo la librería falla con
   * un error de formato que no dice nada útil.
   */
  const privateKey = rawKey!.replace(/\\n/g, "\n");

  return { email: email!, privateKey, sheetId: sheetId! };
}

/** ¿Está configurada la integración? Para poder avisar en el arranque sin intentar escribir. */
export function isSheetsConfigured(): boolean {
  try {
    readCredentials();
    return true;
  } catch {
    return false;
  }
}

/**
 * Crea la pestaña si no existe, con su fila de encabezados.
 *
 * Sin esto, estrenar un formulario nuevo exige que alguien entre a la hoja y
 * cree la pestaña con el nombre exacto antes del primer envío. Si no lo hace
 * —y es fácil que no lo haga— el primer contacto real se pierde y el error de
 * Google («Unable to parse range») no se parece en nada al problema.
 */
async function crearPestana(token: string, sheetId: string, tab: string, encabezados: string[]): Promise<void> {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}`;
  const cabeceras = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const crear = await fetch(`${base}:batchUpdate`, {
    method: "POST",
    headers: cabeceras,
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title: tab } } }] }),
  });
  // Si otra petición la creó un instante antes, Google responde 400 y da igual.
  if (!crear.ok) {
    const detalle = await crear.text().catch(() => "");
    if (!detalle.includes("already exists")) {
      throw new Error(`No se pudo crear la pestaña «${tab}». ${detalle.slice(0, 200)}`);
    }
    return;
  }

  await fetch(
    `${base}/values/${encodeURIComponent(`${tab}!A1`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", headers: cabeceras, body: JSON.stringify({ values: [encabezados] }) },
  );
}

async function appendRow(tab: string, values: (string | number)[], encabezados?: string[]): Promise<void> {
  const { email, privateKey, sheetId } = readCredentials();

  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const { token } = await auth.getAccessToken();
  if (!token) throw new Error("Google no devolvió un token de acceso.");

  /**
   * `append` con `USER_ENTERED` para que Sheets interprete la fecha como fecha
   * y el número de personas como número, en vez de dejarlo todo como texto.
   * Emmy va a querer ordenar por fecha, y una columna de texto no se ordena
   * bien.
   */
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(`${tab}!A1`)}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: [values] }),
  });

  if (!res.ok) {
    // El cuerpo del error de Google dice qué pasó (hoja no compartida, pestaña
    // inexistente, id equivocado). Se registra sin la llave, obviamente.
    const detail = await res.text().catch(() => "");

    // Pestaña inexistente: se crea con sus encabezados y se reintenta UNA vez.
    const faltaLaPestana = res.status === 400 && detail.includes("Unable to parse range");
    if (faltaLaPestana && encabezados) {
      await crearPestana(token, sheetId, tab, encabezados);
      const reintento = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [values] }),
      });
      if (reintento.ok) return;
      const detalle2 = await reintento.text().catch(() => "");
      throw new Error(`Google Sheets respondió ${reintento.status} tras crear «${tab}». ${detalle2.slice(0, 300)}`);
    }

    throw new Error(`Google Sheets respondió ${res.status}. ${detail.slice(0, 300)}`);
  }
}

/** Marca de tiempo legible en horario de Monterrey, para que Emmy no tenga que traducir de UTC. */
function timestamp(): string {
  return new Date().toLocaleString("es-MX", {
    timeZone: "America/Monterrey",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Añade una solicitud de lugar.
 *
 * El orden de las columnas está fijado por la hoja y **no se puede cambiar sin
 * cambiar la hoja**: Sheets escribe por posición, no por nombre. Si algún día
 * hay que insertar una columna, va al final.
 */
export async function appendSpotRequest(req: SpotRequest): Promise<void> {
  await appendRow(SHEET_TABS.requests, [
    timestamp(),
    req.experienceId,
    req.experienceName,
    req.name,
    req.whatsapp,
    req.email,
    req.numberOfPeople,
    req.comments ?? "",
    INITIAL_STATUS,
    "", // Notas: la llena Emmy
  ]);
}

/** Añade una solicitud de negocio que quiere crear una experiencia con Sunny. */
export async function appendBusinessRequest(req: BusinessRequest): Promise<void> {
  await appendRow(SHEET_TABS.businesses, [
    timestamp(),
    req.businessName,
    req.contactName,
    req.whatsapp,
    req.email,
    req.instagram ?? "",
    req.location ?? "",
    req.experienceType ?? "",
    req.message ?? "",
    INITIAL_STATUS,
    "", // Notas: la llena Emmy
  ]);
}


/** Los encabezados de la pestaña «Sun-i», en el orden en que se escriben. */
const ENCABEZADOS_SUNNI = [
  "Fecha",
  "Tipo",
  "Nombre",
  "Email",
  "Teléfono",
  "Espacio o marca",
  "Tipo de espacio / categoría",
  "Ciudad",
  "Personas",
  "Interés",
  "Web o Instagram",
  "Mensaje",
  "Estado",
  "Notas",
];

/**
 * Añade un contacto de la portada de Sun-i.
 *
 * El orden lo fija la hoja: Sheets escribe por posición, no por nombre. Si
 * algún día hace falta una columna, va al final.
 */
export async function appendSunniLead(lead: SunniLead): Promise<void> {
  await appendRow(
    SHEET_TABS.sunni,
    [
      timestamp(),
      lead.tipo,
      lead.nombre,
      lead.email,
      lead.telefono ?? "",
      lead.espacio ?? "",
      lead.categoria ?? "",
      lead.ciudad ?? "",
      lead.personas ?? "",
      lead.interes ?? "",
      lead.web ?? "",
      lead.mensaje ?? "",
      INITIAL_STATUS,
      "", // Notas: se llenan a mano
    ],
    ENCABEZADOS_SUNNI,
  );
}
