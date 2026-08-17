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

  it("escribe la solicitud de lugar en el orden exacto de las columnas", async () => {
    const { appendSpotRequest, INITIAL_STATUS } = await import("@/lib/sheets");

    await appendSpotRequest({
      experienceId: "exp-123",
      experienceName: "Yoga al atardecer",
      name: "Ana Martínez",
      whatsapp: "8112345678",
      email: "ana@ejemplo.com",
      numberOfPeople: 2,
      comments: "Voy con una amiga",
    });

    const fila = ultimaFila();

    // Columna A es la marca de tiempo; se comprueba aparte porque depende del reloj.
    expect(fila.slice(1)).toEqual([
      "exp-123", // B  Experiencia (id)
      "Yoga al atardecer", // C  Experiencia (nombre)
      "Ana Martínez", // D  Nombre
      "8112345678", // E  WhatsApp
      "ana@ejemplo.com", // F  Correo
      2, // G  Personas
      "Voy con una amiga", // H  Comentarios
      INITIAL_STATUS, // I  Estado
      "", // J  Notas (la llena Emmy)
    ]);
    expect(fila).toHaveLength(10);
  });

  it("escribe la solicitud de negocio en el orden exacto de las columnas", async () => {
    const { appendBusinessRequest, INITIAL_STATUS } = await import("@/lib/sheets");

    await appendBusinessRequest({
      businessName: "Studio Norte",
      contactName: "Luis Pérez",
      whatsapp: "8187654321",
      email: "hola@studionorte.mx",
      instagram: "@studionorte",
      location: "San Pedro",
      experienceType: "Pilates",
      message: "Nos interesa colaborar",
    });

    expect(ultimaFila().slice(1)).toEqual([
      "Studio Norte", // B  Negocio
      "Luis Pérez", // C  Contacto
      "8187654321", // D  WhatsApp
      "hola@studionorte.mx", // E  Correo
      "@studionorte", // F  Instagram
      "San Pedro", // G  Zona
      "Pilates", // H  Tipo de experiencia
      "Nos interesa colaborar", // I  Mensaje
      INITIAL_STATUS, // J  Estado
      "", // K  Notas
    ]);
    expect(ultimaFila()).toHaveLength(11);
  });

  it("los campos opcionales vacíos escriben celda vacía, no «undefined»", async () => {
    // Sin esto, la hoja de Emmy se llena de la palabra «undefined» en las
    // columnas que la persona dejó en blanco.
    const { appendBusinessRequest } = await import("@/lib/sheets");

    await appendBusinessRequest({
      businessName: "Studio Norte",
      contactName: "Luis Pérez",
      whatsapp: "8187654321",
      email: "hola@studionorte.mx",
    });

    const fila = ultimaFila();
    expect(fila.slice(5, 9)).toEqual(["", "", "", ""]);
    expect(fila.every((v) => v !== undefined && v !== null)).toBe(true);
  });

  it("cada formulario escribe en su propia pestaña", async () => {
    const { appendSpotRequest, appendBusinessRequest, SHEET_TABS } = await import("@/lib/sheets");

    await appendSpotRequest({
      experienceId: "exp-123",
      experienceName: "Yoga",
      name: "Ana",
      whatsapp: "8112345678",
      email: "ana@ejemplo.com",
      numberOfPeople: 1,
    });
    expect(decodeURIComponent(ultimaUrl())).toContain(`${SHEET_TABS.requests}!A1:append`);

    await appendBusinessRequest({
      businessName: "Studio Norte",
      contactName: "Luis",
      whatsapp: "8187654321",
      email: "hola@studionorte.mx",
    });
    expect(decodeURIComponent(ultimaUrl())).toContain(`${SHEET_TABS.businesses}!A1:append`);
  });

  it("convierte los saltos de línea escapados de la llave privada", async () => {
    // El error número uno al configurar esto. Vercel guarda la llave con los
    // saltos como `\n` literal y la librería de Google la rechaza sin explicar
    // por qué.
    const { appendSpotRequest } = await import("@/lib/sheets");

    await appendSpotRequest({
      experienceId: "exp-123",
      experienceName: "Yoga",
      name: "Ana",
      whatsapp: "8112345678",
      email: "ana@ejemplo.com",
      numberOfPeople: 1,
    });

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

    const { appendSpotRequest } = await import("@/lib/sheets");

    await expect(
      appendSpotRequest({
        experienceId: "exp-123",
        experienceName: "Yoga",
        name: "Ana",
        whatsapp: "8112345678",
        email: "ana@ejemplo.com",
        numberOfPeople: 1,
      }),
    ).rejects.toThrow(/403/);
  });

  it("sin credenciales no intenta escribir y dice qué variable falta", async () => {
    vi.stubEnv("GOOGLE_SHEET_ID", "");

    const { appendSpotRequest, SheetsNotConfiguredError } = await import("@/lib/sheets");

    await expect(
      appendSpotRequest({
        experienceId: "exp-123",
        experienceName: "Yoga",
        name: "Ana",
        whatsapp: "8112345678",
        email: "ana@ejemplo.com",
        numberOfPeople: 1,
      }),
    ).rejects.toThrow(SheetsNotConfiguredError);

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
