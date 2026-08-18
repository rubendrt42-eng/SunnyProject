import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SpotRequestForm } from "@/components/lean/SpotRequestForm";
import { BusinessForm } from "@/components/lean/BusinessForm";

/**
 * Los dos formularios públicos no pueden mandar una petición vacía.
 *
 * QUÉ PASABA
 *
 * Los dos llevan `noValidate` —para dar mensajes propios en vez de los del
 * navegador— y ninguno revisaba los campos al enviar. La validación por campo
 * del formulario de solicitudes se dispara **al salir** de un campo, y salir
 * requiere haber entrado: quien pulsaba el botón sin tocar nada se la saltaba
 * entera.
 *
 * El resultado medido: pulsar «Enviar solicitud» en blanco mandaba una
 * petición real, el servidor respondía 400, y el único aviso aparecía en un
 * recuadro general — que en un teléfono puede quedar fuera de pantalla. El
 * foco acababa en `<body>`, así que quien navega con teclado o lector de
 * pantalla no tenía forma de saber qué faltaba. Y cada intento gastaba cuota
 * del límite de peticiones por IP.
 *
 * QUÉ PROTEGE ESTA PRUEBA
 *
 * Que no salga ninguna petición, no el texto de los mensajes. El texto es
 * redacción y puede cambiar; que un formulario vacío no viaje al servidor es
 * la propiedad.
 */
afterEach(cleanup);

describe("los formularios públicos revisan antes de enviar", () => {
  it("el de solicitud de lugar no manda nada con los campos vacíos", () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);

    render(<SpotRequestForm experienceId="x" experienceName="TEST" />);
    fireEvent.click(screen.getByRole("button", { name: /enviar solicitud/i }));

    expect(fetchFalso).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("el de negocios no manda nada con los campos vacíos", () => {
    const fetchFalso = vi.fn();
    vi.stubGlobal("fetch", fetchFalso);

    render(<BusinessForm />);
    fireEvent.click(screen.getByRole("button", { name: /enviar propuesta/i }));

    expect(fetchFalso).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("marca los campos incompletos para que se vea cuál falta", () => {
    vi.stubGlobal("fetch", vi.fn());

    const { container } = render(<SpotRequestForm experienceId="x" experienceName="TEST" />);
    fireEvent.click(screen.getByRole("button", { name: /enviar solicitud/i }));

    expect(container.querySelectorAll('[aria-invalid="true"]').length).toBeGreaterThan(0);
    vi.unstubAllGlobals();
  });
});
