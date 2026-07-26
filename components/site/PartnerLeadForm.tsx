"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function PartnerLeadForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      business_name: form.get("business_name"),
      contact_name: form.get("contact_name"),
      email: form.get("email"),
      phone: form.get("phone"),
      category: form.get("category"),
      instagram_url: form.get("instagram_url"),
      city: form.get("city") || "Monterrey",
      message: form.get("message"),
      offered_spots: form.get("offered_spots") || undefined,
    };

    const res = await fetch("/api/partner-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setStatus("error");
      setError("No pudimos enviar tu solicitud. Verifica los datos e intenta de nuevo.");
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div role="status" className={compact ? "rounded-2xl bg-warm-white/10 p-6 text-warm-white" : "rounded-2xl border border-carbon/10 bg-warm-white p-6"}>
        <p className="font-medium">¡Gracias por tu interés!</p>
        <p className="mt-1 text-sm opacity-80">Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo pronto.</p>
      </div>
    );
  }

  const labelClass = compact ? "text-sm font-medium text-warm-white" : "text-sm font-medium";
  const inputClass = compact
    ? "rounded-lg border border-warm-white/30 bg-transparent px-4 py-3 text-warm-white placeholder:text-warm-white/50 focus:border-warm-white"
    : "rounded-lg border border-carbon/20 bg-warm-white px-4 py-3 focus:border-carbon";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="business_name" className={labelClass}>
            Nombre del negocio
          </label>
          <input id="business_name" name="business_name" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact_name" className={labelClass}>
            Nombre de contacto
          </label>
          <input id="contact_name" name="contact_name" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className={labelClass}>
            Correo
          </label>
          <input id="email" name="email" type="email" required className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={labelClass}>
            WhatsApp
          </label>
          <input id="phone" name="phone" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className={labelClass}>
            Categoría
          </label>
          <select id="category" name="category" className={inputClass}>
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="instagram_url" className={labelClass}>
            Instagram
          </label>
          <input id="instagram_url" name="instagram_url" placeholder="@tunegocio" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className={labelClass}>
            Ciudad
          </label>
          <input id="city" name="city" defaultValue="Monterrey" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="offered_spots" className={labelClass}>
            Lugares aproximados que podrías ofrecer
          </label>
          <input id="offered_spots" name="offered_spots" type="number" min={1} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className={labelClass}>
          Mensaje
        </label>
        <textarea id="message" name="message" rows={3} className={inputClass} />
      </div>

      {error && (
        <p role="alert" className={compact ? "text-sm text-sunny" : "text-sm text-orange"}>
          {error}
        </p>
      )}

      <Button type="submit" variant={compact ? "secondary" : "primary"} disabled={status === "loading"}>
        {status === "loading" ? "Enviando…" : "Quiero participar"}
      </Button>
    </form>
  );
}
