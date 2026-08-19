import type { Metadata } from "next";
import Link from "next/link";
// lucide-react ya no incluye iconos de marca (los retiró por licencia),
// así que Instagram va con `AtSign`, que es el símbolo con el que se nombra
// una cuenta y se lee igual de claro junto a la palabra «Instagram».
import { AtSign, Mail, MessageCircle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { WhatIsSunny } from "@/components/home/WhatIsSunny";
import { CommunitySection } from "@/components/home/CommunitySection";
import { FaqList } from "@/components/site/FaqList";
import { LeanHero } from "@/components/lean/LeanHero";
import { ExperienceGrid } from "@/components/lean/ExperienceGrid";
import { HowItWorks } from "@/components/lean/HowItWorks";
import { getSiteSettings, getUpcomingExperiences } from "@/lib/sanity/queries";
import { DEFAULT_SETTINGS, whatsappLink } from "@/lib/lean-content";

/**
 * Portada del MVP lean.
 *
 * OCHO SECCIONES, NO TRECE
 *
 * La versión anterior tenía trece secciones y catorce encabezados compitiendo:
 * 12.496 px en escritorio y 15.052 px en móvil, casi dieciocho pantallas de
 * scroll. Medido. En la práctica, todo lo que iba después de la sexta sección
 * no existía para quien entra desde el teléfono — y ahí vivían el formulario de
 * negocios y las preguntas frecuentes.
 *
 * Esta portada responde las preguntas en el orden en que se hacen —qué es,
 * qué hay ahora, cómo le hago, con quién, quién más está, dudas— y termina.
 *
 * Se revalida cada minuto: lo que Emmy publica en Sanity aparece aquí sin que
 * nadie toque código ni redespliegue nada.
 */
/**
 * 60 segundos. Tiene que ser un número literal: Next analiza esta
 * configuración de forma estática en el build y una constante importada no la
 * puede leer — falla con «Invalid segment configuration export». El mismo
 * valor vive nombrado en SANITY_REVALIDATE_SECONDS para las consultas.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "The Sunny Project — Experiencias en Monterrey",
  description:
    "Experiencias locales para salir de la rutina, conocer gente y formar parte de una comunidad que busca crecer.",
};

export default async function HomePage() {
  // Una sola llamada por dato y en paralelo. Las dos comparten caché con el
  // resto del sitio a través de sus etiquetas, así que abrir el catálogo
  // después no vuelve a pedir lo mismo.
  const [experiences, settings] = await Promise.all([getUpcomingExperiences(), getSiteSettings()]);

  const s = { ...DEFAULT_SETTINGS, ...(settings ?? {}) };
  const destacadas = experiences.slice(0, 6);
  const hayContacto = Boolean(s.whatsapp?.trim() || s.instagramUrl?.trim() || s.contactEmail?.trim());

  return (
    <main>
      <LeanHero
        title={s.heroTitle}
        subtitle={s.heroSubtitle}
        experienceCount={experiences.filter((e) => e.status !== "sold_out").length}
        image={settings?.heroImage ?? null}
      />

      {/* 1. Qué hay ahora. Va antes de explicar nada: primero se ve que hay
          algo que vale la pena, después se explica el mecanismo. */}
      <section className="py-14 sm:py-20 lg:py-28">
        <Container>
          <InViewReveal variant="lead">
            <p className="eyebrow">Esta semana</p>
            <h2 className="mt-3 max-w-2xl text-title text-balance">
              Planes para moverte, recuperarte, conectar y probar algo diferente.
            </h2>
          </InViewReveal>

          <div className="mt-10">
            <ExperienceGrid experiences={destacadas} />
          </div>

          {experiences.length > destacadas.length && (
            <div className="mt-10 text-center">
              <LinkButton href="/experiencias" variant="secondary" arrow>
                Ver las {experiences.length} experiencias
              </LinkButton>
            </div>
          )}
        </Container>
      </section>

      {/* 2. Qué es Sunny. */}
      <section id="que-es-sunny" className="scroll-mt-24 bg-warm-white py-14 sm:py-20 lg:py-28">
        <Container>
          <WhatIsSunny />
        </Container>
      </section>

      {/* 3. Cómo funciona, en tres pasos. */}
      <section className="py-14 sm:py-20 lg:py-28">
        <HowItWorks />
      </section>

      {/*
        4. Comunidad — el capítulo oscuro.

        La sección pone su propio fondo carbón: está escrita con texto en blanco
        cálido, y cuando el fondo lo decidía la portada acabó montada sobre
        `bg-warm-white`, o sea texto blanco sobre casi blanco. En las capturas
        de la auditoría el párrafo era invisible.

        Es además la única sección oscura entre el hero y el pie, que es lo que
        devuelve el ritmo a una portada donde todo lo demás vive entre marfil y
        blanco cálido.
      */}
      <section id="comunidad" className="scroll-mt-24">
        <CommunitySection instagramUrl={s.instagramUrl} />
      </section>

      {/* 5. Para negocios. */}
      <section className="bg-orange/8 py-14 sm:py-20 lg:py-28">
        {/*
          Composición propia, no un cartel centrado.

          Era un titular, un párrafo y un botón, los tres centrados sobre el
          fondo durazno: leído seguido después de la sección de comunidad, se
          notaba que aquí la página dejaba de componer y se ponía a anunciar.
          Ahora el texto ocupa su columna y el lienzo de marca la otra, con la
          misma estructura editorial que el resto de la portada. Sigue habiendo
          un solo botón.
        */}
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-[clamp(1.5rem,4vw,3.5rem)]">
            <div className="min-w-0 lg:col-span-7">
              <InViewReveal variant="lead">
                <p className="eyebrow">Para negocios</p>
                <h2 className="mt-3 max-w-xl text-title text-balance">¿Quieres crear una experiencia con Sunny?</h2>
                <p className="mt-5 max-w-[52ch] text-lead text-carbon/80">
                  Si tienes un estudio, un espacio o una clase, te ayudamos a que gente nueva lo conozca. Nos cuentas
                  qué haces y platicamos cómo podría funcionar.
                </p>
                <div className="mt-8">
                  <LinkButton href="/para-negocios" size="lg" arrow>
                    Cuéntanos de tu espacio
                  </LinkButton>
                </div>
              </InViewReveal>
            </div>
            {/*
              QUÉ PASA DESPUÉS, EN VEZ DE UN DEGRADADO

              Aquí había un lienzo de marca cuadrado: el cuarto rectángulo
              naranja de la misma portada. Un negocio que está decidiendo si
              escribirnos no necesita una textura, necesita saber en qué se está
              metiendo. Esto responde eso en tres líneas y de paso le da a la
              sección una composición que no se repite en ninguna otra parte.

              Las tres líneas no prometen nada que el sistema no cumpla: llega
              la propuesta, hay una conversación, y publicar es una decisión
              posterior. Es exactamente lo que hace hoy el formulario.
            */}
            <InViewReveal delay={0.08} className="min-w-0 lg:col-span-5">
              <ol className="divide-y divide-carbon/10 rounded-xl border border-carbon/10 bg-warm-white/70">
                {[
                  ["Nos escribes", "Cuéntanos qué haces y dónde. Sin formularios largos."],
                  ["Platicamos", "Te contactamos para entender tu espacio y ver si encaja."],
                  ["Lo armamos juntos", "Si tiene sentido para los dos, definimos fecha y cupo."],
                ].map(([titulo, texto], i) => (
                  <li key={titulo} className="flex gap-4 p-5">
                    <span aria-hidden className="shrink-0 font-serif text-2xl leading-none text-orange-ink/70 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="text-heading">{titulo}</p>
                      <p className="mt-1 text-small text-gray">{texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/* 6. Preguntas frecuentes, editables desde Sanity. */}
      {s.faq.length > 0 && (
        <section className="py-14 sm:py-20 lg:py-28">
          <Container className="max-w-3xl">
            <InViewReveal variant="lead">
              <p className="eyebrow">Preguntas frecuentes</p>
              <h2 className="mt-3 text-title">Lo que casi siempre nos preguntan.</h2>
            </InViewReveal>
            <div className="mt-8">
              <FaqList items={s.faq.map((item) => ({ q: item.question, a: item.answer }))} />
            </div>
          </Container>
        </section>
      )}

      {/*
        7. Contacto — solo si existe al menos un canal real.

        Antes esta sección se dibujaba siempre, y como los tres campos están
        vacíos en Sanity, el resultado publicado era un «¿Nos escribes?»
        seguido de nada. Invitar a escribir sin decir a dónde es peor que no
        invitar. Si no hay ningún canal, la sección entera no existe.
      */}
      {hayContacto && (
        <section className="border-t border-carbon/10 bg-warm-white py-12 sm:py-16 lg:py-20">
          <Container className="text-center">
            <InViewReveal>
              <h2 className="text-subtitle">¿Nos escribes?</h2>
              <p className="mx-auto mt-2 max-w-md text-body text-gray">
                Para dudas, propuestas o para contarnos qué experiencia te gustaría ver.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {s.whatsapp && <ContactLink href={whatsappLink(s.whatsapp)} icon={MessageCircle} label="WhatsApp" />}
                {s.instagramUrl && <ContactLink href={s.instagramUrl} icon={AtSign} label="Instagram" />}
                {s.contactEmail && (
                  <ContactLink href={`mailto:${s.contactEmail}`} icon={Mail} label={s.contactEmail} />
                )}
              </div>
            </InViewReveal>
          </Container>
        </section>
      )}
    </main>
  );
}

function ContactLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Mail;
  label: string;
}) {
  const external = href.startsWith("http");

  return (
    <Link
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-11 items-center gap-2 text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 transition-colors hover:decoration-carbon"
    >
      <Icon aria-hidden size={16} strokeWidth={1.75} />
      {label}
    </Link>
  );
}
