"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/profile";
import { CATEGORIES } from "@/lib/constants";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Business } from "@/lib/database.types";

const initialState: ActionResult = { ok: false };

export function BusinessForm({
  action,
  business,
  submitLabel,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  business?: Business;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="name" error={err("name")}>
          <input id="name" name="name" required defaultValue={business?.name} className="input" />
        </Field>
        <Field label="Slug" htmlFor="slug" error={err("slug")}>
          <input id="slug" name="slug" required defaultValue={business?.slug} className="input" />
        </Field>
        <Field label="Categoría" htmlFor="category">
          <select id="category" name="category" defaultValue={business?.category ?? ""} className="input">
            <option value="">Sin categoría</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Descripción" htmlFor="description">
        <textarea id="description" name="description" rows={3} defaultValue={business?.description ?? ""} className="input" />
      </Field>

      <ImageUploadField bucket="business-logos" name="logo_url" label="Logo" defaultValue={business?.logo_url} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Instagram" htmlFor="instagram_url">
          <input id="instagram_url" name="instagram_url" defaultValue={business?.instagram_url ?? ""} className="input" />
        </Field>
        <Field label="Google Maps URL" htmlFor="maps_url">
          <input id="maps_url" name="maps_url" defaultValue={business?.maps_url ?? ""} className="input" />
        </Field>
        <Field label="Nombre de contacto" htmlFor="contact_name">
          <input id="contact_name" name="contact_name" defaultValue={business?.contact_name ?? ""} className="input" />
        </Field>
        <Field label="Correo de contacto" htmlFor="contact_email" error={err("contact_email")}>
          <input id="contact_email" name="contact_email" type="email" defaultValue={business?.contact_email ?? ""} className="input" />
        </Field>
        <Field label="Teléfono de contacto" htmlFor="contact_phone">
          <input id="contact_phone" name="contact_phone" defaultValue={business?.contact_phone ?? ""} className="input" />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={business?.active ?? true} />
        Negocio activo (visible públicamente)
      </label>

      {state.error && !state.fieldErrors && <p className="text-sm text-orange-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="w-fit rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
        {pending ? "Guardando…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-orange-600">{error}</p>}
    </div>
  );
}
