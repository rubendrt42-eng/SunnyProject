import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedExperience, getPublicExperiences, getActiveWeeklyReservation, getUserReservationHistory } from "@/lib/queries";
import { getCurrentUser, isProfileComplete } from "@/lib/auth";
import { determineCta } from "@/lib/experience-cta";
import { listAvailableDemoAssets } from "@/lib/assets.server";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { FaqList } from "@/components/site/FaqList";
import { Hero } from "@/components/home/Hero";
import { ThisWeekSection } from "@/components/home/ThisWeekSection";
import { HowItWorksNarrative } from "@/components/home/HowItWorksNarrative";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { PassShowcase } from "@/components/home/PassShowcase";
import { ForBusinessSection } from "@/components/home/ForBusinessSection";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { isPast } from "@/lib/dates";

export const dynamic = "force-dynamic";

const FAQ_PREVIEW = [
  {
    q: "¿Cuánto cuesta?",
    a: "Nada. Cada semana tienes un pase gratuito para reclamar un lugar en una experiencia disponible.",
  },
  {
    q: "¿Puedo llevar acompañantes?",
    a: "No, el pase es individual, personal y no transferible.",
  },
  {
    q: "¿Qué pasa si no puedo ir?",
    a: "Puedes cancelar desde \"Mi pase\" hasta 12 horas antes y recuperas tu pase para reservar otra experiencia esa misma semana.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const availableAssets = listAvailableDemoAssets();

  const [featured, { data: all }, activeWeekly, history] = await Promise.all([
    getFeaturedExperience(supabase),
    getPublicExperiences(supabase),
    user ? getActiveWeeklyReservation(supabase, user.id) : Promise.resolve(null),
    user ? getUserReservationHistory(supabase, user.id) : Promise.resolve([]),
  ]);

  const upcomingPublished = all.filter((e) => e.status === "published" && !isPast(e.starts_at));
  const weekItems = [...(featured ? [featured] : []), ...upcomingPublished.filter((e) => e.id !== featured?.id)].slice(0, 6);

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
      <Hero
        experiences={weekItems.slice(0, 5)}
        ctaByExperienceId={ctaByExperienceId}
        availableAssets={availableAssets}
      />

      {/* Esta semana en Sunny — ivory (default page background) */}
      <section className="py-20 sm:py-28">
        <Container>
          <InViewReveal>
            <p className="text-sm font-semibold tracking-widest text-orange uppercase">Esta semana en Sunny</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <h2 className="max-w-xl text-3xl font-semibold sm:text-4xl">
                Planes seleccionados para moverte, recuperarte, conectar y probar algo diferente.
              </h2>
              <Link href="/experiencias" className="text-sm font-medium text-orange hover:underline">
                Ver todas →
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

      {/* Cómo funciona — warm white, yellow/orange used only as accents */}
      <section className="bg-warm-white py-20 sm:py-28">
        <Container>
          <InViewReveal>
            <p className="text-sm font-semibold tracking-widest text-orange uppercase">El recorrido</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Cómo funciona</h2>
          </InViewReveal>
          <div className="mt-14">
            <HowItWorksNarrative experiences={weekItems.slice(0, 2)} availableAssets={availableAssets} />
          </div>
        </Container>
      </section>

      {/* Categorías — ivory/sand, photo/copy switch per category */}
      <section className="bg-ivory py-20 sm:py-28">
        <Container>
          <InViewReveal>
            <p className="text-sm font-semibold tracking-widest text-orange uppercase">Explora según lo que buscas</p>
            <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Cinco formas de salir de la rutina.</h2>
          </InViewReveal>
          <div className="mt-10">
            <CategoriesSection experiences={upcomingPublished} availableAssets={availableAssets} />
          </div>
        </Container>
      </section>

      {/* Tu pase semanal — carbon, yellow accents, real session state */}
      <section className="bg-carbon py-20 text-warm-white sm:py-28">
        <Container>
          <PassShowcase user={user} activeWeekly={activeWeekly} />
        </Container>
      </section>

      {/* Para negocios — soft orange, opens the real form in a modal */}
      <section className="bg-orange/10 py-20 sm:py-28">
        <Container>
          <ForBusinessSection availableAssets={availableAssets} />
        </Container>
      </section>

      {/* FAQ — ivory */}
      <section className="py-20 sm:py-28">
        <Container className="max-w-3xl">
          <InViewReveal>
            <h2 className="text-3xl font-semibold">Preguntas frecuentes</h2>
            <div className="mt-8">
              <FaqList items={FAQ_PREVIEW} />
            </div>
            <Link href="/preguntas-frecuentes" className="mt-6 inline-block text-sm font-medium text-orange hover:underline">
              Ver todas las preguntas →
            </Link>
          </InViewReveal>
        </Container>
      </section>

      {/* Cierre editorial — carbon, flows straight into the (also carbon) footer */}
      <section className="bg-carbon py-24 text-warm-white sm:py-32">
        <Container className="max-w-2xl text-center">
          <InViewReveal>
            <p className="text-3xl font-semibold sm:text-4xl">Cada semana, algo nuevo.</p>
            <p className="mt-4 text-warm-white/70">
              Experiencias reales en Monterrey, sin fotos de stock ni promesas vacías. Un pase gratuito, una vez por
              semana.
            </p>
            <LinkButton href="/experiencias" size="lg" variant="primary" arrow className="mt-8">
              Explorar experiencias
            </LinkButton>
          </InViewReveal>
        </Container>
      </section>
    </main>
  );
}
