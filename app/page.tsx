import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedExperience, getPublicExperiences } from "@/lib/queries";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/constants";
import { PartnerLeadForm } from "@/components/site/PartnerLeadForm";
import { FaqList } from "@/components/site/FaqList";
import { Hero } from "@/components/home/Hero";
import { ExperienceCarousel } from "@/components/home/ExperienceCarousel";
import { HowItWorksNarrative } from "@/components/home/HowItWorksNarrative";
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
  const [featured, all] = await Promise.all([getFeaturedExperience(supabase), getPublicExperiences(supabase)]);

  const upcomingPublished = all.filter((e) => e.status === "published" && !isPast(e.starts_at));
  const carouselItems = [
    ...(featured ? [featured] : []),
    ...upcomingPublished.filter((e) => e.id !== featured?.id),
  ].slice(0, 5);

  return (
    <main>
      <Hero featured={featured} />

      {/* Carrusel de experiencias destacadas */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl italic">Experiencias destacadas</h2>
            <Link href="/experiencias" className="text-sm font-medium text-orange hover:underline">
              Ver todas →
            </Link>
          </div>
          {carouselItems.length > 0 ? (
            <div className="mt-10">
              <ExperienceCarousel experiences={carouselItems} />
            </div>
          ) : (
            <p className="mt-10 text-gray">Pronto publicaremos nuevas experiencias. Vuelve pronto.</p>
          )}
        </Container>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-carbon/10 bg-warm-white py-20 sm:py-28">
        <Container>
          <h2 className="font-serif text-3xl italic">Cómo funciona</h2>
          <div className="mt-14">
            <HowItWorksNarrative />
          </div>
        </Container>
      </section>

      {/* Categorías */}
      <section className="py-20">
        <Container>
          <InViewReveal>
            <h2 className="font-serif text-3xl italic">Categorías</h2>
            <div className="mt-8 flex flex-wrap gap-3">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.value}
                  href={`/experiencias?categoria=${c.value}`}
                  className="rounded-full border border-carbon/15 px-5 py-2.5 text-sm font-medium hover:border-carbon hover:bg-carbon/5"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </InViewReveal>
        </Container>
      </section>

      {/* Pase semanal */}
      <section className="border-y border-carbon/10 bg-warm-white py-20">
        <Container className="grid gap-10 sm:grid-cols-2">
          <InViewReveal>
            <h2 className="font-serif text-3xl italic">Tu pase semanal</h2>
            <p className="mt-4 text-gray">
              Cada semana tienes un pase gratuito para reclamar tu lugar en una experiencia disponible.
            </p>
          </InViewReveal>
          <InViewReveal delay={0.1}>
            <ul className="space-y-3 text-carbon">
              <li className="rounded-xl border border-carbon/10 bg-ivory p-4">1 pase gratuito por semana.</li>
              <li className="rounded-xl border border-carbon/10 bg-ivory p-4">Cupos limitados por experiencia.</li>
              <li className="rounded-xl border border-carbon/10 bg-ivory p-4">Se renueva cada lunes.</li>
              <li className="rounded-xl border border-carbon/10 bg-ivory p-4">Sin membresía durante esta etapa.</li>
            </ul>
          </InViewReveal>
        </Container>
      </section>

      {/* Para negocios */}
      <section className="py-20">
        <Container className="grid gap-10 rounded-3xl bg-carbon p-8 text-warm-white sm:p-14 lg:grid-cols-2 lg:items-center">
          <InViewReveal>
            <h2 className="font-serif text-3xl italic">Haz que nuevas personas descubran tu espacio.</h2>
            <p className="mt-4 max-w-md text-warm-white/80">
              Comparte algunos lugares, conecta con clientes potenciales y forma parte de la selección de Sunny
              Project.
            </p>
            <LinkButton href="/para-negocios" size="lg" variant="secondary" className="mt-8">
              Quiero participar
            </LinkButton>
          </InViewReveal>
          <InViewReveal delay={0.1}>
            <PartnerLeadForm compact />
          </InViewReveal>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <Container className="max-w-3xl">
          <InViewReveal>
            <h2 className="font-serif text-3xl italic">Preguntas frecuentes</h2>
            <div className="mt-8">
              <FaqList items={FAQ_PREVIEW} />
            </div>
            <Link href="/preguntas-frecuentes" className="mt-6 inline-block text-sm font-medium text-orange hover:underline">
              Ver todas las preguntas →
            </Link>
          </InViewReveal>
        </Container>
      </section>
    </main>
  );
}
