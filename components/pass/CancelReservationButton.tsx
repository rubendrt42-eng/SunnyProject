"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { reservationErrorMessage } from "@/lib/constants";

export function CancelReservationButton({ reservationId, canCancel }: { reservationId: string; canCancel: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar tu pase? Esta acción no se puede deshacer.")) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/reservations/${reservationId}/cancel`, { method: "POST" });
    const body = await res.json().catch(() => ({ code: "UNKNOWN_ERROR" }));

    if (!res.ok) {
      setError(reservationErrorMessage(body.code));
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (!canCancel) {
    return <p className="text-sm text-gray">El periodo de cancelación terminó.</p>;
  }

  return (
    <div>
      <Button variant="danger" onClick={handleCancel} disabled={loading}>
        {loading ? "Cancelando…" : "Cancelar reservación"}
      </Button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-orange">
          {error}
        </p>
      )}
    </div>
  );
}
