"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

/**
 * El formulario para solicitar un lugar.
 *
 * Es la única operación del MVP que no se puede perder, así que su
 * comportamiento está pensado alrededor de eso:
 *
 * - **`sending` bloquea el botón** desde el primer clic. Sin esto, un doble
 *   clic en una conexión lenta manda dos peticiones y Emmy ve la misma
 *   solicitud dos veces en su hoja.
 * - **El éxito solo se muestra si el servidor confirmó** que la solicitud quedó
 *   registrada en la hoja de cálculo. Nunca de forma optimista: decirle a
 *   alguien «recibimos tu solicitud» cuando no se guardó lo llevaría a
 *   presentarse a una clase donde nadie lo espera.
 * - **El error dice qué hacer**, no solo qué pasó.
 *
 * Esta pantalla de éxito es el ÚNICO acuse que recibe la persona: en esta
 * etapa no se manda ningún correo. Por eso dice con todas sus letras que
 * alguien la va a contactar, en vez de dar el lugar por confirmado.
 *
 * SOBRE EL LENGUAJE
 *
 * En ningún punto se dice «reservar» ni «tu lugar está confirmado». El sitio
 * recibe una solicitud; la confirmación la da Emmy después. La pantalla de
 * éxito lo dice con esas palabras a propósito.
 */
export function SpotRequestForm({
  experienceId,
  experienceName,
}: {
  experienceId: string;
  experienceName: string;
}) {
  const formId = useId();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    const data = new FormData(form);

    setSending(true);
    setError(null);
    trackEvent("request_spot_submit", { experience: experienceName });

    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId,
          experienceName,
          name: data.get("name"),
          whatsapp: data.get("whatsapp"),
          email: data.get("email"),
          numberOfPeople: data.get("numberOfPeople"),
          comments: data.get("comments"),
          website: data.get("website"),
        }),
      });

      const body = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(body.error ?? "No pudimos enviar tu solicitud. Inténtalo nuevamente en unos minutos.");
        setSending(false);
        return;
      }

      setDone(true);
    } catch {
      // Fallo de red: sin esto el botón quedaría desactivado para siempre y la
      // persona no podría reintentar.
      setError("No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="rounded-lg border border-carbon/10 bg-warm-white p-6 text-center"
      >
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-sunny">
          <Check aria-hidden size={20} strokeWidth={2.5} className="text-carbon" />
        </span>
        <h3 className="mt-4 text-subtitle">¡Recibimos tu solicitud!</h3>
        <p className="mx-auto mt-2 max-w-sm text-small text-gray">
          The Sunny Project revisará la disponibilidad y se pondrá en contacto contigo para confirmar tu lugar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field id={`${formId}-name`} name="name" label="Nombre completo" autoComplete="name" required />
      <Field
        id={`${formId}-whatsapp`}
        name="whatsapp"
        label="WhatsApp"
        type="tel"
        autoComplete="tel"
        hint="Es por donde te vamos a confirmar."
        required
      />
      <Field id={`${formId}-email`} name="email" label="Correo" type="email" autoComplete="email" required />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-people`} className="text-small font-medium text-carbon">
          ¿Cuántas personas van? <span className="text-orange-ink">*</span>
        </label>
        <select
          id={`${formId}-people`}
          name="numberOfPeople"
          defaultValue="1"
          required
          className="h-11 rounded-md border border-carbon/20 bg-warm-white px-3 text-body transition-colors focus:border-carbon focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n === 1 ? "Solo yo" : `${n} personas`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-comments`} className="text-small font-medium text-carbon">
          ¿Algo que debamos saber? <span className="text-gray">(opcional)</span>
        </label>
        <textarea
          id={`${formId}-comments`}
          name="comments"
          rows={3}
          maxLength={500}
          className="rounded-md border border-carbon/20 bg-warm-white px-3 py-2 text-body transition-colors focus:border-carbon focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
        />
      </div>

      {/* Campo trampa. Oculto para las personas, visible para los robots que
          rellenan todo. `tabIndex={-1}` y `aria-hidden` para que ni el teclado
          ni un lector de pantalla lo encuentren. */}
      <div className="hidden" aria-hidden>
        <label htmlFor={`${formId}-website`}>No llenar</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-small text-red-800">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={sending} loadingLabel="Enviando tu solicitud">
        Enviar solicitud
      </Button>

      <p className="text-xs text-gray">
        Al enviar, aceptas que te contactemos por WhatsApp o correo para confirmar tu lugar. No compartimos tus datos.
      </p>
    </form>
  );
}

/** Campo de texto del formulario. Etiqueta real asociada al input — nunca un placeholder haciendo de etiqueta. */
function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  hint,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  required?: boolean;
}) {
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-small font-medium text-carbon">
        {label} {required && <span className="text-orange-ink">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-describedby={hintId}
        className="h-11 rounded-md border border-carbon/20 bg-warm-white px-3 text-body transition-colors focus:border-carbon focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
      />
      {hint && (
        <p id={hintId} className="text-xs text-gray">
          {hint}
        </p>
      )}
    </div>
  );
}
