import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getFeaturedExperience, getPublicExperiences } from "@/lib/queries";
import { ExperienceCard } from "@/components/experience/ExperienceCard";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { CATEGORIES } from "@/lib/constants";
import { categoryLabel } from "@/lib/constants";
import { formatDateShort } from "@/lib/dates";
import { spotsLeft } from "@/lib/experience-status";
import { PartnerLeadForm } from "@/components/site/PartnerLeadForm";
import { FaqList } from "@/components/site/FaqList";

export const dynamic = "force-dynamic";

const STEPS = [
  { number: "01", title: "Descubre", body: "Explora experiencias seleccionadas en Monterrey." },
  { number: "02", title: "Reclama", body: "Utiliza tu pase semanal antes de que se agoten los lugares." },
  { number: "03", title: "Vive", body: "Presenta tu folio, disfruta la experiencia y vuelve la próxima semana." },
];

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

  const highlighted = all
    .filter((e) => e.status === "published" && e.id !== featured?.id)
    .slice(0, 5);
  const destacadas = featured ? [featured, ...highlighted] : highlighted;

  return (
    <main>
      {/* Hero */}
      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h1 className="font-serif text-4xl leading-tight sm:text-6xl">
              Descubre algo <em className="italic text-orange">nuevo</em> para sentirte bien.
            </h1>
            <p className="mt-6 max-w-md text-lg text-gray">
              Experiencias de wellness, movimiento, cafés y recovery con cupos limitados en Monterrey.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton href="/experiencias" size="lg">
                Explorar experiencias
              </LinkButton>
              <LinkButton href="/como-funciona" size="lg" variant="outline">
                Cómo funciona
              </LinkButton>
            </div>
          </div>

          {featured && (
            <Link
              href={`/experiencias/${featured.slug}`}
              className="group block overflow-hidden rounded-3xl border border-carbon/10 bg-warm-white"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={featured.image_url || "/images/placeholder-1.svg"}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-2 p-6">
                <Badge tone="sunny">{categoryLabel(featured.category)}</Badge>
                <h2 className="font-serif text-2xl">{featured.title}</h2>
                <p className="text-sm text-gray">{featured.business.name}</p>
                <div className="mt-2 flex items-center justify-between text-sm text-gray">
                  <span>{formatDateShort(featured.starts_at)}</span>
                  <span>{spotsLeft(featured, featured.reserved_count)} lugares restantes</span>
                </div>
              </div>
            </Link>
          )}
        </Container>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-carbon/10 bg-warm-white py-20">
        <Container>
          <h2 className="font-serif text-3xl italic">Cómo funciona</h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number}>
                <span className="font-serif text-5xl text-orange">{step.number}</span>
                <h3 className="mt-4 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-gray">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Experiencias destacadas */}
      <section className="py-20">
        <Container>
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl italic">Experiencias destacadas</h2>
            <Link href="/experiencias" className="text-sm font-medium text-orange hover:underline">
              Ver todas →
            </Link>
          </div>
          {destacadas.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destacadas.slice(0, 6).map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-gray">Pronto publicaremos nuevas experiencias. Vuelve pronto.</p>
          )}
        </Container>
      </section>

      {/* Categorías */}
      <section className="border-y border-carbon/10 bg-warm-white py-20">
        <Container>
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
        </Container>
      </section>

      {/* Pase semanal */}
      <section className="py-20">
        <Container className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="font-serif text-3xl italic">Tu pase semanal</h2>
            <p className="mt-4 text-gray">
              Cada semana tienes un pase gratuito para reclamar tu lugar en una experiencia disponible.
            </p>
          </div>
          <ul className="space-y-3 text-carbon">
            <li className="rounded-xl border border-carbon/10 bg-warm-white p-4">1 pase gratuito por semana.</li>
            <li className="rounded-xl border border-carbon/10 bg-warm-white p-4">Cupos limitados por experiencia.</li>
            <li className="rounded-xl border border-carbon/10 bg-warm-white p-4">Se renueva cada lunes.</li>
            <li className="rounded-xl border border-carbon/10 bg-warm-white p-4">Sin membresía durante esta etapa.</li>
          </ul>
        </Container>
      </section>

      {/* Para negocios */}
      <section className="border-y border-carbon/10 bg-carbon py-20 text-warm-white">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-3xl italic">Haz que nuevas personas descubran tu espacio.</h2>
            <p className="mt-4 max-w-md text-warm-white/80">
              Comparte algunos lugares, conecta con clientes potenciales y forma parte de la selección de Sunny
              Project.
            </p>
            <LinkButton href="/para-negocios" size="lg" variant="secondary" className="mt-8">
              Quiero participar
            </LinkButton>
          </div>
          <PartnerLeadForm compact />
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <Container className="max-w-3xl">
          <h2 className="font-serif text-3xl italic">Preguntas frecuentes</h2>
          <div className="mt-8">
            <FaqList items={FAQ_PREVIEW} />
          </div>
          <Link href="/preguntas-frecuentes" className="mt-6 inline-block text-sm font-medium text-orange hover:underline">
            Ver todas las preguntas →
          </Link>
        </Container>
      </section>
    </main>
  );
}
