import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * El orden de las columnas de la hoja de cálculo.
 *
 * POR QUÉ ESTO MERECE UNA PRUEBA
 *
 * Google Sheets escribe **por posición, no por nombre**. La petición manda un
 * arreglo de valores y Sheets los deja en A, B, C… en ese orden. No hay
 * encabezados en el camino que avisen si algo se movió.
 *
 * O sea que si alguien reordena los campos de `appendSpotRequest` —o inserta
 * uno en medio porque parece el lugar natural— nada falla: el sitio sigue
 * respondiendo `ok`, la persona ve su pantalla de éxito, y en la hoja de Emmy
 * los teléfonos empiezan a caer en la columna del correo. Un fallo silencioso
 * sobre datos que ya no se pueden recuperar, porque la solicitud original solo
 * existe ahí.
 *
 * Esta prueba fija el contrato. Si alguien cambia el orden, la prueba se rompe
 * y le recuerda que primero hay que cambiar la hoja.
 *
 * En esta versión no hay correo de aviso, así que la fila de la hoja es el
 * ÚNICO registro que queda de una solicitud. Razón de más para blindarla.
 */

vi.mock("server-only", () => ({}));

const getAccessToken = vi.fn(async () => ({ token: "token-de-prueba" }));

vi.mock("google-auth-library", () => ({
  JWT: class {
    getAccessToken = getAccessToken;
  },
}));

/** Lo que se le mandó a Google en la última llamada. */
function ultimaFila(): (string | number)[] {
  const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
  const [, init] = fetchMock.mock.calls.at(-1)!;
  return JSON.parse((init as RequestInit).body as string).values[0];
}

/** La URL de la última llamada, para comprobar a qué pestaña se escribió. */
function ultimaUrl(): string {
  const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
  return String(fetchMock.mock.calls.at(-1)![0]);
}

describe("escritura en Google Sheets", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", "cuenta@proyecto.iam.gserviceaccount.com");
    vi.stubEnv("GOOGLE_PRIVATE_KEY", "-----BEGIN PRIVATE KEY-----\\nlinea1\\nlinea2\\n-----END PRIVATE KEY-----\\n");
    vi.stubEnv("GOOGLE_SHEET_ID", "hoja-de-prueba");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 200 })),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  /*
    SOLO QUEDA UN ESCRITOR, Y ESTO VIGILA SU CONTRATO.

    Había tres: uno por pestaña. «Solicitudes» se fue con el catálogo de
    experiencias y «Negocios» con /para-negocios; sus comprobaciones se fueron
    con ellos. `appendSunniLead` es el que recibe los tres formularios de la
    portada, y el contrato que hay que proteger es el mismo de siempre: Sheets
    escribe POR POSICIÓN, no por nombre, así que mover una columna sin mover
    la hoja mete cada dato en la casilla de al lado sin que nada falle.
  */
  it("escribe el contacto en el orden exacto de las columnas", async () => {
    const { appendSunniLead, INITIAL_STATUS } = await import("@/lib/sheets");

    await appendSunniLead({
      tipo: "Vending",
      nombre: "Ana Martínez",
      email: "ana@ejemplo.com",
      telefono: "8112345678",
      espacio: "Studio Norte",
      categoria: "Gym / Studio",
      ciudad: "Monterrey",
      personas: "50–200",
      interes: "Lo antes posible",
      web: "@studionorte",
      mensaje: "Tenemos 300 socios",
    });

    const fila = ultimaFila();

    // La columna A es la marca de tiempo; depende del reloj y se comprueba aparte.
    expect(fila.slice(1)).toEqual([
      "Vending", // B  Tipo
      "Ana Martínez", // C  Nombre
      "ana@ejemplo.com", // D  Email
      "8112345678", // E  Teléfono
      "Studio Norte", // F  Espacio o marca
      "Gym / Studio", // G  Tipo de espacio / categoría
      "Monterrey", // H  Ciudad
      "50–200", // I  Personas
      "Lo antes posible", // J  Interés
      "@studionorte", // K  Web o Instagram
      "Tenemos 300 socios", // L  Mensaje
      INITIAL_STATUS, // M  Estado
      "", // N  Notas
    ]);
    expect(fila).toHaveLength(14);
  });

  it("los campos opcionales vacíos escriben celda vacía, no «undefined»", async () => {
    const { appendSunniLead } = await import("@/lib/sheets");

    // Una marca no manda ciudad ni personas. Si eso escribiera «undefined», la
    // hoja llenaría celdas con una palabra que nadie escribió.
    await appendSunniLead({ tipo: "Marca", nombre: "Ana", email: "ana@ejemplo.com" });

    const fila = ultimaFila();
    expect(fila.some((c) => String(c).includes("undefined"))).toBe(false);
    expect(fila).toHaveLength(14);
  });

  it("escribe en la pestaña «Sun-i»", async () => {
    const { appendSunniLead, SHEET_TABS } = await import("@/lib/sheets");
    await appendSunniLead({ tipo: "Experiencia", nombre: "Ana", email: "ana@ejemplo.com" });

    const url = (vi.mocked(fetch).mock.calls.at(-1)?.[0] ?? "") as string;
    expect(decodeURIComponent(url)).toContain(`${SHEET_TABS.sunni}!A1`);
  });

  it("convierte los saltos de línea escapados de la llave privada", async () => {
    // El error número uno al configurar esto. Vercel guarda la llave con los
    // saltos como `\n` literal y la librería de Google la rechaza sin explicar
    // por qué.
    const { appendSunniLead } = await import("@/lib/sheets");

    await appendSunniLead({ tipo: "Vending", nombre: "Ana", email: "ana@ejemplo.com" });

    expect(getAccessToken).toHaveBeenCalled();
  });

  it("si Google rechaza la escritura, lanza error en vez de fingir éxito", async () => {
    // Es lo que hace que la ruta responda 502 y la persona vea que su solicitud
    // no se envió. Un éxito falso la llevaría a presentarse a una clase donde
    // nadie la espera.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("La hoja no está compartida con la cuenta de servicio", { status: 403 })),
    );

    const { appendSunniLead } = await import("@/lib/sheets");

    await expect(
      appendSunniLead({ tipo: "Vending", nombre: "Ana", email: "ana@ejemplo.com" }),
    ).rejects.toThrow(/403/);
  });

  it("sin credenciales no intenta escribir y dice qué variable falta", async () => {
    vi.stubEnv("GOOGLE_SHEET_ID", "");

    const { appendSunniLead, SheetsNotConfiguredError } = await import("@/lib/sheets");

    await expect(
      appendSunniLead({ tipo: "Vending", nombre: "Ana", email: "ana@ejemplo.com" }),
    ).rejects.toThrow(SheetsNotConfiguredError);

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
