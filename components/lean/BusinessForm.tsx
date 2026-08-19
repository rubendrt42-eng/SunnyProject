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
  /**
   * Qué campo concreto falló, además del aviso general.
   *
   * POR QUÉ HACEN FALTA LOS DOS
   *
   * El aviso general se anuncia solo —`role="alert"`— y eso ya sirve a quien
   * usa un lector de pantalla. Pero para quien mira la pantalla, medido en un
   * teléfono de 390px: al rechazarse el envío el foco salta al campo, el campo
   * queda a la vista... y el aviso que explica qué pasa se queda a 484px, fuera
   * de la ventana. Se veía un campo de aspecto normal y ninguna explicación.
   */
  const [campoConError, setCampoConError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  /**
   * Revisión antes de enviar.
   *
   * El formulario lleva `noValidate` para poder dar mensajes propios en vez de
   * los del navegador, así que sin esto pulsar «Enviar propuesta» en blanco
   * mandaba una petición real que el servidor rechazaba con un 400. La persona
   * veía un aviso genérico después de esperar, y cada intento gastaba cuota
   * del límite de peticiones.
   *
   * Se revisan los cuatro campos obligatorios con las mismas reglas mínimas
   * que usa el servidor. Si algo falta, no sale ninguna petición y el foco
   * salta al primer campo incompleto — que es lo que hace que quien navega con
   * teclado o lector de pantalla sepa dónde está el problema.
   *
   * El mensaje sale en los dos sitios: en el aviso general, que se anuncia
   * solo, y junto al campo que falla, que es lo único que se ve en un teléfono
   * cuando el aviso queda fuera de la ventana.
   */
  /** Al escribir en el campo señalado, se retira la marca y el aviso. */
  function limpiarError(e: React.ChangeEvent<HTMLInputElement>) {
    if (campoConError === e.target.name) {
      setCampoConError(null);
      setError(null);
    }
  }

  function revisarObligatorios(form: HTMLFormElement): { campo: string; mensaje: string } | null {
    const data = new FormData(form);
    const v = (n: string) => String(data.get(n) ?? "").trim();

    if (v("businessName").length < 2) return { campo: "businessName", mensaje: "Escribe el nombre del negocio." };
    if (v("contactName").length < 3) return { campo: "contactName", mensaje: "Escribe tu nombre completo." };
    if (!/^\d{10,15}$/.test(v("whatsapp").replace(/[\s\-().+]/g, "")))
      return { campo: "whatsapp", mensaje: "Escribe tu WhatsApp a diez dígitos, como 81 1234 5678." };
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v("email")))
      return { campo: "email", mensaje: "Revisa el correo, parece incompleto." };

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;

    const falta = revisarObligatorios(form);
    if (falta) {
      setError(falta.mensaje);
      setCampoConError(falta.campo);
      const campo = form.elements.namedItem(falta.campo);
      if (campo instanceof HTMLElement) campo.focus();
      return;
    }
    setCampoConError(null);

    const data = new FormData(form);
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
      {/* El error solo lo llevan los cuatro obligatorios, que son los únicos que
          `revisarObligatorios` puede rechazar. Se borra en cuanto la persona
          escribe: dejarlo puesto mientras corrige es regañar dos veces. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={`${formId}-business`}
          name="businessName"
          label="Nombre del negocio"
          required
          error={campoConError === "businessName" ? (error ?? undefined) : undefined}
          onChange={limpiarError}
        />
        <TextField
          id={`${formId}-contact`}
          name="contactName"
          label="Tu nombre"
          autoComplete="name"
          required
          error={campoConError === "contactName" ? (error ?? undefined) : undefined}
          onChange={limpiarError}
        />
        <TextField
          id={`${formId}-whatsapp`}
          name="whatsapp"
          label="WhatsApp"
          type="tel"
          autoComplete="tel"
          required
          error={campoConError === "whatsapp" ? (error ?? undefined) : undefined}
          onChange={limpiarError}
        />
        <TextField
          id={`${formId}-email`}
          name="email"
          label="Correo"
          type="email"
          autoComplete="email"
          required
          error={campoConError === "email" ? (error ?? undefined) : undefined}
          onChange={limpiarError}
        />
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
  error,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const errorId = `${id}-error`;
  const hayError = Boolean(error);

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
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
        onChange={onChange}
        aria-invalid={hayError || undefined}
        aria-describedby={hayError ? errorId : undefined}
        className={
          hayError
            ? "h-11 rounded-md border border-orange-ink bg-warm-white px-3 text-body transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange/40"
            : "h-11 rounded-md border border-carbon/20 bg-warm-white px-3 text-body transition-colors focus:border-carbon focus:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
        }
      />
      {hayError && (
        <p id={errorId} className="text-xs text-orange-ink">
          {error}
        </p>
      )}
    </div>
  );
}
