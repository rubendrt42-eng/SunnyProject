import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BedDouble, Building2, Droplets, Dumbbell, GraduationCap, HeartPulse,
  Home, Leaf, ShoppingBag, Sparkles, Target, Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { SunniCTA } from "@/components/lean/SunniCTA";
import { HuecoDeFoto } from "@/components/sunni/HuecoDeFoto";
import { CIERRE, ESPACIOS, EXPERIENCIAS, HERO, MARCAS, QUE_HACEMOS, SEO, VENDING } from "@/lib/sunni-content";

/**
 * LA PORTADA DE SUN-I PROJECT®.
 *
 * SIETE SECCIONES, NO DOCE
 *
 * La versión anterior explicaba la filosofía de la marca antes que el
 * producto: manifiesto, tres pilares, un recorrido de cuatro pasos y una
 * promesa de métricas futuras. Quien entraba —el dueño de un gym, una
 * universidad, una oficina— tenía que leer todo eso antes de entender qué se
 * le estaba ofreciendo.
 *
 * El orden ahora responde las preguntas según se hacen:
 *
 *   01 Hero            ¿qué es esto?
 *   02 Qué hacemos     ¿qué hacen?            ← las dos líneas, lado a lado
 *   03 Vending         ¿qué implica?
 *   04 Experiences     ¿qué implica?
 *   05 Dónde vive      ¿para quién es?        ← «esto podría estar en mi espacio»
 *   06 Para marcas     otra puerta, pequeña
 *   07 Cierre          ¿qué hago ahora?
 *
 * LA ARQUITECTURA DICE LO QUE EL COPY REPETÍA
 *
 * Antes se aclaraba cuatro veces que el vending no es toda la marca. Ahora la
 * sección 02 enseña las dos formas una al lado de la otra, del mismo tamaño y
 * con el mismo peso, y eso lo dice solo. Queda una aclaración de una línea
 * dentro de Vending, y basta.
 *
 * SIGUE VIGENTE: dos secciones seguidas no comparten composición, y el
 * gradiente aparece con cuentagotas. Es lo que impide que se lea como
 * plantilla.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: SEO.titulo,
  description: SEO.descripcion,
};

const ICONOS = {
  Droplets, Zap, Target, Leaf, ShoppingBag, Sparkles,
  Dumbbell, GraduationCap, Building2, Home, BedDouble, HeartPulse,
} as const;

function Icono({ nombre }: { nombre: string }) {
  const C = ICONOS[nombre as keyof typeof ICONOS] ?? Sparkles;
  return <C aria-hidden size={20} strokeWidth={1.75} />;
}

/** Antetítulo. Coral oscurecido porque es texto pequeño y necesita 4.5:1. */
function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-3">
      <span aria-hidden className="h-[3px] w-10 shrink-0 rounded-pill" style={{ backgroundImage: "var(--gradient-sun)" }} />
      <span className="text-[0.7rem] font-semibold tracking-[0.25em] text-coral-ink uppercase">{children}</span>
    </span>
  );
}

export default function SunniHome() {
  return (
    <main>
      {/* ── 01 · HERO ─────────────────────────────────────────────────────
          Una frase para decir qué es Sun-i. Se fueron las etiquetas de mood:
          ahora viven dentro de Vending, donde explican el producto en vez de
          decorar. */}
      <section id="top" className="pt-28 pb-16 sm:pt-32 sm:pb-24">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-[48px]">
            <div className="min-w-0 lg:col-span-7">
              <InViewReveal variant="lead">
                <Rotulo>{HERO.badge}</Rotulo>
                <h1 className="mt-7 font-display text-[clamp(2.6rem,6.6vw,4.6rem)] leading-[1.02] font-bold tracking-[-0.03em] text-ink">
                  {HERO.titulo} <span className="text-coral">{HERO.tituloAcento}</span> {HERO.tituloFin}
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
                    href="#que-hacemos"
                    className="press inline-flex min-h-12 items-center rounded-pill border border-coral/45 px-7 font-display text-small font-semibold text-coral-ink transition-colors hover:border-coral hover:bg-coral/6"
                  >
                    Discover Sun‑i
                  </a>
                </div>
              </InViewReveal>
            </div>

            <InViewReveal variant="media" delay={0.1} className="min-w-0 lg:col-span-5">
              <HuecoDeFoto nota="Fotografía de portada" />
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/* ── 02 · QUÉ HACEMOS ──────────────────────────────────────────────
          La sección que hace que alguien diga «ah, ya entendí».

          Dos bloques del MISMO tamaño y peso. Que estén a la par es lo que
          dice —sin repetirlo en el copy— que el vending no es la marca
          entera. */}
      <section id="que-hacemos" className="scroll-mt-24 border-y border-ink/8 bg-cream py-20 sm:py-28">
        <Container>
          <InViewReveal variant="lead">
            <Rotulo>{QUE_HACEMOS.eyebrow}</Rotulo>
            <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.9rem,4.2vw,3rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
              {QUE_HACEMOS.titulo}
            </h2>
          </InViewReveal>

          <div className="mt-12 grid gap-px overflow-clip rounded-2xl border border-ink/10 bg-ink/10 sm:mt-16 md:grid-cols-2">
            {QUE_HACEMOS.bloques.map((b, i) => (
              <InViewReveal key={b.rotulo} delay={0.06 * i} className="bg-warm-white">
                <div className="flex h-full flex-col p-8 sm:p-10">
                  <span className="font-display text-[0.72rem] font-semibold tracking-[0.22em] text-coral-ink uppercase">
                    {b.rotulo}
                  </span>
                  <h3 className="mt-4 max-w-[16ch] font-display text-[clamp(1.35rem,2.4vw,1.9rem)] leading-[1.15] font-bold tracking-[-0.02em] text-ink">
                    {b.titulo}
                  </h3>
                  <p className="mt-4 max-w-[40ch] text-body text-gray">{b.texto}</p>
                  <a
                    href={b.ancla}
                    className="group mt-auto inline-flex min-h-11 items-center gap-2 pt-7 text-small font-semibold text-coral-ink"
                  >
                    {b.enlace}
                    <ArrowRight
                      aria-hidden
                      size={15}
                      strokeWidth={2}
                      className="transition-transform duration-[var(--motion-nudge)] ease-sunny group-hover:translate-x-1"
                    />
                  </a>
                </div>
              </InViewReveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── 03 · VENDING ──────────────────────────────────────────────────
          Díptico con la fotografía a la izquierda, y debajo los seis moods,
          que venían de la sección «Inside Sun-i». Se mudaron aquí porque
          explican el producto: su sitio es dentro del producto. */}
      <section id="vending" className="scroll-mt-24 py-20 sm:py-28 lg:py-32">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-[48px]">
            <InViewReveal variant="media" className="min-w-0 lg:col-span-5">
              <HuecoDeFoto nota="Unidad Sun‑i en su espacio" />
            </InViewReveal>

            <div className="min-w-0 lg:col-span-6 lg:col-start-7">
              <InViewReveal variant="lead">
                <Rotulo>{VENDING.eyebrow}</Rotulo>
                <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(1.8rem,3.8vw,2.7rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
                  {VENDING.titulo}
                </h2>
              </InViewReveal>
              <InViewReveal delay={0.08}>
                <p className="mt-6 max-w-[48ch] text-body text-gray">{VENDING.texto}</p>
                <p className="mt-4 max-w-[44ch] text-small text-gray/85">{VENDING.nota}</p>
                <p className="mt-7 font-display text-[clamp(1.25rem,2.2vw,1.7rem)] font-semibold text-coral">
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

          {/* Los moods. Rejilla compacta con regla superior — ni tarjetas ni
              cajas: es un índice de lo que hay dentro. */}
          <div className="mt-16 sm:mt-20">
            <InViewReveal>
              <h3 className="text-[0.72rem] font-semibold tracking-[0.22em] text-gray uppercase">
                {VENDING.moodsTitulo}
              </h3>
            </InViewReveal>
            <ul className="mt-7 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {VENDING.moods.map((m, i) => (
                <li key={m.nombre}>
                  <InViewReveal delay={0.04 * i}>
                    <div className="flex gap-4 border-t border-ink/12 pt-5">
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-pill bg-cream text-coral-ink">
                        <Icono nombre={m.icono} />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-display text-heading font-semibold text-ink">{m.nombre}</h4>
                        <p className="mt-1.5 text-small text-gray">{m.texto}</p>
                      </div>
                    </div>
                  </InViewReveal>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* ── 04 · EXPERIENCES ──────────────────────────────────────────────
          Texto a la izquierda, tipos a la derecha en lista con reglas. No
          repite la composición del bloque anterior. */}
      <section id="experiences" className="scroll-mt-24 border-y border-ink/8 py-20 sm:py-28" style={{ backgroundImage: "var(--gradient-dawn)" }}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-[48px]">
            <InViewReveal variant="lead" className="min-w-0 lg:col-span-6">
              <Rotulo>{EXPERIENCIAS.eyebrow}</Rotulo>
              <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(1.8rem,3.8vw,2.7rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
                {EXPERIENCIAS.titulo}
              </h2>
              <p className="mt-6 max-w-[46ch] text-body text-gray">{EXPERIENCIAS.texto}</p>
              <p className="mt-5 text-small font-medium text-ink/70">{EXPERIENCIAS.espacios}</p>
              <div className="mt-8">
                <SunniCTA variante="experiences" flecha>
                  {EXPERIENCIAS.cta}
                </SunniCTA>
              </div>
              {/*
                AQUÍ HABÍA UN ENLACE AL CATÁLOGO DE EXPERIENCIAS ABIERTAS.

                Se retira con el catálogo: su pestaña en la hoja de cálculo ya
                no existe, así que el formulario de solicitud no tendría dónde
                escribir. Enlazar a una página cuyo formulario falla es peor
                que no enlazarla.
              */}
            </InViewReveal>

            <InViewReveal delay={0.08} className="min-w-0 lg:col-span-5 lg:col-start-8">
              <ul>
                {EXPERIENCIAS.tipos.map((t) => (
                  <li
                    key={t}
                    className="border-b border-ink/12 py-4 font-display text-heading font-semibold text-ink first:border-t"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/* ── 05 · DÓNDE VIVE SUN-I ─────────────────────────────────────────
          Sin párrafo. Quien llega aquí busca reconocerse en un renglón. */}
      <section id="espacios" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <InViewReveal variant="lead">
            <Rotulo>{ESPACIOS.eyebrow}</Rotulo>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.8rem,3.8vw,2.7rem)] leading-[1.08] font-bold tracking-[-0.025em] text-ink">
              {ESPACIOS.titulo}
            </h2>
          </InViewReveal>

          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            {ESPACIOS.items.map((e, i) => (
              <li key={e.nombre} className="border-b border-ink/12 py-5">
                <InViewReveal delay={0.04 * i}>
                  <h3 className="flex items-center gap-3 font-display text-heading font-semibold text-ink">
                    <span className="text-coral-ink">
                      <Icono nombre={e.icono} />
                    </span>
                    {e.nombre}
                  </h3>
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

      {/* ── 06 · PARA MARCAS ──────────────────────────────────────────────
          Pequeña a propósito: una tercera puerta, no un tercer negocio. Una
          sola fila, sin tarjetas, sin beneficios inventados. */}
      <section id="brands" className="scroll-mt-24 border-y border-ink/8 bg-cream py-16 sm:py-20">
        <Container>
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-x-[48px]">
            <InViewReveal variant="lead" className="min-w-0 lg:col-span-6">
              <Rotulo>{MARCAS.eyebrow}</Rotulo>
              <h2 className="mt-5 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.1] font-bold tracking-[-0.025em] text-ink">
                {MARCAS.titulo}
              </h2>
              <p className="mt-4 max-w-[46ch] text-body text-gray">{MARCAS.texto}</p>
            </InViewReveal>

            <InViewReveal delay={0.08} className="min-w-0 lg:col-span-5 lg:col-start-8">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {MARCAS.formas.map((f) => (
                  <li key={f} className="text-small font-medium text-ink/75">
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <SunniCTA variante="brands" tono="contorno" flecha>
                  {MARCAS.cta}
                </SunniCTA>
              </div>
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/* ── 07 · CIERRE ───────────────────────────────────────────────────
          Absorbe el bloque «Bring Sun-i», que era una sección aparte
          diciendo lo mismo. Un solo momento de máximo contraste en toda la
          página. */}
      <section id="bring" className="scroll-mt-24 px-5 py-20 sm:py-28">
        <Container className="!px-0">
          <InViewReveal variant="lead">
            <div
              className="relative isolate overflow-clip rounded-3xl px-8 py-16 text-center sm:px-12 sm:py-20"
              style={{ backgroundImage: "var(--gradient-sun)" }}
            >
              <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2rem,4.8vw,3.2rem)] leading-[1.05] font-bold tracking-[-0.03em] text-ink">
                {CIERRE.titulo}
              </h2>
              <p className="mx-auto mt-6 max-w-[50ch] text-body text-ink/75">{CIERRE.texto}</p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <SunniCTA variante="vending" tono="claro" flecha>
                  {CIERRE.cta}
                </SunniCTA>
                <SunniCTA
                  variante="brands"
                  tono="contorno"
                  className="!border-ink/30 !text-ink hover:!border-ink/60 hover:!bg-ink/5"
                >
                  {CIERRE.ctaMarcas}
                </SunniCTA>
              </div>
              <p className="mt-7 text-[0.75rem] tracking-[0.1em] text-ink/55">{CIERRE.condiciones}</p>
            </div>
          </InViewReveal>
        </Container>
      </section>
    </main>
  );
}
