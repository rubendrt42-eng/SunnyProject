"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, SearchX } from "lucide-react";
import { clsx } from "clsx";
import { Badge, OriginalSeal } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ManagedPhoto } from "@/components/ui/ManagedPhoto";
import { SocialModes } from "@/components/ui/SocialModes";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { displayTitle } from "@/lib/demo-content";
import { isOriginal, socialModesOf } from "@/lib/experience-flags";
import { computeExperienceState, EXPERIENCE_STATE_LABEL, spotsLeft } from "@/lib/experience-status";
import { INTENT_KEYS, INTENTS, matchesIntent, type Intent } from "@/lib/social-modes";
import type { ExperienceWithBusiness } from "@/lib/queries";

/**
 * Navigation by intention (brief §16, adapted from the paired questions
 * Phamily repeats across its pages). The database keeps technical
 * categories; the home page asks a human question instead.
 *
 * The matching is an explicit table in lib/social-modes.ts — no scoring, no
 * inference, no AI. Choosing an intent filters the real experience list;
 * when an intent has nothing this week that is stated plainly rather than
 * padded with unrelated cards, and the full catalogue stays one click away.
 *
 * Keyboard: the options are a real radiogroup of buttons, reachable by Tab
 * and operable by Enter/Space, with `aria-pressed` carrying the state so
 * selection is never communicated by colour alone.
 */
export function IntentSelector({
  experiences,
  availableAssets,
}: {
  experiences: ExperienceWithBusiness[];
  availableAssets: string[];
}) {
  const [intent, setIntent] = useState<Intent>("moverme");

  const matches = experiences.filter((experience) =>
    matchesIntent({ category: experience.category, socialModes: socialModesOf(experience) }, intent),
  );

  return (
    <div>
      <div role="group" aria-label="¿Qué buscas esta semana?" className="flex flex-wrap gap-2">
        {INTENT_KEYS.map((key) => {
          const active = key === intent;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setIntent(key)}
              aria-pressed={active}
              className={clsx(
                "min-h-11 rounded-full border px-4 text-small font-medium transition-colors",
                active
                  ? "border-carbon bg-sunny text-carbon"
                  : "border-carbon/20 bg-transparent text-carbon/75 hover:border-carbon/50 hover:text-carbon",
              )}
            >
              {INTENTS[key].label}
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="mt-5 text-small text-gray">
        {matches.length > 0
          ? `${matches.length} ${matches.length === 1 ? "experiencia" : "experiencias"} para "${INTENTS[intent].question.toLowerCase()}"`
          : `Nada para "${INTENTS[intent].question.toLowerCase()}" esta semana`}
      </p>

      {matches.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.slice(0, 3).map((experience) => (
            <li key={experience.id}>
              <IntentCard experience={experience} availableAssets={availableAssets} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          className="mt-5"
          icon={SearchX}
          title="Todavía no hay nada con esa intención"
          description="Cambia de intención arriba o revisa el catálogo completo — se publican experiencias nuevas cada semana."
          action={
            <Link href="/experiencias" className="inline-flex items-center gap-1.5 text-small font-semibold text-carbon underline decoration-carbon/30 underline-offset-4">
              Ver todo el catálogo
              <ArrowRight aria-hidden size={14} />
            </Link>
          }
        />
      )}
    </div>
  );
}

function IntentCard({
  experience,
  availableAssets,
}: {
  experience: ExperienceWithBusiness;
  availableAssets: string[];
}) {
  const state = computeExperienceState(experience, experience.reserved_count);
  const left = spotsLeft(experience, experience.reserved_count);
  const modes = socialModesOf(experience);

  return (
    <Link
      href={`/experiencias/${experience.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-carbon/10 bg-warm-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/5 w-full overflow-hidden bg-carbon/5">
        <ManagedPhoto
          url={experience.image_url}
          availableAssets={availableAssets}
          alt=""
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover transition-transform duration-[var(--motion-enter)] ease-sunny group-hover:scale-[1.02]"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isOriginal(experience) ? <OriginalSeal /> : <Badge tone="onPhoto">{categoryLabel(experience.category)}</Badge>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-heading">{displayTitle(experience.title)}</h3>
        <p className="text-small text-gray">
          {experience.business.name} · {formatDateShort(experience.starts_at)}
        </p>
        <SocialModes modes={modes} max={2} className="mt-1" />
        <p className="mt-auto pt-3 text-small font-medium text-carbon">
          {state === "available" || state === "low"
            ? `${left} ${left === 1 ? "lugar disponible" : "lugares disponibles"}`
            : EXPERIENCE_STATE_LABEL[state]}
        </p>
      </div>
    </Link>
  );
}
