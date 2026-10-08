import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, BedDouble, Building2, Droplets, Dumbbell, GraduationCap, HeartPulse,
  Home, Leaf, ShoppingBag, Sparkles, Target, Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { SunniCTA } from "@/components/lean/SunniCTA";
import { Foto } from "@/components/sunni/Foto";
import { Personaje } from "@/components/sunni/Personaje";
import { interfazConSanity } from "@/lib/sunni-interfaz";
import { portadaConSanity, SEO } from "@/lib/sunni-content";
import { getSiteSettings } from "@/lib/sanity/queries";

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

export default async function SunniHome() {
  /*
    Los textos vienen de Sanity y caen en los de `lib/sunni-content.ts` campo
    por campo. Emmy puede reescribir un titular sin tocar su párrafo, y vaciar
    un campo devuelve el texto de siempre en vez de dejar un hueco.
  */
  const ajustes = await getSiteSettings();
  const { hero: HERO, queHacemos: QUE_HACEMOS, vending: VENDING, experiencias: EXPERIENCIAS,
          espacios: ESPACIOS, marcas: MARCAS, cierre: CIERRE } = portadaConSanity(ajustes?.portada);
  // Los dos botones de la primera pantalla estaban escritos dentro del JSX,
  // así que no se podían cambiar desde Sanity. Ahora sí.
  const { heroBotones } = interfazConSanity(ajustes?.interfaz);

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
                <h1 className="mt-7 font-display text-[clamp(2.9rem,7.4vw,5.4rem)] leading-[0.98] font-bold tracking-[-0.035em] text-ink">
                  {HERO.titulo} <span className="text-coral">{HERO.tituloAcento}</span> {HERO.tituloFin}
                </h1>
              </InViewReveal>

              <InViewReveal delay={0.08}>
                <p className="mt-7 max-w-[52ch] text-lead text-gray">{HERO.texto}</p>
              </InViewReveal>

              <InViewReveal delay={0.14}>
                <div className="mt-9 flex flex-wrap items-center gap-3">
                  <SunniCTA variante="vending" flecha>
                    {heroBotones.principal}
                  </SunniCTA>
                  <a
                    href="#que-hacemos"
                    className="press inline-flex min-h-12 items-center rounded-pill border border-coral/45 px-7 font-display text-small font-semibold text-coral-ink transition-colors hover:border-coral hover:bg-coral/6"
                  >
                    {heroBotones.secundario}
                  </a>
                </div>
              </InViewReveal>
            </div>

            <InViewReveal variant="media" delay={0.1} className="min-w-0 lg:col-span-5">
              {/* `aspect-[3/4]` es la proporción exacta del archivo (960×1280),
                  así que `object-cover` no recorta un solo píxel: se ve el
                  encuadre completo que mandaste. */}
              <Foto cual="clase" proporcion="aspect-[3/4]" prioridad />
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
            {/*
              El titular está topado a 18 caracteres, así que en pantalla
              ancha la mitad derecha de esta fila quedaba vacía. El dibujo se
              pone ahí, a tamaño grande, en vez de pequeño encima del rótulo:
              ahí no llenaba nada y solo añadía un escalón más antes de leer.

              `flex-col-reverse` en móvil lo deja arriba del texto, que es el
              único sitio donde cabe a este tamaño sin estrujar el titular.
            */}
            <div className="flex flex-col-reverse items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="min-w-0">
                <Rotulo>{QUE_HACEMOS.eyebrow}</Rotulo>
                <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1.02] font-bold tracking-[-0.03em] text-ink">
                  {QUE_HACEMOS.titulo}
                </h2>
              </div>
              <Personaje
                cual="cara"
                movimiento="late"
                giro={-13}
                className="h-28 shrink-0 sm:h-36 md:h-44 lg:h-56"
              />
            </div>
          </InViewReveal>

          <div className="mt-12 grid gap-px overflow-clip rounded-2xl border border-ink/10 bg-ink/10 sm:mt-16 md:grid-cols-2">
            {QUE_HACEMOS.bloques.map((b, i) => (
              <InViewReveal key={b.rotulo} delay={0.12 * i} className="bg-warm-white">
                <div className="flex h-full flex-col p-8 sm:p-10">
                  <span className="font-display text-[0.72rem] font-semibold tracking-[0.22em] text-coral-ink uppercase">
                    {b.rotulo}
                  </span>
                  <h3 className="mt-4 max-w-[16ch] font-display text-[clamp(1.5rem,2.9vw,2.25rem)] leading-[1.1] font-bold tracking-[-0.025em] text-ink">
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
              <Foto cual="maquina" />
            </InViewReveal>

            <div className="min-w-0 lg:col-span-6 lg:col-start-7">
              <InViewReveal variant="lead">
                {/*
                  Aquí el dibujo va en la fila del rótulo, no al lado del
                  titular como en «What is Sun-i». Probado de la otra forma:
                  esta columna es más estrecha, y el dibujo le quitaba ancho
                  al titular hasta partirlo de tres líneas a cinco.

                  En la fila del rótulo no compite con nada —«SUN-I VENDING»
                  deja media fila libre— y el margen negativo lo sube al aire
                  que ya había sobre la sección, así que no empuja el titular
                  hacia abajo. Ladeado al otro lado que el anterior, para que
                  los dos juntos no se lean como una plantilla.
                */}
                <div className="flex items-start justify-between gap-6">
                  <Rotulo>{VENDING.eyebrow}</Rotulo>
                  <Personaje cual="sol" giro={15} className="-mt-4 h-24 shrink-0 sm:h-32 lg:h-40" />
                </div>
                <h2 className="mt-5 max-w-[18ch] font-display text-[clamp(2.05rem,4.5vw,3.4rem)] leading-[1.03] font-bold tracking-[-0.03em] text-ink">
                  {VENDING.titulo}
                </h2>
              </InViewReveal>
              <InViewReveal delay={0.08}>
                <p className="mt-6 max-w-[48ch] text-body text-gray">{VENDING.texto}</p>
                <p className="mt-4 max-w-[44ch] text-small text-gray/85">{VENDING.nota}</p>
                <p className="mt-7 font-display text-[clamp(1.45rem,2.7vw,2.1rem)] font-semibold text-coral">
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
                  <InViewReveal delay={0.07 * i}>
                    <div className="fila-viva flex gap-4 border-t border-ink/12 pt-5">
                      <span className="fila-viva__icono mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-pill bg-cream text-coral-ink">
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
              <h2 className="mt-5 max-w-[15ch] font-display text-[clamp(2.05rem,4.5vw,3.4rem)] leading-[1.03] font-bold tracking-[-0.03em] text-ink">
                {EXPERIENCIAS.titulo}
              </h2>
              <p className="mt-6 max-w-[46ch] text-body text-gray">{EXPERIENCIAS.texto}</p>
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

              {/*
                Esta fotografía ya estaba en el repositorio y no se usaba en
                ninguna parte. Es justo lo que describe la sección —un grupo
                en sesión— y cae donde la columna izquierda se quedaba vacía
                frente a las cinco filas de la derecha. Solo desde `lg`: en
                móvil las dos columnas van una tras otra y aquí no hay hueco
                que llenar, solo scroll de más.
              */}
              <Foto cual="circulo" proporcion="aspect-[16/10]" className="mt-12 hidden lg:block" />
            </InViewReveal>

            <InViewReveal delay={0.08} className="min-w-0 lg:col-span-5 lg:col-start-8">
              <ul>
                {EXPERIENCIAS.tipos.map((t, i) => (
                  <li key={t.nombre} className="border-b border-ink/12 first:border-t">
                    {/* Escalonadas: entran de arriba abajo, como se leen. Sin
                        esto las cinco aparecían a la vez y el bloque se movía
                        como una sola lámina. */}
                    <InViewReveal delay={0.07 * i}>
                      <div className="fila-viva py-5">
                        <h3 className="font-display text-heading font-semibold text-ink">{t.nombre}</h3>
                        <p className="mt-1.5 max-w-[42ch] text-small text-gray">{t.texto}</p>
                      </div>
                    </InViewReveal>
                  </li>
                ))}
              </ul>

              {/* La columna derecha terminaba en «Activaciones» mientras la
                  izquierda seguía con la fotografía: ese desnivel era hueco
                  en blanco. El dibujo lo ocupa y cierra la lista. */}
              <Personaje cual="cara" movimiento="late" giro={11} className="mt-10 ml-auto h-24 sm:h-32" />
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/* ── 05 · DÓNDE VIVE SUN-I ─────────────────────────────────────────
          Sin párrafo. Quien llega aquí busca reconocerse en un renglón. */}
      <section id="espacios" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          {/*
            Esta sección era la única sin una sola imagen: un titular y seis
            renglones sobre fondo crema. Entre la foto de la máquina amarilla
            y el panel amarillo del cierre quedaba un tramo largo de puro
            texto, y es justo donde la página pedía aire.

            El render entra aquí y no en Vending porque enseña la unidad en un
            parque: la sección habla de dónde cabe Sun-i, y esto es dónde cabe.
            A la izquierda el texto, a la derecha la unidad.
          */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-[48px]">
            <div className="min-w-0 lg:col-span-7">
          <InViewReveal variant="lead">
            <Rotulo>{ESPACIOS.eyebrow}</Rotulo>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(2.05rem,4.5vw,3.4rem)] leading-[1.03] font-bold tracking-[-0.03em] text-ink">
              {ESPACIOS.titulo}
            </h2>
          </InViewReveal>

          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {ESPACIOS.items.map((e, i) => (
              <li key={e.nombre} className="border-b border-ink/12 py-5">
                <InViewReveal delay={0.07 * i}>
                  <h3 className="fila-viva flex items-center gap-3 font-display text-heading font-semibold text-ink">
                    <span className="fila-viva__icono text-coral-ink">
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
            </div>

            <InViewReveal delay={0.08} className="min-w-0 lg:col-span-5">
              <Foto cual="parque" proporcion="aspect-[3/4]" />
            </InViewReveal>
          </div>
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
              {/* Se quedó atrás cuando subió la escala del resto de los
                  titulares: iba a 2.7rem contra los 3.4rem de las demás
                  secciones y se leía como un subtítulo, no como una sección.
                  Ahora usa la misma escala que Vending, Experiences y
                  Espacios. */}
              <h2 className="mt-5 font-display text-[clamp(2.05rem,4.5vw,3.4rem)] leading-[1.03] font-bold tracking-[-0.03em] text-ink">
                {MARCAS.titulo}
              </h2>
              <p className="mt-4 max-w-[46ch] text-body text-gray">{MARCAS.texto}</p>
            </InViewReveal>

            <InViewReveal delay={0.08} className="min-w-0 lg:col-span-5 lg:col-start-8">
              {/* La lista de formas de colaborar son cuatro palabras sueltas
                  contra un titular de dos líneas: esta mitad quedaba casi
                  vacía. */}
              <Personaje cual="sol" giro={-16} className="mb-6 h-24 sm:h-32 lg:h-40" />
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {MARCAS.formas.map((f, i) => (
                  <li key={f}>
                    <InViewReveal delay={0.06 * i}>
                      <span className="block text-small font-medium text-ink/75">{f}</span>
                    </InViewReveal>
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
              {/* El sol corriendo, sobre el panel amarillo. Se sostiene por
                  el trazo negro del dibujo, no por el color: amarillo sobre
                  amarillo se perdería sin ese contorno. */}
              <Personaje cual="sol" giro={4} className="mx-auto mb-7 h-28 sm:h-36" />
              <h2 className="mx-auto max-w-[18ch] font-display text-[clamp(2.3rem,5.6vw,4rem)] leading-[1.0] font-bold tracking-[-0.035em] text-ink">
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
