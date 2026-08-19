import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { BusinessForm } from "@/components/lean/BusinessForm";

/**
 * El campo que falla tiene que verse, no solo anunciarse.
 *
 * QUÉ PASABA
 *
 * El formulario de negocios mandaba el motivo del rechazo a un aviso general y
 * movía el foco al campo. Para un lector de pantalla bastaba: el aviso lleva
 * `role="alert"` y se anuncia solo. Para quien mira la pantalla, no.
 *
 * Medido en un teléfono de 390px, rellenando todo menos el correo:
 *
 *     foco ..................... en el campo de correo, y el campo a la vista
 *     aviso «Revisa el correo» . FUERA de la ventana, a 484px del campo
 *     el campo ................. sin aria-invalid, borde rgb(23,23,20) — normal
 *
 * O sea: la página saltaba a un campo de aspecto corriente y la explicación se
 * quedaba media pantalla más abajo. En escritorio sí se veían las dos cosas, y
 * por eso no había saltado antes.
 *
 * El formulario hermano —el de solicitar lugar— ya marcaba cada campo. Esta era
 * la única de las dos entradas públicas que no lo hacía; su propio comentario lo
 * tenía anotado como «la siguiente vuelta».
 *
 * QUÉ PROTEGE
 *
 * Que el campo rechazado quede marcado y explicado en su sitio, y que la marca
 * se retire al corregir. No comprueba la redacción de los mensajes.
 */
afterEach(cleanup);

function campos(container: HTMLElement) {
  return {
    negocio: container.querySelector('input[name="businessName"]') as HTMLInputElement,
    contacto: container.querySelector('input[name="contactName"]') as HTMLInputElement,
    enviar: container.querySelector('button[type="submit"]') as HTMLButtonElement,
  };
}

describe("el campo rechazado se marca junto al campo", () => {
  it("al rechazar, el campo queda marcado y con su mensaje al lado", () => {
    const { container } = render(<BusinessForm />);
    const { negocio, enviar } = campos(container);

    fireEvent.click(enviar);

    expect(negocio.getAttribute("aria-invalid"), "el campo no queda marcado como inválido").toBe("true");

    const id = negocio.getAttribute("aria-describedby");
    expect(id, "el campo no apunta a ningún mensaje").toBeTruthy();

    // `getElementById` y no `querySelector`: el id lo genera `useId` y lleva
    // caracteres que habría que escapar, y `CSS.escape` no existe en jsdom.
    const mensaje = container.ownerDocument.getElementById(id!);
    expect(mensaje?.textContent?.trim(), "el mensaje del campo está vacío").toBeTruthy();
  });

  it("al escribir en el campo, la marca se retira", () => {
    const { container } = render(<BusinessForm />);
    const { negocio, enviar } = campos(container);

    fireEvent.click(enviar);
    expect(negocio.getAttribute("aria-invalid")).toBe("true");

    fireEvent.change(negocio, { target: { value: "Estudio Norte" } });

    expect(negocio.getAttribute("aria-invalid"), "sigue regañando mientras la persona corrige").toBeNull();
    expect(container.querySelector('[role="alert"]'), "el aviso general tampoco se retira").toBeNull();
  });

  it("solo se marca el campo que falla, no todos", () => {
    const { container } = render(<BusinessForm />);
    const { negocio, contacto, enviar } = campos(container);

    fireEvent.click(enviar);

    expect(negocio.getAttribute("aria-invalid")).toBe("true");
    expect(contacto.getAttribute("aria-invalid"), "se marcan campos que la persona ni ha tocado").toBeNull();
  });
});
