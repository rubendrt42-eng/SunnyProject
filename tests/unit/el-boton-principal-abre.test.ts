import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * EL BOTÓN «BRING SUN-I» TIENE QUE ESTAR DENTRO DEL PROVEEDOR.
 *
 * QUÉ PASÓ
 *
 * `<Header />` se montaba ANTES de `<SunniModalProvider>`. El botón de la
 * cabecera llamaba a `useAbrirSunni()`, recibía el valor por defecto del
 * contexto —una función vacía— y el clic no hacía absolutamente nada.
 *
 * Sin excepción. Sin aviso en consola. Nada que mirar. Se pulsaba el botón y
 * la página se quedaba quieta.
 *
 * Y no era un botón cualquiera: es la conversión principal del sitio y sale en
 * TODAS las páginas, en las tres anchuras. Lo detectó el cliente, no nosotros,
 * porque las pruebas de QA hacían clic en el CTA del hero —que sí estaba
 * dentro del proveedor— y daban verde.
 *
 * DOS DEFENSAS
 *
 * 1. El contexto ya no tiene función vacía por defecto: vale `null` y el hook
 *    lanza un error con nombre y apellido. Un montaje mal hecho se oye.
 * 2. Esta prueba comprueba el orden en el layout, que es donde se rompió.
 */
const LAYOUT = readFileSync("app/layout.tsx", "utf8");

/** Quita comentarios: explican el fallo, así que lo nombran. */
const codigo = LAYOUT.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, " ").replace(/\/\/[^\n]*/g, " ");

describe("el botón principal abre el formulario", () => {
  it("la cabecera se monta DENTRO del proveedor del formulario", () => {
    const proveedor = codigo.indexOf("<SunniModalProvider>");
    const cabecera = codigo.indexOf("<Header />");
    const cierre = codigo.indexOf("</SunniModalProvider>");

    expect(proveedor, "no se encuentra <SunniModalProvider> en el layout").toBeGreaterThan(-1);
    expect(cabecera, "no se encuentra <Header /> en el layout").toBeGreaterThan(-1);
    expect(
      proveedor < cabecera && cabecera < cierre,
      "<Header /> quedó fuera de <SunniModalProvider>: su botón «Bring Sun-i» no abriría nada, " +
        "y lo haría sin error en consola.",
    ).toBe(true);
  });

  it("el contexto no tiene una función vacía por defecto", () => {
    const modal = readFileSync("components/lean/SunniModal.tsx", "utf8");
    expect(
      modal,
      "Con `createContext(() => {})` un componente montado fuera del proveedor falla en " +
        "silencio. El valor por defecto tiene que ser null para que el hook pueda avisar.",
    ).not.toMatch(/createContext<[^>]*>\(\(\) => \{\}\)/);
    expect(modal, "el hook dejó de avisar cuando se usa fuera del proveedor").toMatch(
      /fuera de <SunniModalProvider>/,
    );
  });
});
