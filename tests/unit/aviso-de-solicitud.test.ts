import { readFileSync } from "node:fs";
import { render } from "@react-email/render";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import NuevaSolicitudSunni, { CAMPOS, PREGUNTA_MENSAJE, type VarianteSunni } from "@/emails/NuevaSolicitudSunni";

/**
 * EL AVISO QUE LE LLEGA A EMMY CUANDO ALGUIEN LLENA UN FORMULARIO.
 *
 * QUÉ PASABA
 *
 * Nada: la solicitud se guardaba en la hoja de cálculo y ahí se quedaba. Si
 * nadie abría la hoja, nadie se enteraba. Para un sitio cuya única conversión
 * es ese formulario, eso es perder al cliente por no mirar.
 *
 * QUÉ PROTEGE
 *
 * Tres cosas, y las tres se rompen en silencio:
 *
 * 1. Que el correo nombre los campos COMO SE LLAMAN EN PANTALLA. Los tres
 *    formularios usan las mismas claves para preguntas distintas: `interes`
 *    es «¿Para cuándo?» en vending y «Tipo de colaboración» en marcas. Quien
 *    renombre una pregunta en el formulario y no aquí dejaría un correo que
 *    miente sobre lo que contestó la persona.
 *
 * 2. Que no se caiga un campo. Si mañana el formulario pregunta algo nuevo y
 *    el correo no lo incluye, el dato existe en la hoja pero no en el aviso,
 *    y nadie lo echa de menos porque nadie sabe que debería estar.
 *
 * 3. Que los campos vacíos no se impriman. Casi todo es opcional; una lista
 *    de seis etiquetas sin valor esconde los tres datos que sí llegaron.
 */

/** Los campos que el correo imprime aparte, antes del bloque de la variante. */
const SIEMPRE = ["nombre", "email", "telefono"];

/**
 * Las etiquetas del formulario, leídas de su código.
 *
 * Se leen del archivo en vez de importarlo porque `SunniModal` es un
 * componente de cliente con sus animaciones detrás: para comparar dos textos
 * no hace falta cargar todo eso.
 */
function etiquetasDelFormulario(): Record<VarianteSunni, Record<string, string>> {
  const fuente = readFileSync("components/lean/SunniModal.tsx", "utf8");
  const variantes: VarianteSunni[] = ["vending", "experiences", "brands"];
  const resultado = {} as Record<VarianteSunni, Record<string, string>>;

  variantes.forEach((v, i) => {
    const desde = fuente.indexOf(`\n  ${v}: {`);
    expect(desde, `ya no se encuentra la variante «${v}» en el formulario`).toBeGreaterThan(-1);
    const siguiente = variantes[i + 1];
    const hasta = siguiente ? fuente.indexOf(`\n  ${siguiente}: {`) : fuente.indexOf("\n};", desde);
    const trozo = fuente.slice(desde, hasta);

    const campos: Record<string, string> = {};
    // Sin la bandera `s`: pide ES2018 y el proyecto compila a ES2017.
    const patron = /name:\s*"([a-zA-Z]+)",[\s\S]{0,60}?label:\s*"([^"]+)"/g;
    let m: RegExpExecArray | null;
    while ((m = patron.exec(trozo)) !== null) campos[m[1]] = m[2];

    expect(Object.keys(campos).length, `no se leyó ningún campo de «${v}»`).toBeGreaterThan(4);
    resultado[v] = campos;
  });

  return resultado;
}

describe("el aviso de solicitud nueva", () => {
  const delFormulario = etiquetasDelFormulario();

  (["vending", "experiences", "brands"] as const).forEach((variante) => {
    it(`nombra los campos de «${variante}» igual que el formulario`, () => {
      const enPantalla = delFormulario[variante];

      for (const campo of CAMPOS[variante]) {
        expect(
          enPantalla[campo.name],
          `el formulario ya no pregunta «${campo.name}» en ${variante}`,
        ).toBeDefined();
        expect(
          campo.label,
          `el correo dice «${campo.label}» y el formulario dice «${enPantalla[campo.name]}»`,
        ).toBe(enPantalla[campo.name]);
      }

      expect(PREGUNTA_MENSAJE[variante]).toBe(enPantalla.mensaje);
    });

    it(`no deja fuera ningún campo de «${variante}»`, () => {
      const esperados = Object.keys(delFormulario[variante]).filter(
        (n) => !SIEMPRE.includes(n) && n !== "mensaje",
      );
      const enElCorreo = CAMPOS[variante].map((c) => String(c.name));
      const faltan = esperados.filter((n) => !enElCorreo.includes(n));

      expect(faltan, `el formulario pregunta esto y el correo no lo manda: ${faltan.join(", ")}`).toEqual([]);
    });
  });

  it("escribe lo que llegó, con la pregunta de su variante", async () => {
    const html = await render(
      NuevaSolicitudSunni({
        tipo: "brands",
        nombre: "Ana López",
        email: "ana@marca.mx",
        espacio: "Agua Viva",
        categoria: "Hidratación",
        interes: "Sampling",
        mensaje: "Queremos probar en dos gyms de San Pedro.",
      }),
    );

    expect(html).toContain("Agua Viva");
    expect(html).toContain("ana@marca.mx");
    expect(html).toContain("Hidratación");
    // La etiqueta de marcas, no la de vending.
    expect(html).toContain("Tipo de colaboración");
    expect(html).not.toContain("¿Para cuándo?");
    expect(html).toContain("Cuéntanos sobre tu marca");
    // Y el nombre de la marca anterior no aparece por ningún lado.
    expect(html.toLowerCase()).not.toContain("feelgood");
    expect(html.toLowerCase()).not.toContain("sunnyproject.mx");
  });

  it("no imprime etiquetas de campos que nadie llenó", async () => {
    const html = await render(
      NuevaSolicitudSunni({
        tipo: "vending",
        nombre: "Luis",
        email: "luis@gym.mx",
        espacio: "Gym Norte",
        ciudad: "Monterrey",
      }),
    );

    expect(html).toContain("Gym Norte");
    expect(html).toContain("Monterrey");
    // El titular ya dice el nombre del espacio; no se repite abajo.
    expect(html).not.toContain("Nombre del espacio");
    expect(html).not.toContain("Personas que pasan al día");
    expect(html).not.toContain("¿Para cuándo?");
    expect(html).not.toContain("Teléfono");
  });
});

/**
 * A quién le llega el aviso.
 *
 * Se recarga el módulo en cada caso porque el valor se calcula una sola vez,
 * al importarlo.
 */
describe("a quién se le avisa", () => {
  const ORIGINAL = { ...process.env };

  async function destinatariosCon(vars: Record<string, string | undefined>): Promise<string[]> {
    for (const k of ["LEADS_EMAIL", "ADMIN_EMAIL"]) delete process.env[k];
    for (const [k, v] of Object.entries(vars)) if (v !== undefined) process.env[k] = v;
    vi.resetModules();
    const { env } = await import("@/lib/env");
    return env.leadsEmails;
  }

  beforeEach(() => vi.resetModules());
  afterEach(() => {
    process.env = { ...ORIGINAL };
    vi.resetModules();
  });

  it("acepta varias direcciones separadas por comas", async () => {
    expect(await destinatariosCon({ LEADS_EMAIL: "emmy@sun.mx, ruben@sun.mx" })).toEqual([
      "emmy@sun.mx",
      "ruben@sun.mx",
    ]);
  });

  it("no distingue mayúsculas ni espacios de más", async () => {
    expect(await destinatariosCon({ LEADS_EMAIL: "  Emmy@Sun.MX  " })).toEqual(["emmy@sun.mx"]);
  });

  it("cae en ADMIN_EMAIL mientras no se ponga la suya", async () => {
    expect(await destinatariosCon({ ADMIN_EMAIL: "admin@sun.mx" })).toEqual(["admin@sun.mx"]);
  });

  it("prefiere LEADS_EMAIL cuando están las dos", async () => {
    expect(await destinatariosCon({ LEADS_EMAIL: "emmy@sun.mx", ADMIN_EMAIL: "admin@sun.mx" })).toEqual([
      "emmy@sun.mx",
    ]);
  });

  it("descarta lo que no es una dirección", async () => {
    expect(await destinatariosCon({ LEADS_EMAIL: "emmy@sun.mx, ,pendiente" })).toEqual(["emmy@sun.mx"]);
  });

  it("sin configurar, no hay a quién avisarle y el formulario sigue igual", async () => {
    expect(await destinatariosCon({})).toEqual([]);
  });
});
