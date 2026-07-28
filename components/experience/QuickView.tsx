"use client";

import { useEffect, useId, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/Badge";
import { ClaimPanel } from "@/components/experience/ClaimPanel";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort, formatTime } from "@/lib/dates";
import { EXPERIENCE_STATE_LABEL, EXPERIENCE_STATE_TONE, computeExperienceState, spotsLeft } from "@/lib/experience-status";
import { isDemoExperience, displayTitle } from "@/lib/demo-content";
import { useIsDesktop } from "@/components/motion/useIsDesktop";
import type { ExperienceCta } from "@/lib/experience-cta";
import type { ExperienceWithBusiness } from "@/lib/queries";

/**
 * Desktop side drawer / mobile bottom sheet for a fast look at an
 * experience without leaving the page. One responsive component (CSS
 * switches the panel between right-edge drawer and bottom sheet); the
 * slide direction for the enter/exit animation still needs to know which
 * layout is active, hence `useIsDesktop`.
 *
 * Dismissal always goes through a browser history entry: opening pushes
 * one, and every close path (Escape, backdrop, the X button) calls
 * `history.back()` rather than closing directly, so the popstate handler
 * is the single source of truth and the hardware/gesture back button
 * closes the panel instead of leaving the page.
 */
export function QuickView({
  experience,
  cta,
  open,
  onClose,
}: {
  experience: ExperienceWithBusiness | null;
  cta: ExperienceCta["type"] | null;
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.history.pushState({ sunnyQuickView: true }, "");

    function handlePopState() {
      onCloseRef.current();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        window.history.back();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.querySelector<HTMLElement>("[data-quick-view-close]")?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!experience) return null;

  const isDemo = isDemoExperience(experience.title);
  const left = spotsLeft(experience, experience.reserved_count);
  const state = computeExperienceState(experience, experience.reserved_count);
  const topRequirements = experience.requirements.slice(0, 2);

  const panelInitial = isDesktop ? { x: "100%" } : { y: "100%" };
  const panelAnimate = isDesktop ? { x: 0 } : { y: 0 };
  const panelExit = isDesktop ? { x: "100%" } : { y: "100%" };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            className="absolute inset-0 bg-carbon/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => window.history.back()}
            aria-hidden
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={panelInitial}
            animate={panelAnimate}
            exit={panelExit}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-y-auto rounded-t-3xl bg-warm-white lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-full lg:max-w-md lg:rounded-t-none"
          >
            <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden lg:aspect-[4/3]">
              <Image
                src={experience.image_url || "/images/placeholder-1.svg"}
                alt=""
                fill
                sizes="(min-width: 1024px) 448px, 100vw"
                className="object-cover"
              />
              <button
                type="button"
                data-quick-view-close
                onClick={() => window.history.back()}
                aria-label="Cerrar vista rápida"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-warm-white/90 text-carbon shadow-md"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" />
                </svg>
              </button>
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <Badge tone="neutral" className="bg-warm-white/90">
                  {categoryLabel(experience.category)}
                </Badge>
                {isDemo && <Badge tone="orange">Demostración</Badge>}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-5 p-6 sm:p-7">
              <div>
                <Badge tone={EXPERIENCE_STATE_TONE[state]} className="w-fit">
                  {state === "available" || state === "low"
                    ? `${left} ${left === 1 ? "lugar" : "lugares"}`
                    : EXPERIENCE_STATE_LABEL[state]}
                </Badge>
                <h2 id={titleId} className="mt-3 text-2xl leading-snug font-semibold">
                  {displayTitle(experience.title)}
                </h2>
                <p className="mt-1 text-sm text-gray">{experience.business.name}</p>
              </div>

              {(experience.short_description || experience.description) && (
                <p className="text-sm text-carbon/80">{experience.short_description || experience.description}</p>
              )}

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs tracking-wide text-gray uppercase">Fecha</dt>
                  <dd className="mt-0.5">{formatDateShort(experience.starts_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs tracking-wide text-gray uppercase">Hora</dt>
                  <dd className="mt-0.5">{formatTime(experience.starts_at)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs tracking-wide text-gray uppercase">Ubicación</dt>
                  <dd className="mt-0.5">{experience.location_name}</dd>
                </div>
              </dl>

              {experience.what_is_included.length > 0 && (
                <div>
                  <p className="text-xs tracking-wide text-gray uppercase">Qué incluye</p>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {experience.what_is_included.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {topRequirements.length > 0 && (
                <div>
                  <p className="text-xs tracking-wide text-gray uppercase">Requisitos</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-carbon/80">
                    {topRequirements.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-carbon/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-auto flex flex-col gap-3 pt-2">
                {cta && <ClaimPanel key={experience.id} experienceId={experience.id} experienceSlug={experience.slug} initialCta={cta} source="quick_view" />}
                <Link
                  href={`/experiencias/${experience.slug}`}
                  className="text-center text-sm font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
                >
                  Ver todos los detalles
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
