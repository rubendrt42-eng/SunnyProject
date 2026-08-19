import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Ningún secreto puede acabar versionado.
 *
 * POR QUÉ EXISTE ESTA PRUEBA AHORA
 *
 * Se rastreó el historial completo —94 commits— buscando llaves privadas,
 * cuentas de servicio de Google y claves de Supabase. Las tres coincidencias son
 * inofensivas y están verificadas una por una:
 *
 *     e5fb866  un fixture de prueba: «-----BEGIN PRIVATE KEY-----\nlinea1...»
 *     22a748c  documentación describiendo cómo se ve la cadena
 *     37fd61e  documentación, y el nombre del rol de PostgreSQL en una política
 *
 * Nunca se versionó un `.env.local` ni un JSON de credenciales, y `.gitignore`
 * lleva `.env*` con `!.env.example`.
 *
 * O sea que hoy está limpio. Lo que viene es justo el momento de riesgo: las
 * tres variables de Google están **vacías y esperando** en `.env.example`, y el
 * paso siguiente del proyecto es rellenarlas. Escribir el valor en el archivo
 * equivocado —el que está versionado, en vez de `.env.local`— es un error de un
 * segundo y de los que no se pueden deshacer: una llave privada publicada hay
 * que revocarla, no borrarla del historial.
 *
 * QUÉ PROTEGE
 *
 * Que los tres secretos sigan sin valor en el archivo versionado. Las variables
 * de Sanity sí llevan valor a propósito: el id de proyecto y el dataset viajan
 * en cada petición del navegador, no son secretos.
 */
const EJEMPLO = readFileSync(".env.example", "utf8");

/** El valor declarado para una variable, o null si la línea no existe. */
function valorDe(nombre: string): string | null {
  const linea = EJEMPLO.split("\n").find((l) => l.trimStart().startsWith(`${nombre}=`));
  return linea === undefined ? null : linea.slice(linea.indexOf("=") + 1).trim();
}

const SECRETAS = ["GOOGLE_SERVICE_ACCOUNT_EMAIL", "GOOGLE_PRIVATE_KEY", "GOOGLE_SHEET_ID"];

describe("el archivo de ejemplo no lleva secretos", () => {
  for (const nombre of SECRETAS) {
    it(`${nombre} está declarada y vacía`, () => {
      const valor = valorDe(nombre);
      expect(valor, `${nombre} desapareció de .env.example`).not.toBeNull();
      expect(
        valor,
        `${nombre} tiene un valor en un archivo versionado. Si es real, revócalo: ` +
          `borrarlo del historial no basta.`,
      ).toBe("");
    });
  }

  it("no hay ninguna llave privada pegada en el archivo", () => {
    expect(EJEMPLO, "hay una llave privada en .env.example").not.toMatch(/BEGIN [A-Z ]*PRIVATE KEY/);
    expect(EJEMPLO, "hay un correo de cuenta de servicio en .env.example").not.toMatch(
      /[a-z0-9-]+@[a-z0-9-]+\.iam\.gserviceaccount\.com/i,
    );
  });

  it("`.gitignore` sigue excluyendo los archivos de entorno", () => {
    const ignore = readFileSync(".gitignore", "utf8");
    expect(ignore, "se dejó de ignorar .env*").toMatch(/^\.env\*/m);
    expect(ignore, "se dejó de exceptuar .env.example").toMatch(/^!\.env\.example/m);
  });

  it("las variables de Sanity sí llevan valor, que no son secretas", () => {
    expect(valorDe("NEXT_PUBLIC_SANITY_PROJECT_ID")).toBeTruthy();
    expect(valorDe("NEXT_PUBLIC_SANITY_DATASET")).toBeTruthy();
  });
});
