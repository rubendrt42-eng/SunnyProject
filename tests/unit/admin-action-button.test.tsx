import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { Check } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";

/**
 * Lo que estas pruebas protegen es la propiedad, no el estilo.
 *
 * El defecto original del panel era que `busy ? "…" : label` desmontaba la
 * etiqueta, el botón se encogía de golpe y la fila entera saltaba. Un test de
 * ancho en píxeles no serviría —jsdom no calcula diseño—, pero sí se puede
 * comprobar la causa: que la etiqueta siga en el documento mientras la acción
 * corre. Si sigue ahí, el botón conserva su ancho.
 */
// El proyecto no tiene `setupFiles` en vitest.config.ts, así que la limpieza
// automática de Testing Library no está activa: sin esto, cada `render` se
// acumula en el mismo documento y `getByRole("button")` encuentra varios.
afterEach(cleanup);

describe("AdminActionButton", () => {
  it("conserva la etiqueta mientras la acción corre, para que el botón no se encoja", () => {
    const { rerender } = render(<AdminActionButton label="Asistió" icon={Check} onClick={() => {}} />);
    expect(screen.getByText("Asistió")).toBeDefined();

    rerender(<AdminActionButton label="Asistió" icon={Check} busy onClick={() => {}} />);
    // Sigue montada — atenuada, pero ocupando su sitio.
    expect(screen.getByText("Asistió")).toBeDefined();
  });

  it("anuncia que está ocupado con palabras, no solo con un icono que gira", () => {
    render(<AdminActionButton label="Reenviar correo" busyLabel="Reenviando el correo" busy onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(screen.getByText("Reenviando el correo")).toBeDefined();
  });

  it("no se puede pulsar dos veces mientras corre", () => {
    const onClick = vi.fn();
    render(<AdminActionButton label="Cancelar" busy onClick={onClick} />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    button.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("un botón de encender/apagar dice en qué estado está", () => {
    const { rerender } = render(<AdminActionButton label="Destacar" active onClick={() => {}} />);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");

    // Sin `active` no se emite el atributo: un botón que solo dispara una
    // acción no tiene estado que anunciar, y `aria-pressed="false"` lo
    // convertiría en un interruptor a ojos de un lector de pantalla.
    rerender(<AdminActionButton label="Duplicar" onClick={() => {}} />);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBeNull();
  });

  it("mientras está ocupado no depende de la opacidad para nada funcional", () => {
    // `.pending-label` y `.pending-indicator` solo animan opacidad, con el
    // mismo retraso, para que una acción rápida no enseñe un botón vacío.
    render(<AdminActionButton label="Publicar" busy onClick={() => {}} />);
    const label = screen.getByText("Publicar");
    expect(label.className).toContain("pending-label");
  });
});
