"use client";

import { useId, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics";

/**
 * Formulario para negocios que quieren crear una experiencia con Sunny.
 *
 * Mismo comportamiento que el de solicitudes: bloqueo al primer clic, éxito
 * solo con confirmación del servidor, y error que dice qué hacer. Ver
 * `SpotRequestForm` para el razonamiento completo.
 *
 * **Nada de esto publica nada.** El negocio queda en una lista para que Emmy lo
 * revise y decida. El texto de éxito lo dice explícitamente para que nadie
 * espere ver su clase en el sitio al día siguiente.
 */
export function BusinessForm() {
  const formId = useId();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const data = new FormData(event.currentTarget);
    setSending(true);
    setError(null);
    trackEvent("business_form_submit");

    try {
      const res = await fetch("/api/negocios-lean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: data.get("businessName"),
          contactName: data.get("contactName"),
          whatsapp: data.get("whatsapp"),
          email: data.get("email"),
          instagram: data.get("instagram"),
          location: data.get("location"),
          experienceType: data.get("experienceType"),
          message: data.get("message"),
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
      setError("No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  if (done) {
    return (
      <div role="status" className="rounded-lg border border-carbon/10 bg-warm-white p-6 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-sunny">
          <Check aria-hidden size={20} strokeWidth={2.5} className="text-carbon" />
        </span>
        <h3 className="mt-4 text-subtitle">Recibimos tus datos</h3>
        <p className="mx-auto mt-2 max-w-sm text-small text-gray">
          Vamos a revisar tu propuesta y te escribimos para platicar cómo podría funcionar una experiencia juntos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField id={`${formId}-business`} name="businessName" label="Nombre del negocio" required />
        <TextField id={`${formId}-contact`} name="contactName" label="Tu nombre" autoComplete="name" required />
        <TextField id={`${formId}-whatsapp`} name="whatsapp" label="WhatsApp" type="tel" autoComplete="tel" required />
        <TextField id={`${formId}-email`} name="email" label="Correo" type="email" autoComplete="email" required />
        <TextField id={`${formId}-instagram`} name="instagram" label="Instagram" placeholder="@tunegocio" />
        <TextField id={`${formId}-location`} name="location" label="Zona o dirección" />
      </div>

      <TextField
        id={`${formId}-type`}
        name="experienceType"
        label="¿Qué tipo de experiencia ofreces?"
        placeholder="Yoga, pilates, café, running…"
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-message`} className="text-small font-medium text-carbon">
          Cuéntanos un poco más <span className="text-gray">(opcional)</span>
        </label>
        <textarea
          id={`${formId}-message`}
          name="message"
          rows={4}
          maxLength={700}
          className="rounded-md border border-carbon/20 bg-warm-white px-3 py-2 text-body transition-colors focus:border-carbon focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
        />
      </div>

      <div className="hidden" aria-hidden>
        <label htmlFor={`${formId}-website`}>No llenar</label>
        <input id={`${formId}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-small text-red-800">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" loading={sending} loadingLabel="Enviando">
        Enviar propuesta
      </Button>
    </form>
  );
}

function TextField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  placeholder,
  required,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
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
        placeholder={placeholder}
        required={required}
        className="h-11 rounded-md border border-carbon/20 bg-warm-white px-3 text-body transition-colors focus:border-carbon focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
      />
    </div>
  );
}
