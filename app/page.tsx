import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight, BedDouble, Brain, Building2, Compass, Droplets, Dumbbell, FlaskConical,
  Flower2, GraduationCap, Handshake, Heart, HeartPulse, Home, Leaf, Megaphone, Move,
  Package, ShoppingBag, Smartphone, Sparkles, Target, Users, Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { SunniCTA } from "@/components/lean/SunniCTA";
import { HuecoDeFoto } from "@/components/sunni/HuecoDeFoto";
import { ABOUT, BRING, EFECTO, ESPACIOS, EXPERIENCIAS, HERO, MARCAS, MARQUEE, MOODS, RECORRIDO, SEO, VENDING } from "@/lib/sunni-content";

/**
 * LA PORTADA DE SUN-I PROJECT®.
 *
 * Una sola página que cuenta el ecosistema entero, con navegación por anclas.
 * La estructura y los textos vienen de la especificación de marca; la
 * composición es nuestra, y esa distinción fue deliberada.
 *
 * POR QUÉ NO SE COPIÓ LA MAQUETACIÓN DE LA VERSIÓN DE LOVABLE
 *
 * Aquella resuelve las once secciones con la misma receta: antetítulo, titular,
 * párrafo y una rejilla de tarjetas redondeadas. Ocho rejillas de tarjetas
 * seguidas. Funciona, y se lee como una plantilla — que es exactamente lo que
 * el propio encargo de Emmy pedía evitar («minimalista, editorial, mucho
 * espacio en blanco, evitar completamente el look corporativo»).
 *
 * Aquí gobierna la misma regla que el resto del proyecto: **dos secciones
 * seguidas no comparten composición.** Los tres pilares son una lista
 * numerada, no tres tarjetas. El recorrido son cifras grandes. Los espacios
 * son una lista con reglas finas. Solo «For Brands» usa tarjetas, y por eso
 * ahí sí destacan.
 *
 * EL GRADIENTE, CON CUENTAGOTAS
 *
 * Aparece cuatro veces en toda la página: el botón principal, la banda «Bring
 * Sun-i», el círculo del manifiesto y los huecos de fotografía. Su propia
 * especificación dice «uso selectivo»; ponerlo en cada tarjeta es lo que hace
 * que un gradiente bonito acabe pareciendo barato.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: SEO.titulo,
  description: SEO.descripcion,
};

const ICONOS = {
  ShoppingBag, Droplets, Zap, Target, Leaf, Sparkles, Brain, Flower2, Move, Dumbbell, Users,
  GraduationCap, Building2, Home, BedDouble, HeartPulse, Package, FlaskConical, Megaphone,
  Handshake, Compass, Smartphone, Heart,
} as const;

function Icono({ nombre, className = "" }: { nombre: string; className?: string }) {
  const C = ICONOS[nombre as keyof typeof ICONOS] ?? Sparkles;
  return <C aria-hidden size={20} strokeWidth={1.75} className={className} />;
}

/** Antetítulo. Coral oscurecido porque es texto pequeño y necesita 4.5:1. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.7rem] font-semibold tracking-[0.25em] text-coral-ink uppercase">{children}</p>;
}

export default function SunniHome() {
  return (
    <main>
      {/* ── 01 · HERO ─────────────────────────────────────────────────────
          Asimétrico: la tipografía manda a la izquierda y la fotografía entra
          por la derecha sin alinearse con ella. */}
      <section id="top" className="relative isolate overflow-clip pt-28 pb-16 sm:pt-32 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -right-32 -z-10 size-[34rem] rounded-pill opacity-25 blur-3xl"
          style={{ backgroundImage: "var(--gradient-sun)" }}
        />
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-[48px]">
            <div className="min-w-0 lg:col-span-7">
              <InViewReveal variant="lead">
                <span className="inline-flex items-center gap-2 rounded-pill border border-ink/10 bg-cream px-4 py-2 text-[0.7rem] font-semibold tracking-[0.2em] text-coral-ink uppercase">
                  <Sparkles aria-hidden size={13} strokeWidth={2} />
                  {HERO.badge}
                </span>

                <h1 className="mt-7 font-display text-[clamp(2.6rem,6.6vw,4.6rem)] leading-[1.02] font-bold tracking-[-0.03em] text-ink">
                  {HERO.titulo}{" "}
                  <span className="text-coral">{HERO.tituloAcento}</span>{" "}
                  {HERO.tituloFin}
                </h1>
              </InViewReveal>

              <InViewReveal delay={0.08}>
                <p className="mt-7 max-w-[52ch] text-lead text-gray">{HERO.texto}</p>
              </InViewReveal>

              <InViewReveal delay={0.14}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <SunniCTA variante="vending" flecha>
                    Bring Sun‑i to your space
                  </SunniCTA>
                  <a
                    href="#about"
                    className="press inline-flex min-h-12 items-center rounded-pill border border-coral/45 px-7 font-display text-small font-semibold text-coral-ink transition-colors hover:border-coral hover:bg-coral/6"
                  >
                    Discover Sun‑i
                  </a>
                </div>
              </InViewReveal>

              <InViewReveal delay={0.2}>
                <ul className="mt-9 flex flex-wrap gap-2">
                  {HERO.pills.map((p) => (
                    <li
                      key={p}
                      className="rounded-pill border border-ink/10 px-4 py-1.5 text-small text-gray transition-colors hover:border-coral/45 hover:text-coral-ink"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </InViewReveal>
            </div>

            <InViewReveal variant="media" delay={0.1} className="min-w-0 lg:col-span-5">
              <div className="relative">
                <HuecoDeFoto nota="Fotografía de portada" />
                {/* La tarjeta que nombra el vending sin dejar que se coma la
                    marca: es un touchpoint, no el producto entero. */}
                <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-xl border border-ink/8 bg-warm-white px-5 py-4 shadow-[0_18px_44px_-24px_rgba(232,78,50,0.35)] sm:-left-8">
                  <span aria-hidden className="size-9 shrink-0 rounded-pill" style={{ backgroundImage: "var(--gradient-sun)" }} />
                  <span>
                    <span className="block font-display text-small font-semibold text-ink">{HERO.tarjeta.titulo}</span>
                    <span className="block text-[0.78rem] text-gray">{HERO.tarjeta.texto}</span>
                  </span>
                </div>
              </div>
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/* ── 02 · MARQUEE ──────────────────────────────────────────────────
          Una banda fina. Rompe el ritmo entre el hero y el capítulo largo. */}
      <div className="overflow-clip border-y border-ink/8 bg-cream py-4">
        <div className="marquee-track flex w-max items-center gap-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((t, i) => (
            <span key={`${t}-${i}`} className="flex items-center gap-8 text-small text-gray">
              {t}
              <span aria-hidden className="size-1.5 rounded-pill" style={{ backgroundImage: "var(--gradient-sun)" }} />
            </span>
          ))}
        </div>
      </div>

      {/* ── 03 · ABOUT ────────────────────────────────────────────────────
          El statement suelto y a ancho casi completo; el apoyo, en columna
          estrecha. Manda la idea, no la rejilla. */}
      <section id="about" className="scroll-mt-24 py-20 sm:py-28 lg:py-36">
        <Container>
          <InViewReveal variant="lead">
            <Eyebrow>{ABOUT.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2.1rem,4.8vw,3.5rem)] leading-[1.05] font-bold tracking-[-0.025em] text-ink">
              {ABOUT.titulo} <span className="text-coral">{ABOUT.tituloAcento}</span>
            </h2>
          </InViewReveal>

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-[48px]">
            <InViewReveal delay={0.06} className="min-w-0 lg:col-span-6">
              <p className="max-w-[54ch] text-lead text-gray">{ABOUT.p1}</p>
              <p className="mt-5 max-w-[54ch] text-body text-gray">{ABOUT.p2}</p>
            </InViewReveal>

            <InViewReveal delay={0.12} className="min-w-0 lg:col-span-5 lg:col-start-8">
              <p className="font-display text-[clamp(1.3rem,2.4vw,1.9rem)] leading-[1.25] font-semibold text-coral">
                {ABOUT.cierre}
              </p>
            </InViewReveal>
          </div>

          {/*
            LOS TRES PILARES SON UNA LISTA, NO TRES TARJETAS.

            Tres tarjetas iguales en fila es la forma por defecto de esta
            sección en cualquier sitio, y aquí venían seguidas de otras seis
            rejillas. Como lista numerada con regla superior se leen igual de
            claro y no repiten la forma de nada más de la página.
          */}
          <ol className="mt-16 grid gap-px overflow-clip rounded-2xl border border-ink/10 bg-ink/10 sm:mt-20 md:grid-cols-3">
            {ABOUT.pilares.map((p, i) => (
              <li key={p.tag} className="bg-warm-white p-8">
                <InViewReveal delay={0.05 * i}>
                  <span className="font-display text-[0.7rem] font-semibold tracking-[0.22em] text-coral-ink uppercase">
                    {p.tag}
                  </span>
                  <h3 className="mt-3 font-display text-heading font-semibold text-ink">{p.titulo}</h3>
                  <p className="mt-2.5 text-small text-gray">{p.texto}</p>
                </InViewReveal>
              </li>
            ))}
          </ol>

          {/* El manifiesto: bloque de tinta con el círculo del gradiente. */}
          <InViewReveal delay={0.1}>
            <figure className="mt-14 grid gap-6 sm:mt-20 md:grid-cols-5 md:gap-8">
              <HuecoDeFoto proporcion="aspect-[4/3]" nota="Producto sobre superficie cálida" className="md:col-span-3" />
              <blockquote className="flex flex-col justify-between rounded-2xl bg-ink p-8 md:col-span-2">
                <span aria-hidden className="size-11 rounded-pill" style={{ backgroundImage: "var(--gradient-sun)" }} />
                <p className="mt-8 font-display text-[clamp(1.25rem,2.2vw,1.7rem)] leading-[1.25] font-semibold text-warm-white">
                  {ABOUT.manifiesto}
                </p>
                <figcaption className="mt-6 text-[0.7rem] tracking-[0.2em] text-warm-white/55 uppercase">
                  Manifiesto Sun‑i
                </figcaption>
              </blockquote>
            </figure>
          </InViewReveal>
        </Container>
      </section>

      {/* ── 04 · CÓMO FUNCIONA ────────────────────────────────────────────
          Fondo amanecer y cifras grandes: la única sección donde manda el
          número. */}
      <section id="how" className="scroll-mt-24 border-y border-ink/8 py-20 sm:py-28" style={{ backgroundImage: "var(--gradient-dawn)" }}>
        <Container>
          <InViewReveal variant="lead">
            <Eyebrow>{RECORRIDO.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
              {RECORRIDO.titulo}
            </h2>
            <p className="mt-5 max-w-[48ch] text-body text-gray">{RECORRIDO.intro}</p>
          </InViewReveal>

          <ol className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {RECORRIDO.pasos.map((p, i) => (
              <li key={p.n}>
                <InViewReveal delay={0.06 * i}>
                  <div className="border-t border-ink/15 pt-5">
                    <span className="font-display text-[2.6rem] leading-none font-bold tracking-[-0.04em] text-coral/35 tabular-nums">
                      {p.n}
                    </span>
                    <h3 className="mt-4 font-display text-heading font-semibold text-ink">{p.tag}</h3>
                    <p className="mt-2.5 max-w-[34ch] text-small text-gray">{p.texto}</p>
                  </div>
                </InViewReveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── 05 · VENDING ──────────────────────────────────────────────────
          Díptico invertido: la fotografía a la izquierda. Es la única sección
          que empieza por imagen. */}
      <section id="vending" className="scroll-mt-24 py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-[48px]">
            <InViewReveal variant="media" className="min-w-0 lg:col-span-5">
              <HuecoDeFoto nota="Unidad Sun‑i en su espacio" />
            </InViewReveal>

            <div className="min-w-0 lg:col-span-6 lg:col-start-7">
              <InViewReveal variant="lead">
                <Eyebrow>{VENDING.eyebrow}</Eyebrow>
                <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] font-bold tracking-[-0.025em] text-ink">
                  {VENDING.titulo}
                </h2>
              </InViewReveal>
              <InViewReveal delay={0.08}>
                <p className="mt-6 max-w-[50ch] text-body text-gray">{VENDING.texto}</p>
                <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
                  {VENDING.categorias.map((c) => (
                    <li key={c} className="text-[0.72rem] font-semibold tracking-[0.16em] text-gray uppercase">
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-8 font-display text-[clamp(1.3rem,2.4vw,1.8rem)] font-semibold text-coral">
                  {VENDING.frase}
                </p>
                <div className="mt-8">
                  <SunniCTA variante="vending" flecha>
                    {VENDING.cta}
                  </SunniCTA>
                </div>
              </InViewReveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ── 06 · INSIDE SUN-I ─────────────────────────────────────────────
          Rejilla compacta con regla, no tarjetas con borde: los moods son un
          índice, no seis productos. */}
      <section id="inside" className="scroll-mt-24 border-y border-ink/8 bg-cream py-20 sm:py-28">
        <Container>
          <InViewReveal variant="lead">
            <Eyebrow>{MOODS.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
              {MOODS.titulo}
            </h2>
            <p className="mt-5 max-w-[52ch] text-body text-gray">{MOODS.intro}</p>
          </InViewReveal>

          <ul className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {MOODS.items.map((m, i) => (
              <li key={m.nombre}>
                <InViewReveal delay={0.04 * i}>
                  <div className="flex gap-4 border-t border-ink/12 pt-5">
                    <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-pill bg-warm-white text-coral-ink">
                      <Icono nombre={m.icono} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-heading font-semibold text-ink">{m.nombre}</h3>
                      <p className="mt-1.5 text-small text-gray">{m.texto}</p>
                    </div>
                  </div>
                </InViewReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── 07 · EXPERIENCIAS ─────────────────────────────────────────────
          Lista editorial numerada + el puente al catálogo que ya existe. */}
      <section id="experiences" className="scroll-mt-24 py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-[48px]">
            <InViewReveal variant="lead" className="min-w-0 lg:col-span-5">
              <Eyebrow>{EXPERIENCIAS.eyebrow}</Eyebrow>
              <h2 className="mt-5 max-w-[14ch] font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.06] font-bold tracking-[-0.025em] text-ink">
                {EXPERIENCIAS.titulo}
              </h2>
              <p className="mt-6 max-w-[46ch] text-body text-gray">{EXPERIENCIAS.texto}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <SunniCTA variante="experiences" flecha>
                  {EXPERIENCIAS.cta}
                </SunniCTA>
              </div>
              {/*
                EL PUENTE AL CATÁLOGO.

                «Experiences» en la especificación es la oferta B2B: llevar
                sesiones a oficinas y escuelas. Pero el sitio ya tiene un
                catálogo de experiencias abiertas al público, con su alta desde
                el gestor y su formulario de solicitud. Son cosas distintas y
                las dos son verdad, así que esta sección nombra las dos en vez
                de fingir que la otra no existe.
              */}
              <p className="mt-6 text-small text-gray">
                ¿Buscas experiencias abiertas al público?{" "}
                <Link
                  href="/experiencias"
                  className="font-medium text-coral-ink underline decoration-coral/35 underline-offset-4 transition-colors hover:decoration-coral"
                >
                  Mira las que están publicadas
                </Link>
                .
              </p>
            </InViewReveal>

            <ol className="min-w-0 lg:col-span-6 lg:col-start-7">
              {EXPERIENCIAS.tipos.map((t, i) => (
                <li key={t.nombre} className="border-b border-ink/12 py-5 first:border-t">
                  <InViewReveal delay={0.05 * i}>
                    <div className="flex items-start gap-4">
                      <span className="mt-0.5 text-coral-ink">
                        <Icono nombre={t.icono} />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-display text-heading font-semibold text-ink">{t.nombre}</h3>
                        <p className="mt-1 max-w-[44ch] text-small text-gray">{t.texto}</p>
                      </div>
                    </div>
                  </InViewReveal>
                </li>
              ))}
            </ol>
          </div>

          <InViewReveal delay={0.1}>
            <div className="relative mt-14 overflow-clip rounded-2xl sm:mt-20">
              <HuecoDeFoto proporcion="aspect-[21/9]" nota="Sesión de bienestar en oficina" />
              <p className="absolute bottom-8 left-8 max-w-[22ch] font-display text-[clamp(1.2rem,2.6vw,2rem)] leading-[1.15] font-bold text-ink">
                {EXPERIENCIAS.frase}
              </p>
            </div>
          </InViewReveal>
        </Container>
      </section>

      {/* ── 08 · DÓNDE VIVE SUN-I ─────────────────────────────────────────
          Dos columnas de líneas finas. Ninguna caja. */}
      <section id="espacios" className="scroll-mt-24 border-y border-ink/8 py-20 sm:py-28" style={{ backgroundImage: "var(--gradient-dawn)" }}>
        <Container>
          <InViewReveal variant="lead">
            <Eyebrow>{ESPACIOS.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
              {ESPACIOS.titulo}
            </h2>
          </InViewReveal>

          <ul className="mt-12 grid gap-x-12 md:grid-cols-2">
            {ESPACIOS.items.map((e, i) => (
              <li key={e.nombre} className="border-b border-ink/12 py-5">
                <InViewReveal delay={0.04 * i}>
                  <div className="flex items-baseline justify-between gap-6">
                    <h3 className="flex items-center gap-3 font-display text-heading font-semibold text-ink">
                      <span className="text-coral-ink">
                        <Icono nombre={e.icono} />
                      </span>
                      {e.nombre}
                    </h3>
                  </div>
                  <p className="mt-2 max-w-[42ch] pl-9 text-small text-gray">{e.texto}</p>
                </InViewReveal>
              </li>
            ))}
          </ul>

          <InViewReveal delay={0.12}>
            <div className="mt-10">
              <SunniCTA variante="vending" tono="contorno" flecha>
                {ESPACIOS.cta}
              </SunniCTA>
            </div>
          </InViewReveal>
        </Container>
      </section>

      {/* ── 09 · PARA MARCAS ──────────────────────────────────────────────
          La ÚNICA rejilla de tarjetas de la página, y por eso funciona. */}
      <section id="brands" className="scroll-mt-24 py-20 sm:py-28 lg:py-36">
        <Container>
          <InViewReveal variant="lead">
            <Eyebrow>{MARCAS.eyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] font-bold tracking-[-0.025em] text-ink">
              {MARCAS.titulo}
            </h2>
            <p className="mt-5 max-w-[54ch] text-body text-gray">{MARCAS.texto}</p>
          </InViewReveal>

          <ul className="mt-14 grid gap-5 sm:grid-cols-2">
            {MARCAS.items.map((m, i) => (
              <li key={m.tag}>
                <InViewReveal delay={0.05 * i}>
                  <div className="group h-full rounded-2xl border border-ink/10 bg-cream p-7 transition-all duration-[var(--motion-enter)] ease-sunny hover:-translate-y-1 hover:border-coral/40 hover:shadow-[0_24px_60px_-30px_rgba(232,78,50,0.28)]">
                    <span className="flex size-11 items-center justify-center rounded-pill bg-warm-white text-coral-ink transition-colors">
                      <Icono nombre={m.icono} />
                    </span>
                    <h3 className="mt-5 font-display text-heading font-semibold text-ink">{m.tag}</h3>
                    <p className="mt-2.5 text-small text-gray">{m.texto}</p>
                  </div>
                </InViewReveal>
              </li>
            ))}
          </ul>

          <InViewReveal delay={0.14}>
            <div className="mt-10">
              <SunniCTA variante="brands" flecha>
                {MARCAS.cta}
              </SunniCTA>
            </div>
          </InViewReveal>
        </Container>
      </section>

      {/* ── 10 · BRING SUN-I ──────────────────────────────────────────────
          El único bloque con el gradiente a plena potencia. Es la conversión
          principal del sitio y el momento de máximo contraste. */}
      <section id="bring" className="scroll-mt-24 px-5 pb-20 sm:pb-28">
        <Container className="!px-0">
          <InViewReveal variant="lead">
            <div
              className="relative isolate overflow-clip rounded-3xl px-8 py-16 text-center sm:px-12 sm:py-20"
              style={{ backgroundImage: "var(--gradient-sun)" }}
            >
              <div aria-hidden className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-pill bg-warm-white/35 blur-3xl" />
              <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.03em] text-ink">
                {BRING.titulo}
              </h2>
              <p className="mx-auto mt-6 max-w-[56ch] text-body text-ink/75">{BRING.texto}</p>
              <div className="mt-9 flex justify-center">
                <SunniCTA variante="vending" tono="claro" flecha>
                  {BRING.cta}
                </SunniCTA>
              </div>
            </div>
          </InViewReveal>
        </Container>
      </section>

      {/* ── 11 · THE SUN-I EFFECT ─────────────────────────────────────────
          Sin métricas inventadas. Lo dice su propia especificación y es lo
          correcto: un número de impacto falso acaba citado en una junta. */}
      <section id="effect" className="scroll-mt-24 border-y border-ink/8 bg-cream py-20 sm:py-28">
        <Container>
          <InViewReveal variant="lead">
            <Eyebrow>{EFECTO.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
              {EFECTO.titulo}
            </h2>
            <p className="mt-5 max-w-[52ch] text-body text-gray">{EFECTO.texto}</p>
          </InViewReveal>

          <ul className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-3">
            {EFECTO.items.map((e, i) => (
              <li key={e.titulo}>
                <InViewReveal delay={0.05 * i}>
                  <div className="border-t border-ink/12 pt-5">
                    <h3 className="font-display text-heading font-semibold text-ink">{e.titulo}</h3>
                    <p className="mt-2 text-small text-gray">{e.texto}</p>
                    <p className="mt-4 text-[0.68rem] tracking-[0.2em] text-coral-ink/70 uppercase">Coming soon</p>
                  </div>
                </InViewReveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── 12 · CIERRE ───────────────────────────────────────────────────── */}
      <section className="bg-ink py-20 text-warm-white sm:py-28">
        <Container className="text-center">
          <InViewReveal variant="lead">
            <h2 className="mx-auto max-w-[16ch] font-display text-[clamp(2rem,4.8vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.03em]">
              A little more <span className="text-sun">Sun‑i</span> in your everyday.
            </h2>
          </InViewReveal>
          <InViewReveal delay={0.1}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <SunniCTA variante="vending" flecha>
                Bring Sun‑i to your space
              </SunniCTA>
              <SunniCTA variante="brands" tono="contorno" className="!border-warm-white/35 !text-warm-white hover:!border-warm-white hover:!bg-warm-white/10">
                Partner with Sun‑i
              </SunniCTA>
            </div>
          </InViewReveal>
        </Container>
      </section>
    </main>
  );
}
