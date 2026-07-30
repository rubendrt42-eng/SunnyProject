import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getFeaturedExperience,
  getFeaturedPartners,
  getPublicExperiences,
  getActiveWeeklyReservation,
  getUserReservationHistory,
} from "@/lib/queries";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { determineCta } from "@/lib/experience-cta";
import { listAvailableDemoAssets } from "@/lib/assets.server";
import { isOriginal } from "@/lib/experience-flags";
import { displayTitle } from "@/lib/demo-content";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { FaqList } from "@/components/site/FaqList";
import { Hero } from "@/components/home/Hero";
import { ExperienceMarquee } from "@/components/home/ExperienceMarquee";
import { ThisWeekSection } from "@/components/home/ThisWeekSection";
import { IntentSelector } from "@/components/home/IntentSelector";
import { WhatIsSunny } from "@/components/home/WhatIsSunny";
import { HowItWorksNarrative } from "@/components/home/HowItWorksNarrative";
import { CommunitySection } from "@/components/home/CommunitySection";
import { OriginalsSection } from "@/components/home/OriginalsSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { PassShowcase } from "@/components/home/PassShowcase";
import { ForBusinessSection } from "@/components/home/ForBusinessSection";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { isPast } from "@/lib/dates";

export const dynamic = "force-dynamic";

/**
 * Three real questions with real answers. The companion question used to
 * say "No, el pase es individual, personal y no transferible" — that copy
 * is now wrong in two directions (brief §39): companions are a configured
 * per-experience allowance, so the honest answer is "depends on the
 * experience, and it will say so".
 */
const FAQ_PREVIEW = [
  {
    q: "¿Cuánto cuesta?",
    a: "Nada. Cada semana tienes un pase gratuito para reservar un lugar en una experiencia disponible.",
  },
  {
    q: "¿Puedo llevar a alguien?",
    a: "Depende de la experiencia. Cada una indica cuántos lugares admite por reservación; cuando permite acompañante lo dice en la tarjeta y en su página. El pase sigue siendo tuyo y respondes por tu grupo.",
  },
  {
    q: "¿Qué pasa si no puedo ir?",
    a: "Puedes cancelar desde \"Mi pase\" hasta 12 horas antes y recuperas tu pase para reservar otra experiencia esa misma semana.",
  },
];

/**
 * Home section order follows the narrative priority in the brief §11:
 * EMOCIÓN → EXPERIENCIAS → PROPÓSITO → FUNCIONAMIENTO → COMUNIDAD → PARTICIPACIÓN.
 *
 * The important structural change from the previous build is that "Cómo
 * funciona" no longer comes before the person has seen anything they could
 * actually do — the same ordering decision Phamily makes (inventory before
 * mechanism). Two sections are conditional on real data and disappear
 * entirely when it is absent: Sunny Originals (needs a flagged experience)
 * and Espacios aliados (needs `featured_as_partner`).
 *
 * No two consecutive sections use the same composition — see
 * SUNNY_VISUAL_DIRECTION_1_0.md §8 for the anti-template rule this enforces.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const availableAssets = listAvailableDemoAssets();

  const [featured, { data: all }, activeWeekly, history, partners] = await Promise.all([
    getFeaturedExperience(supabase),
    getPublicExperiences(supabase),
    user ? getActiveWeeklyReservation(supabase, user.id) : Promise.resolve(null),
    user ? getUserReservationHistory(supabase, user.id) : Promise.resolve([]),
    getFeaturedPartners(supabase),
  ]);

  const upcomingPublished = all.filter((e) => e.status === "published" && !isPast(e.starts_at));
  const weekItems = [...(featured ? [featured] : []), ...upcomingPublished.filter((e) => e.id !== featured?.id)].slice(0, 6);
  const originals = upcomingPublished.filter(isOriginal);

  const reservedExperienceIds = new Set(
    history.filter((r) => r.status === "confirmed" || r.status === "attended" || r.status === "no_show").map((r) => r.experience_id),
  );

  const ctaByExperienceId: Record<string, ReturnType<typeof determineCta>["type"]> = {};
  for (const experience of weekItems) {
    ctaByExperienceId[experience.id] = determineCta({
      experience,
      isAuthenticated: Boolean(user),
      isProfileComplete: isProfileComplete(user?.profile ?? null),
      hasReservationForThisExperience: reservedExperienceIds.has(experience.id),
      hasActivePassElsewhere: Boolean(activeWeekly) && activeWeekly?.experience_id !== experience.id,
    }).type;
  }

  return (
    <main>
      {/* 2. Hero — editorial split on ivory */}
      <Hero experiences={weekItems.slice(0, 5)} />

      {/* 3. Cinta de experiencias — real names, slow, pausable */}
      <ExperienceMarquee items={upcomingPublished.map((e) => ({ slug: e.slug, title: displayTitle(e.title) }))} />

      {/* 4. Esta semana en Sunny — asymmetric grid, 1 featured + secondaries */}
      <section className="py-20 sm:py-28">
        <Container>
          <InViewReveal>
            <p className="eyebrow">Esta semana en Sunny</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-xl text-title">
                Planes seleccionados para moverte, recuperarte, conectar y probar algo diferente.
              </h2>
              <Link
                href="/experiencias"
                className="text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
              >
                Ver todas
              </Link>
            </div>
          </InViewReveal>
          {weekItems.length > 0 ? (
            <div className="mt-10">
              <ThisWeekSection experiences={weekItems} ctaByExperienceId={ctaByExperienceId} availableAssets={availableAssets} />
            </div>
          ) : (
            <p className="mt-10 text-gray">Pronto publicaremos nuevas experiencias. Vuelve pronto.</p>
          )}
        </Container>
      </section>

      {/* 5. Selector por intención — interactive chips, warm white */}
      {upcomingPublished.length > 0 && (
        <section className="bg-warm-white py-20 sm:py-28">
          <Container>
            <InViewReveal>
              <p className="eyebrow">Navega por lo que quieres</p>
              <h2 className="mt-3 text-title">¿Qué buscas esta semana?</h2>
            </InViewReveal>
            <div className="mt-8">
              <IntentSelector experiences={upcomingPublished} availableAssets={availableAssets} />
            </div>
          </Container>
        </section>
      )}

      {/* 6. Qué es Sunny Project — editorial split with Emmy */}
      <section id="que-es-sunny" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <WhatIsSunny />
        </Container>
      </section>

      {/* 7. Cómo funciona — sticky numbered narrative on desktop, vertical on mobile */}
      <section className="bg-warm-white py-20 sm:py-28">
        <Container>
          <InViewReveal>
            <p className="eyebrow">El recorrido</p>
            <h2 className="mt-3 text-title">Salir de la rutina no debería ser complicado.</h2>
          </InViewReveal>
        </Container>
        <div className="mt-14">
          <HowItWorksNarrative experiences={weekItems.slice(0, 2)} availableAssets={availableAssets} />
        </div>
      </section>

      {/* 8. Comunidad — contrast chapter, offset photo pair */}
      <section id="comunidad" className="scroll-mt-24 bg-carbon py-24 text-warm-white sm:py-32">
        <Container>
          <CommunitySection />
        </Container>
      </section>

      {/* 9. Sunny Originals — only when a real Original exists */}
      {originals.length > 0 && (
        <section className="bg-pine py-20 sm:py-28">
          <Container>
            <OriginalsSection experiences={originals} availableAssets={availableAssets} />
          </Container>
        </section>
      )}

      {/* 10. Categorías — photo/copy switch per category */}
      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <InViewReveal>
            <p className="eyebrow">Explora según lo que buscas</p>
            <h2 className="mt-3 text-title">Cinco formas de salir de la rutina.</h2>
          </InViewReveal>
          <div className="mt-10">
            <CategoriesSection experiences={upcomingPublished} availableAssets={availableAssets} />
          </div>
        </Container>
      </section>

      {/* 11. Espacios aliados — only when a business is explicitly featured */}
      {partners.length > 0 && (
        <section className="bg-warm-white py-20 sm:py-28">
          <Container>
            <PartnersSection businesses={partners} />
          </Container>
        </section>
      )}

      {/* 12. Pase semanal — real session state, contrast panel */}
      <section className="bg-carbon py-20 text-warm-white sm:py-28">
        <Container>
          <PassShowcase user={user} activeWeekly={activeWeekly} />
        </Container>
      </section>

      {/* 13. Para negocios — soft orange, opens the real form in a modal */}
      <section className="bg-orange/10 py-20 sm:py-28">
        <Container>
          <ForBusinessSection availableAssets={availableAssets} />
        </Container>
      </section>

      {/* 14. FAQ — accordion */}
      <section className="py-20 sm:py-28">
        <Container className="max-w-3xl">
          <InViewReveal>
            <h2 className="text-title">Preguntas frecuentes</h2>
            <div className="mt-8">
              <FaqList items={FAQ_PREVIEW} />
            </div>
            <Link
              href="/preguntas-frecuentes"
              className="mt-6 inline-block text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
            >
              Ver todas las preguntas
            </Link>
          </InViewReveal>
        </Container>
      </section>

      {/* 15. CTA final — one action, centered, flows into the footer */}
      <section className="bg-carbon py-24 text-warm-white sm:py-32">
        <Container className="max-w-2xl text-center">
          <InViewReveal>
            <p className="text-title">Cada semana, algo nuevo.</p>
            <p className="mt-4 text-body-l text-warm-white/70">
              Experiencias en Monterrey con cupos reales y un pase gratuito, una vez por semana.
            </p>
            <LinkButton href="/experiencias" size="lg" variant="primary" arrow className="mt-8">
              Ver esta semana
            </LinkButton>
          </InViewReveal>
        </Container>
      </section>
    </main>
  );
}
