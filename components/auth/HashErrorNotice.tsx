"use client";

import { useSyncExternalStore } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * Muestra los errores de acceso que Supabase devuelve en el FRAGMENTO.
 *
 * Cuando un enlace mágico falla, Supabase no siempre usa la query string:
 * redirige a `…/#error=access_denied&error_code=otp_expired&error_description=…`.
 * El fragmento nunca se envía al servidor, así que la ruta de callback no
 * puede verlo y la página se pinta como si no hubiera pasado nada. Ese es el
 * motivo de que el fallo se viviera como «abro el enlace y vuelvo a la
 * pantalla de acceso, sin ninguna explicación».
 *
 * Solo el navegador puede leerlo, así que se lee aquí.
 */
const subscribeToHash = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};

const MENSAJES: Record<string, string> = {
  otp_expired: "El enlace ya expiró o se usó antes. Pide uno nuevo aquí abajo.",
  access_denied: "El enlace no se pudo validar. Pide uno nuevo aquí abajo.",
};

export function HashErrorNotice() {
  const hash = useSyncExternalStore(
    subscribeToHash,
    () => window.location.hash,
    () => "",
  );

  if (!hash.includes("error")) return null;

  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const code = params.get("error_code") ?? params.get("error") ?? "";
  const detalle = MENSAJES[code] ?? "El enlace no se pudo validar. Pide uno nuevo aquí abajo.";

  return (
    <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-orange/30 bg-orange/10 p-4">
      <AlertTriangle aria-hidden size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-orange-ink" />
      <div className="min-w-0">
        <p className="text-small font-semibold text-carbon">No pudimos validar el acceso</p>
        <p className="mt-1 text-small text-carbon/80">{detalle}</p>
        <p className="mt-2 text-small text-carbon/80">
          Pide siempre el enlace desde esta misma dirección. Si lo pediste en otra —por ejemplo una URL de
          previsualización— la sesión se guarda en aquella y aquí no aparece.
        </p>
        {code && <p className="mt-2 font-mono text-label text-carbon/50">código: {code}</p>}
      </div>
    </div>
  );
}
