"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReservationStatus } from "@/lib/database.types";

export function ReservationRowActions({ reservationId, status }: { reservationId: string; status: ReservationStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(url: string, action: string, body?: object) {
    setLoading(action);
    setError(null);

    const res = await fetch(url, {
      method: "POST",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({ code: "UNKNOWN_ERROR" }));

    setLoading(null);
    if (!res.ok) {
      setError(data.code ?? "Ocurrió un error.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "confirmed" && (
        <>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => call(`/api/admin/reservations/${reservationId}/attendance`, "attended", { status: "attended" })}
            className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Asistió
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => call(`/api/admin/reservations/${reservationId}/attendance`, "no_show", { status: "no_show" })}
            className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            No-show
          </button>
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => {
              if (confirm("¿Cancelar esta reservación?")) call(`/api/admin/reservations/${reservationId}/cancel`, "cancel");
            }}
            className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
          >
            Cancelar
          </button>
        </>
      )}
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => call(`/api/admin/reservations/${reservationId}/resend-email`, "resend")}
        className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
      >
        Reenviar correo
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
