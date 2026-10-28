import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * El sitio tiene que presentarse con su propio dominio.
 *
 * QUÉ PASABA
 *
 * `env.siteUrl` salía de `NEXT_PUBLIC_SITE_URL` y, si faltaba, del dominio que
 * Vercel expone solo. La variable nunca llegó a ponerse, así que en producción
 * la URL canónica, la imagen de compartir y el mapa del sitio decían todos
 * `https://sunny-mvp.vercel.app`.
 *
 * Google hizo caso: indexó esa dirección en lugar del dominio del cliente y,
 * como el resultado vivía en `vercel.app`, puso «Vercel» y su logotipo encima
 * del nombre de la marca en la ficha de búsqueda.
 *
 * Es un fallo que no se ve desde dentro. La página se ve perfecta; lo que
 * cambia es lo que el sitio dice de sí mismo en el `<head>`, y eso solo lo
 * leen los buscadores y las aplicaciones de mensajería.
 *
 * QUÉ PROTEGE
 *
 * Que producción use el dominio aunque nadie ponga la variable, que una
 * previsualización NO se haga pasar por producción, y que nunca se comparta
 * un enlace a localhost.
 *
 * Se recarga el módulo en cada caso porque el valor se calcula una sola vez,
 * al importarlo.
 */
const ORIGINAL = { ...process.env };
const OFICIAL = "https://www.suniproject.com";

async function siteUrlCon(vars: Record<string, string | undefined>): Promise<string> {
  for (const k of ["NEXT_PUBLIC_SITE_URL", "VERCEL_ENV", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"])
    delete process.env[k];
  for (const [k, v] of Object.entries(vars)) if (v !== undefined) process.env[k] = v;
  vi.resetModules();
  const { env } = await import("@/lib/env");
  return env.siteUrl;
}

beforeEach(() => vi.resetModules());
afterEach(() => {
  process.env = { ...ORIGINAL };
  vi.resetModules();
});

describe("la dirección pública del sitio", () => {
  it("en producción usa el dominio oficial sin necesitar ninguna variable", async () => {
    /*
      ESTE ES EL CASO QUE FALLABA. Tal cual está Vercel hoy: `VERCEL_ENV` en
      production, `NEXT_PUBLIC_SITE_URL` sin poner, y el dominio de Vercel
      disponible. Antes ganaba el de Vercel.
    */
    const url = await siteUrlCon({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "sunny-mvp.vercel.app",
      VERCEL_URL: "sunny-mvp-abc123.vercel.app",
    });
    expect(url).toBe(OFICIAL);
  });

  it("nunca se presenta como vercel.app en producción", async () => {
    const url = await siteUrlCon({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "sunny-mvp.vercel.app" });
    expect(url, "Google indexaría la dirección de Vercel en vez del dominio").not.toContain("vercel.app");
  });

  it("ignora la variable si en producción trae la dirección de Vercel", async () => {
    /*
      ESTE ERA EL CASO REAL. Primero se creyó que `NEXT_PUBLIC_SITE_URL` no
      estaba puesta; sí lo estaba, con `https://sunny-mvp.vercel.app` dentro.
      Por eso poner el dominio en el código no cambió nada: la variable gana.

      En producción un `*.vercel.app` no es la dirección del sitio, es la del
      despliegue. Nadie la quiere como canónica.
    */
    const url = await siteUrlCon({
      NEXT_PUBLIC_SITE_URL: "https://sunny-mvp.vercel.app",
      VERCEL_ENV: "production",
    });
    expect(url).toBe(OFICIAL);
  });

  it("fuera de producción sí respeta un vercel.app, que es donde vive de verdad", async () => {
    const url = await siteUrlCon({
      NEXT_PUBLIC_SITE_URL: "https://sunny-mvp-abc123.vercel.app",
      VERCEL_ENV: "preview",
    });
    expect(url).toBe("https://sunny-mvp-abc123.vercel.app");
  });

  it("una dirección mal escrita no tumba el sitio", async () => {
    // `new URL()` lanza con basura; se trata como una dirección cualquiera.
    expect(await siteUrlCon({ NEXT_PUBLIC_SITE_URL: "no-es-una-url" })).toBe("no-es-una-url");
  });

  it("usa NEXT_PUBLIC_SITE_URL cuando está puesta", async () => {
    expect(await siteUrlCon({ NEXT_PUBLIC_SITE_URL: "https://thesunnyproject.mx" })).toBe("https://thesunnyproject.mx");
  });

  it("manda la variable por encima del dominio oficial", async () => {
    /*
      Sigue siendo la que gana: permite mover el sitio de dominio sin tocar
      código ni volver a desplegar desde cero.
    */
    const url = await siteUrlCon({
      NEXT_PUBLIC_SITE_URL: "https://thesunnyproject.mx",
      VERCEL_ENV: "production",
    });
    expect(url).toBe("https://thesunnyproject.mx");
  });

  it("una previsualización se prueba a sí misma, no se hace pasar por el sitio", async () => {
    /*
      Si una rama en pruebas dijera ser el dominio oficial, su canónica y su
      imagen de compartir apuntarían a producción y no se podría revisar lo
      que de verdad cambió.
    */
    const url = await siteUrlCon({ VERCEL_ENV: "preview", VERCEL_URL: "sunny-mvp-abc123.vercel.app" });
    expect(url).toBe("https://sunny-mvp-abc123.vercel.app");
  });

  it("solo llega a localhost fuera de Vercel", async () => {
    expect(await siteUrlCon({})).toBe("http://localhost:3000");
  });

  it("nunca comparte un enlace a localhost estando en Vercel", async () => {
    const url = await siteUrlCon({ VERCEL_ENV: "preview", VERCEL_URL: "sunny-mvp-abc123.vercel.app" });
    expect(url).not.toContain("localhost");
  });
});
