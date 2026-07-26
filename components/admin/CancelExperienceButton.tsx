"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelExperienceButton({ experienceId, disabled }: { experienceId: string; disabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!confirm("¿Cancelar esta experiencia? Todas las reservaciones confirmadas se cancelarán y los usuarios recuperarán su pase.")) {
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/experiences/${experienceId}/cancel`, { method: "POST" });
    const body = await res.json().catch(() => ({ code: "UNKNOWN_ERROR" }));

    if (!res.ok) {
      setError(body.code ?? "No se pudo cancelar.");
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleCancel}
        disabled={disabled || loading}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        {loading ? "Cancelando…" : "Cancelar experiencia"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
