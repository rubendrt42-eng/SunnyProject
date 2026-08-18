"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

/**
 * Compartir una experiencia.
 *
 * POR QUÉ ES DE LO MÁS IMPORTANTE DE ESTA PÁGINA
 *
 * En Monterrey, para este público, WhatsApp es el canal de crecimiento — más
 * que Instagram. Alguien ve una clase que le va a una amiga y se la manda. Sin
 * un botón, esa persona tiene que copiar la barra de direcciones a mano, que en
 * un teléfono es suficiente fricción para que no lo haga.
 *
 * El mensaje que se comparte lleva el nombre de la experiencia y la fecha, no
 * solo el enlace pelón: quien lo recibe tiene que entender qué le mandaron sin
 * abrir nada.
 *
 * DOS BOTONES, NO UNO
 *
 * `navigator.share` abre la hoja nativa del sistema y es lo mejor en móvil,
 * pero en escritorio casi ningún navegador la tiene. Así que hay un botón de
 * WhatsApp que funciona en todas partes y uno de copiar como respaldo. Nada de
 * detectar el dispositivo: los dos están siempre y cada quien usa el que
 * prefiere.
 */
export function ShareExperience({
  title,
  fecha,
  url,
}: {
  title: string;
  fecha: string;
  url: string;
}) {
  const [copiado, setCopiado] = useState(false);

  const mensaje = `${title} — ${fecha}. Mira esta experiencia de The Sunny Project:`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${mensaje} ${url}`)}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      trackEvent("share_experience", { experience: title, via: "copiar" });
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin portapapeles disponible no se hace nada: el botón de WhatsApp
      // sigue ahí y es el camino que de verdad usa la gente.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("share_experience", { experience: title, via: "whatsapp" })}
        className="press inline-flex min-h-11 items-center gap-2 rounded-md border border-carbon/20 px-4 text-small font-medium text-carbon transition-[colors,transform] hover:border-carbon/50 hover:bg-carbon/5"
      >
        <Share2 aria-hidden size={16} strokeWidth={1.75} />
        Compartir
      </a>

      <button
        type="button"
        onClick={copiar}
        className="press inline-flex min-h-11 items-center gap-2 rounded-md border border-carbon/20 px-4 text-small font-medium text-carbon transition-[colors,transform] hover:border-carbon/50 hover:bg-carbon/5"
      >
        {copiado ? (
          <Check aria-hidden size={16} strokeWidth={2} className="text-orange-ink" />
        ) : (
          <Link2 aria-hidden size={16} strokeWidth={1.75} />
        )}
        {copiado ? "Copiado" : "Copiar enlace"}
      </button>

      {/* El aviso de copiado también se anuncia, no solo se ve. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copiado ? "Enlace copiado" : ""}
      </span>
    </div>
  );
}
