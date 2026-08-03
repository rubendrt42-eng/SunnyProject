"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/actions/profile";
import { CATEGORIES } from "@/lib/constants";
import { SOCIAL_MODES, SOCIAL_MODE_KEYS } from "@/lib/social-modes";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import type { Business, Experience } from "@/lib/database.types";

const initialState: ActionResult = { ok: false };

function toLocalInput(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ExperienceForm({
  action,
  businesses,
  experience,
  submitLabel,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  businesses: Business[];
  experience?: Experience;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Título" htmlFor="title" error={err("title")}>
          <input id="title" name="title" required defaultValue={experience?.title} className="input" />
        </Field>
        <Field label="Slug" htmlFor="slug" error={err("slug")}>
          <input id="slug" name="slug" required defaultValue={experience?.slug} className="input" />
        </Field>
        <Field label="Negocio" htmlFor="business_id" error={err("business_id")}>
          <select id="business_id" name="business_id" required defaultValue={experience?.business_id} className="input">
            <option value="">Selecciona un negocio</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Categoría" htmlFor="category" error={err("category")}>
          <select id="category" name="category" required defaultValue={experience?.category} className="input">
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Descripción corta" htmlFor="short_description">
        <input id="short_description" name="short_description" defaultValue={experience?.short_description ?? ""} className="input" />
      </Field>

      <Field label="Descripción" htmlFor="description">
        <textarea id="description" name="description" rows={4} defaultValue={experience?.description ?? ""} className="input" />
      </Field>

      <ImageUploadField bucket="experience-images" name="image_url" label="Imagen" defaultValue={experience?.image_url} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre del lugar" htmlFor="location_name">
          <input id="location_name" name="location_name" defaultValue={experience?.location_name ?? ""} className="input" />
        </Field>
        <Field label="Dirección" htmlFor="address">
          <input id="address" name="address" defaultValue={experience?.address ?? ""} className="input" />
        </Field>
        <Field label="Google Maps URL" htmlFor="maps_url">
          <input id="maps_url" name="maps_url" defaultValue={experience?.maps_url ?? ""} className="input" />
        </Field>
        <Field label="Cupo" htmlFor="capacity" error={err("capacity")}>
          <input id="capacity" name="capacity" type="number" min={1} required defaultValue={experience?.capacity ?? 10} className="input" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Inicio" htmlFor="starts_at" error={err("starts_at")}>
          <input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={toLocalInput(experience?.starts_at)} className="input" />
        </Field>
        <Field label="Fin" htmlFor="ends_at" error={err("ends_at")}>
          <input id="ends_at" name="ends_at" type="datetime-local" required defaultValue={toLocalInput(experience?.ends_at)} className="input" />
        </Field>
        <Field label="Abren reservaciones" htmlFor="claim_opens_at" error={err("claim_opens_at")}>
          <input
            id="claim_opens_at"
            name="claim_opens_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(experience?.claim_opens_at) || toLocalInput(new Date().toISOString())}
            className="input"
          />
        </Field>
        <Field label="Cierran reservaciones" htmlFor="claim_closes_at" error={err("claim_closes_at")}>
          <input
            id="claim_closes_at"
            name="claim_closes_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(experience?.claim_closes_at)}
            className="input"
          />
        </Field>
      </div>

      <Field label="Qué incluye (una por línea)" htmlFor="what_is_included">
        <textarea id="what_is_included" name="what_is_included" rows={3} defaultValue={experience?.what_is_included.join("\n") ?? ""} className="input" />
      </Field>
      <Field label="Requisitos (una por línea)" htmlFor="requirements">
        <textarea id="requirements" name="requirements" rows={3} defaultValue={experience?.requirements.join("\n") ?? ""} className="input" />
      </Field>
      <Field label="Restricciones (una por línea)" htmlFor="restrictions">
        <textarea id="restrictions" name="restrictions" rows={3} defaultValue={experience?.restrictions.join("\n") ?? ""} className="input" />
      </Field>
      <Field label="Instrucciones para el pase" htmlFor="instructions">
        <textarea id="instructions" name="instructions" rows={3} defaultValue={experience?.instructions ?? ""} className="input" />
      </Field>

      <Field label="Beneficio posterior (opcional)" htmlFor="post_benefit">
        <input
          id="post_benefit"
          name="post_benefit"
          defaultValue={experience?.post_benefit ?? ""}
          placeholder="Ej. 20% en su primera mensualidad"
          className="input"
        />
      </Field>

      {/* Group allowance. Defaults to 1 for every new experience — group
          size is opt-in, never the default (decision 8). */}
      <Field label="Lugares por reservación" htmlFor="max_party_size">
        <select id="max_party_size" name="max_party_size" defaultValue={String(experience?.max_party_size ?? 1)} className="input">
          <option value="1">1 — individual</option>
          <option value="2">2 — permite un acompañante</option>
          <option value="3">3 — permite dos acompañantes</option>
        </select>
        <p className="text-xs text-neutral-500">
          Los lugares de los acompañantes se descuentan del cupo total. El máximo del MVP es 3.
        </p>
      </Field>

      {/* Modality is explicit, never inferred: an experience shows only the
          badges Emmy actually ticks here. */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-neutral-700">Modalidad social</legend>
        <p className="text-xs text-neutral-500">
          Marca solo lo que sea cierto para esta experiencia. Aparecen como etiquetas en el sitio.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SOCIAL_MODE_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="social_modes"
                value={key}
                defaultChecked={(experience?.social_modes ?? []).includes(key)}
              />
              {SOCIAL_MODES[key].label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Estado" htmlFor="status">
          <select id="status" name="status" defaultValue={experience?.status ?? "draft"} className="input">
            <option value="draft">Borrador</option>
            <option value="published">Publicada</option>
            <option value="cancelled">Cancelada</option>
            <option value="completed">Finalizada</option>
          </select>
        </Field>
        <div className="mt-6 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" defaultChecked={experience?.featured} />
            Marcar como destacada
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_original" defaultChecked={experience?.is_original ?? false} />
            Es un Sunny Original
          </label>
        </div>
      </div>

      {state.error && !state.fieldErrors && <p className="text-sm text-orange-ink">{state.error}</p>}

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
      {error && <p className="text-xs text-orange-ink">{error}</p>}
    </div>
  );
}
