"use client";

import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

/**
 * Punto de «estoy yendo» para un enlace del panel.
 *
 * Todas las rutas de `/admin` son `dynamic = "force-dynamic"`: cada una hace
 * ida y vuelta al servidor y consulta Supabase, y ninguna tiene `loading.tsx`.
 * Es decir, el caso exacto para el que existe `useLinkStatus` — la propia
 * documentación de Next lo describe así: «the destination route is dynamic and
 * doesn't include a loading.js file».
 *
 * Antes de esto, pulsar «Reservaciones» o «Siguiente» no producía ningún
 * cambio en pantalla hasta que la página nueva estaba entera. Con una consulta
 * lenta, la única lectura posible era «no me hizo caso».
 *
 * Dos cosas que este componente hace a propósito:
 *
 * - **Está montado siempre**, ocupando su hueco de 0.5rem, y solo cambia de
 *   opacidad. Un indicador que aparece y desaparece del flujo mueve el texto
 *   del enlace, y con él la fila entera. Es la advertencia literal de la
 *   documentación de Next.
 * - **Entra con retraso** (`.pending-indicator`, ver globals.css). Una
 *   navegación de 60 ms no llega a enseñarlo, así que no parpadea cuando todo
 *   va bien.
 *
 * Tiene que ser descendiente de un `<Link>` — fuera de uno, el hook devuelve
 * siempre `pending: false`.
 */
export function NavPending({ label }: { label: string }) {
  const { pending } = useLinkStatus();

  return (
    <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center">
      {pending && (
        <>
          <Loader2
            aria-hidden
            size={13}
            strokeWidth={2}
            className="pending-indicator animate-spin motion-reduce:animate-none"
          />
          <span className="sr-only">Abriendo {label}</span>
        </>
      )}
    </span>
  );
}
