"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Registra que alguien abrió la página de una experiencia.
 *
 * Es el segundo paso del embudo —entra al sitio, abre una experiencia, pide
 * lugar— y sin él no se puede saber si la gente no solicita porque no le
 * interesa lo que hay, o porque nunca llega a abrirlo.
 *
 * `useRef` para no contar dos veces: en desarrollo, React monta los efectos dos
 * veces a propósito para detectar errores, y sin la guarda cada visita se
 * registraría duplicada.
 *
 * No dibuja nada. Existe solo para poder medir desde una página que por lo
 * demás es de servidor.
 */
export function ExperienceViewTracker({ title }: { title: string }) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackEvent("experience_view", { experience: title });
  }, [title]);

  return null;
}
