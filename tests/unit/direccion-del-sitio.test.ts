import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * El enlace que se comparte no puede apuntar a localhost.
 *
 * QUÉ PROTEGE
 *
 * `env.siteUrl` arma la dirección que se manda por WhatsApp al compartir una
 * experiencia. Antes caía en `http://localhost:3000` en cuanto faltaba
 * `NEXT_PUBLIC_SITE_URL`, y ese fallo es invisible desde dentro: la página se
 * ve perfecta, el botón funciona, y el enlace solo se rompe cuando alguien al
 * otro lado lo abre.
 *
 * Hoy la variable está puesta. El riesgo es el día que se cree el proyecto de
 * Vercel del dominio definitivo y no se copie.
 *
 * Se recarga el módulo en cada caso porque el valor se calcula una sola vez, al
 * importarlo.
 */
const ORIGINAL = { ...process.env };

async function siteUrlCon(vars: Record<string, string | undefined>): Promise<string> {
  for (const k of ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL"]) delete process.env[k];
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
  it("usa NEXT_PUBLIC_SITE_URL cuando está puesta", async () => {
    expect(await siteUrlCon({ NEXT_PUBLIC_SITE_URL: "https://thesunnyproject.mx" })).toBe("https://thesunnyproject.mx");
  });

  it("manda la variable por encima del dominio de Vercel", async () => {
    const url = await siteUrlCon({
      NEXT_PUBLIC_SITE_URL: "https://thesunnyproject.mx",
      VERCEL_PROJECT_PRODUCTION_URL: "otro.vercel.app",
    });
    expect(url).toBe("https://thesunnyproject.mx");
  });

  it("cae en el dominio de producción de Vercel si falta la variable", async () => {
    expect(await siteUrlCon({ VERCEL_PROJECT_PRODUCTION_URL: "sunny-mvp.vercel.app" })).toBe(
      "https://sunny-mvp.vercel.app",
    );
  });

  it("usa la URL del despliegue si no hay dominio de producción", async () => {
    expect(await siteUrlCon({ VERCEL_URL: "sunny-mvp-abc123.vercel.app" })).toBe("https://sunny-mvp-abc123.vercel.app");
  });

  it("solo llega a localhost fuera de Vercel", async () => {
    expect(await siteUrlCon({})).toBe("http://localhost:3000");
  });

  it("nunca comparte un enlace a localhost estando en Vercel", async () => {
    const url = await siteUrlCon({ VERCEL_URL: "sunny-mvp-abc123.vercel.app" });
    expect(url).not.toContain("localhost");
  });
});
