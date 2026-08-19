import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WordReveal } from "@/components/motion/WordReveal";

/**
 * El titular del hero tiene que aguantar cualquier palabra que Emmy escriba.
 *
 * QUÉ PASABA
 *
 * Cada palabra va en su propio `inline-block` para poder entrar escalonada. Ese
 * span llevaba `whitespace-pre`, que conserva el espacio final —hacía falta,
 * sin él el hero decía «Descubre algonuevo»— pero además **prohíbe partir
 * dentro de la palabra**. `overflow-wrap` no se aplica donde no se permite
 * ajustar, así que una palabra más ancha que la pantalla hacía crecer su caja
 * hasta el ancho natural del texto. Y como el hero recorta con `overflow-clip`,
 * el resultado no era una barra de scroll horizontal sino texto que
 * desaparecía por el borde sin dejar rastro.
 *
 * Medido en la portada a 320px, donde caben unas 12 letras:
 *
 *     «profundamente»    286px  >  280px disponibles
 *     «acompañamiento»   322px
 *     «autoconocimiento» 337px
 *
 * Palabras normales en español. `whitespace-pre-wrap` conserva el espacio
 * igual y sí permite ajustar.
 *
 * QUÉ PROTEGE
 *
 * Las dos propiedades a la vez, porque arreglar una rompiendo la otra es
 * exactamente lo que pasó: que cada palabra conserve su espacio y que se
 * permita partirla si no cabe. No comprueba anchos —eso depende de la fuente
 * cargada— sino la regla de espacio en blanco, que es la causa.
 */
afterEach(cleanup);

describe("el titular del hero", () => {
  it("conserva el espacio entre palabras", () => {
    const { container } = render(<WordReveal text="Descubre algo nuevo." />);
    const visibles = [...container.querySelectorAll("span[aria-hidden]")];

    expect(visibles.map((s) => s.textContent)).toEqual(["Descubre ", "algo ", "nuevo."]);
    expect(visibles.map((s) => s.textContent).join("")).toBe("Descubre algo nuevo.");
  });

  it("permite partir una palabra que no cabe", () => {
    const { container } = render(<WordReveal text="Un plan de acompañamiento profundamente restaurativo." />);

    for (const span of container.querySelectorAll("span[aria-hidden]")) {
      const clases = span.className.split(/\s+/);
      expect(clases, `«${span.textContent}» no puede llevar whitespace-pre a secas`).not.toContain(
        "whitespace-pre",
      );
      expect(clases, `«${span.textContent}» tiene que permitir ajustar`).toContain("whitespace-pre-wrap");
    }
  });

  it("deja el texto completo para un lector de pantalla", () => {
    const texto = "Descubre algo nuevo.";
    const { container } = render(<WordReveal text={texto} />);

    expect(container.querySelector(".sr-only")?.textContent).toBe(texto);
    for (const span of container.querySelectorAll("span[aria-hidden]")) {
      expect(span.getAttribute("aria-hidden")).toBe("true");
    }
  });
});
