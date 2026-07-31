"use client";

import { clsx } from "clsx";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * El botón de acción del panel. Uno solo, para que la respuesta al pulsar sea
 * la misma en las cinco pantallas.
 *
 * Existe porque el panel tenía tres implementaciones distintas de «botón que
 * hace algo» y ninguna daba una señal decente:
 *
 * - `ReservationRowActions` guardaba qué acción estaba en curso y **no lo
 *   dibujaba**. Sus botones ni siquiera llevaban `disabled:opacity-50`, así
 *   que pulsar «Asistió» dejaba la pantalla exactamente igual durante toda la
 *   petición de red. En la puerta de un estudio, con mala señal, ese es el
 *   momento exacto en que se vuelve a pulsar.
 * - `ExperienceRowActions` y `BusinessRowActions` cambiaban la etiqueta por
 *   «…», lo que encoge el botón de golpe y **desplaza los que tiene al lado**.
 *   La propia documentación de Next avisa de esto para su indicador de
 *   navegación: reserva el espacio siempre y anima solo la opacidad.
 *
 * Las dos reglas que aplica este componente:
 *
 * 1. **Nada se mueve de sitio.** La etiqueta sigue ocupando su ancho cuando
 *    está ocupada; solo baja a `opacity-0`. El indicador va superpuesto y
 *    centrado, no en el flujo.
 * 2. **Nada parpadea.** El indicador arranca invisible y aparece con
 *    `animation-delay`, así que una acción que tarda 80 ms no llega a
 *    enseñarlo. Ver `--motion-pending-delay` en globals.css.
 *
 * `aria-busy` va siempre que está ocupado: el giro es para quien lo ve, no
 * puede ser la única señal.
 */
export function AdminActionButton({
  label,
  busyLabel,
  icon: Icon,
  busy = false,
  disabled = false,
  active = false,
  tone = "neutral",
  onClick,
  className,
}: {
  label: string;
  /** Lo que anuncia un lector de pantalla mientras corre. Por defecto, «<label>, en curso». */
  busyLabel?: string;
  icon?: LucideIcon;
  busy?: boolean;
  disabled?: boolean;
  /** Estado encendido/apagado — pinta el botón en sólido y emite `aria-pressed`. */
  active?: boolean;
  tone?: "neutral" | "positive" | "danger";
  onClick: () => void;
  className?: string;
}) {
  const toneClasses =
    tone === "danger"
      ? "border-red-300 text-red-700 hover:bg-red-50"
      : tone === "positive"
        ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        : "border-neutral-300 text-neutral-700 hover:bg-neutral-50";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      aria-pressed={active || undefined}
      className={clsx(
        "relative inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2 text-[0.75rem] font-medium",
        "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active ? "border-neutral-900 bg-neutral-900 text-white" : toneClasses,
        className,
      )}
    >
      {/* El contenido real. Se atenúa pero NO se desmonta, así el botón
          conserva su ancho y la fila no salta. `.pending-label` lo desvanece
          con el mismo retraso con el que entra el indicador, para que las dos
          cosas ocurran a la vez y nunca se vea el botón vacío. */}
      <span className={clsx("inline-flex items-center gap-1.5", busy && "pending-label")}>
        {Icon && <Icon aria-hidden size={13} strokeWidth={1.75} />}
        {label}
      </span>

      {busy && (
        <>
          <span className="pending-indicator absolute inset-0 flex items-center justify-center">
            <Loader2 aria-hidden size={13} strokeWidth={2} className="animate-spin motion-reduce:animate-none" />
          </span>
          {/* Para lectores de pantalla. `aria-busy` no siempre se anuncia
              solo; esto lo dice con palabras. */}
          <span className="sr-only">{busyLabel ?? `${label}, en curso`}</span>
        </>
      )}
    </button>
  );
}
