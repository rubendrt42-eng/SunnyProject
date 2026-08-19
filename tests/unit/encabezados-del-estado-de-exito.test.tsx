import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { BusinessForm } from "@/components/lean/BusinessForm";

/**
 * El bloque de éxito no puede saltarse un nivel de encabezado.
 *
 * QUÉ PASABA
 *
 * `/para-negocios` no tiene ningún `h2`: va del `h1` de la página directamente
 * al formulario. El bloque que aparece al enviar usaba `h3`, así que la
 * jerarquía saltaba un nivel y axe-core lo marcaba como `heading-order` a 390 y
 * a 1280.
 *
 * POR QUÉ NO SALÍA EN LOS BARRIDOS
 *
 * Porque ese encabezado no existe hasta después de enviar, y los barridos miden
 * la página en reposo. Se encontró al renderizar por primera vez el estado de
 * éxito, que hoy ningún visitante ha visto: sin la hoja de cálculo configurada
 * el servidor siempre responde 503, así que el camino feliz nunca se dibuja.
 *
 * QUÉ PROTEGE
 *
 * Que el encabezado del éxito siga colgando del `h1` sin saltos. No fija el
 * texto: fija el nivel, que es lo que se rompió.
 *
 * El formulario hermano usa `h3` en el mismo sitio y ahí es correcto, porque la
 * página de la experiencia tiene «Solicitar mi lugar» como `h2` justo encima.
 * El nivel depende de la página, y este formulario solo se usa en una.
 */
afterEach(cleanup);

describe("el bloque de éxito respeta la jerarquía de la página", () => {
  it("usa h2, que es el nivel que sigue al h1 de /para-negocios", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response('{"ok":true}', { status: 200, headers: { "content-type": "application/json" } })) as typeof fetch;

    try {
      const { container } = render(<BusinessForm />);

      const set = (name: string, value: string) => {
        const el = container.querySelector(`[name="${name}"]`) as HTMLInputElement;
        fireEvent.change(el, { target: { value } });
      };
      set("businessName", "Estudio Norte");
      set("contactName", "Ana Lopez Prueba");
      set("whatsapp", "8112345678");
      set("email", "ana@ejemplo.mx");

      fireEvent.click(container.querySelector('button[type="submit"]') as HTMLButtonElement);

      await waitFor(() => {
        expect(container.querySelector('[role="status"]')).not.toBeNull();
      });

      const encabezados = [...container.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.tagName);

      expect(encabezados, "el bloque de éxito no trae ningún encabezado").not.toEqual([]);
      expect(
        encabezados,
        `la página va del h1 al ${encabezados[0]}: salto de nivel (heading-order)`,
      ).toEqual(["H2"]);
    } finally {
      globalThis.fetch = original;
    }
  });
});
