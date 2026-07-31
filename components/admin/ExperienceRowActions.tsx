"use client";

import { useState, useTransition } from "react";
import { Archive, ArchiveRestore, Copy, Eye, EyeOff, Star, Sparkles } from "lucide-react";
import { AdminActionButton } from "@/components/admin/AdminActionButton";
import {
  duplicateExperienceAction,
  setExperienceArchivedAction,
  setExperienceStatusAction,
  toggleFeaturedAction,
  toggleOriginalAction,
} from "@/lib/actions/admin";

/**
 * Row actions for one experience: publish/hide, duplicate, archive/restore,
 * feature, mark as Original.
 *
 * Two things worth noting:
 *
 * - Destructive-ish and confusing actions confirm first. Archiving and
 *   duplicating both change what Emmy sees in her list, so both ask.
 *   Nothing here deletes a record — archive hides, it does not destroy, and
 *   the confirm text says so.
 * - `is_original` and `archived_at` only exist after the presentation
 *   migration. `supportsFlags` is passed from the server (derived from
 *   whether the column came back on the row), so before the migration those
 *   two buttons are simply not rendered rather than offered and silently
 *   failing.
 */
export function ExperienceRowActions({
  experienceId,
  status,
  featured,
  isOriginal,
  archived,
  supportsFlags,
}: {
  experienceId: string;
  status: string;
  featured: boolean;
  isOriginal: boolean;
  archived: boolean;
  supportsFlags: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  function run(key: string, fn: () => Promise<unknown>, confirmText?: string) {
    if (pending) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(key);
    startTransition(async () => {
      await fn();
      setBusy(null);
    });
  }

  const canPublish = status === "draft";
  const canHide = status === "published";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canPublish && (
        <AdminActionButton
          label="Publicar"
          icon={Eye}
          busy={busy === "publish"}
          disabled={pending}
          onClick={() => run("publish", () => setExperienceStatusAction(experienceId, "published"))}
        />
      )}

      {canHide && (
        <AdminActionButton
          label="Ocultar"
          icon={EyeOff}
          busy={busy === "hide"}
          disabled={pending}
          onClick={() =>
            run(
              "hide",
              () => setExperienceStatusAction(experienceId, "draft"),
              "¿Ocultar esta experiencia del sitio público? Volverá a borrador y sus reservaciones se conservan.",
            )
          }
        />
      )}

      <AdminActionButton
        label="Duplicar"
        icon={Copy}
        busy={busy === "duplicate"}
        disabled={pending}
        onClick={() =>
          run(
            "duplicate",
            () => duplicateExperienceAction(experienceId),
            "Se creará una copia en borrador con la misma información, una semana después de la fecha original. No se copian reservaciones. Revisa la fecha antes de publicar.",
          )
        }
      />

      <AdminActionButton
        label={featured ? "Quitar destacada" : "Destacar"}
        icon={Star}
        active={featured}
        busy={busy === "featured"}
        disabled={pending}
        onClick={() => run("featured", () => toggleFeaturedAction(experienceId, !featured))}
      />

      {supportsFlags && (
        <AdminActionButton
          label={isOriginal ? "Quitar Original" : "Sunny Original"}
          icon={Sparkles}
          active={isOriginal}
          busy={busy === "original"}
          disabled={pending}
          onClick={() => run("original", () => toggleOriginalAction(experienceId, !isOriginal))}
        />
      )}

      {supportsFlags &&
        (archived ? (
          <AdminActionButton
            label="Restaurar"
            icon={ArchiveRestore}
            busy={busy === "restore"}
            disabled={pending}
            onClick={() => run("restore", () => setExperienceArchivedAction(experienceId, false))}
          />
        ) : (
          <AdminActionButton
            label="Archivar"
            icon={Archive}
            busy={busy === "archive"}
            disabled={pending}
            onClick={() =>
              run(
                "archive",
                () => setExperienceArchivedAction(experienceId, true),
                "¿Archivar esta experiencia? Desaparece del sitio y del dashboard, pero no se borra: sus reservaciones, folios y asistencias se conservan y puedes restaurarla.",
              )
            }
          />
        ))}
    </div>
  );
}
