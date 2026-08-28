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
import { ExperienciasDestacadas } from "@/components/lean/ExperienciasDestacadas";
import { HowItWorks } from "@/components/lean/HowItWorks";
import { getSiteSettings, getUpcomingExperiences } from "@/lib/sanity/queries";
import { antetituloDeLaLista, DEFAULT_SETTINGS, mezclarAjustes, whatsappLink } from "@/lib/lean-content";

/**
 * Portada del MVP lean — ocho capítulos.
 *
 * DEJÓ DE SER UNA PILA DE SECCIONES
 *
 * Antes era una lista de bloques con la misma receta cada vez: antetítulo,
 * titular, párrafo, y otra rejilla debajo. Funcionaba y se leía como una
 * plantilla, porque bajar por la página no cambiaba nada más que el texto.
 *
 * La regla que gobierna esta versión: **dos capítulos seguidos no comparten
 * composición.** Cambia el fondo, la alineación, la densidad, la escala y quién
 * manda dentro del bloque.
 *
 *   01 Manifiesto ....... carbón · centrado · pantalla completa · manda la tipografía
 *   02 Experiencias ..... marfil · asimétrico · manda la protagonista
 *   03 Qué es Sunny ..... blanco cálido · statement suelto + foto desplazada
 *   04 Cómo funciona .... marfil · recorrido vertical alternado · mandan los números
 *   05 Comunidad ........ carbón · columna estrecha · manda la frase
 *   06 Para negocios .... durazno · díptico · manda el statement de dos voces
 *   07 Cierre ........... amarillo · centrado · manda el color
 *   08 Preguntas ........ blanco cálido · denso · manda el texto pequeño
 *
 * El orden responde las preguntas según se hacen —qué es esto, qué hay ahora,
 * por qué existe, cómo le hago, con quién, y si tengo un espacio— y termina.
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

/**
 * El título y la descripción que salen en Google y al compartir el enlace.
 *
 * Se leen de Sanity porque son texto de marca, no contrato de producto: si
 * Emmy cambia cómo se describe Sunny, la vista previa de WhatsApp tiene que
 * cambiar con ella. Si no ha escrito nada, salen los de `DEFAULT_SETTINGS`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = mezclarAjustes(DEFAULT_SETTINGS, await getSiteSettings());
  return { title: s.seoTitle, description: s.seoDescription };
}

export default async function HomePage() {
  // Una sola llamada por dato y en paralelo. Las dos comparten caché con el
  // resto del sitio a través de sus etiquetas, así que abrir el catálogo
  // después no vuelve a pedir lo mismo.
  const [experiences, settings] = await Promise.all([getUpcomingExperiences(), getSiteSettings()]);

  const s = mezclarAjustes(DEFAULT_SETTINGS, settings);
  const destacadas = experiences.slice(0, 6);
  const hayContacto = Boolean(s.whatsapp?.trim() || s.instagramUrl?.trim() || s.contactEmail?.trim());

  return (
    <main>
      {/* ── 01 · MANIFIESTO ───────────────────────────────────────────────── */}
      <LeanHero
        eyebrow={s.heroEyebrow}
        title={s.heroTitle}
        titleAccent={s.heroTitleAccent}
        subtitle={s.heroSubtitle}
        experienceCount={experiences.filter((e) => e.status !== "sold_out").length}
        image={settings?.heroImage ?? null}
      />

      {/*
        ── 02 · EXPERIENCIAS ───────────────────────────────────────────────

        Va antes de explicar nada: primero se ve que hay algo que vale la pena,
        después se explica el mecanismo.

        La cabecera no repite la fórmula «antetítulo sobre titular»: el titular
        ocupa la izquierda y el contexto —«Esta semana» y el enlace al catálogo—
        se va al extremo derecho, a la altura de su línea base. Es una cabecera
        de dos extremos, y no vuelve a aparecer en toda la portada.
      */}
      <section className="py-24 sm:py-32 lg:py-44">
        <Container>
          <InViewReveal variant="lead">
            {/*
              LA COLUMNA VERTEBRAL.

              Título a la izquierda, entradilla al extremo derecho, y entre los
              dos una regla de un pixel que baja toda la altura del bloque. No
              es decoración: es lo que relaciona dos textos separados por medio
              contenedor. Sin ella serían dos párrafos sueltos en la misma fila.

              La entradilla es el subtítulo que antes vivía en el hero. Al
              mudarse aquí, la frase que explica Sunny **cruza el pliegue**:
              empieza en carbón bajo el manifiesto y termina en marfil. El hero
              se queda con una sola cosa que decir y esta sección deja de
              abrirse con la fórmula antetítulo-sobre-titular.
            */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-[48px]">
              <h2 className="max-w-[18ch] text-title text-balance lg:col-span-6">
                {s.bloqueExperiencias.titulo}
              </h2>

              {/*
                La entradilla volvió al hero.

                Vivió aquí mientras el hero no tenía fotografía: era la frase
                que cruzaba el pliegue. Con la foto de fondo, el hero recuperó
                sitio para su propia nota y tenerla en los dos lados sería
                decir lo mismo dos veces seguidas.

                La regla vertical se queda: sigue relacionando el titular con
                el contexto del otro extremo, que es su trabajo.
              */}
              <div className="mt-10 lg:col-span-5 lg:col-start-8 lg:mt-0 lg:border-l lg:border-carbon/15 lg:pl-10">
                <div>
                  <p className="text-small tracking-[0.14em] text-gray uppercase">
                    {antetituloDeLaLista(experiences)}
                  </p>
                  {/*
                    La nota que dice quién publica esto.

                    Es el único sitio de la portada donde se nombra la
                    curaduría antes del capítulo que la explica, y va aquí a
                    propósito: encima de la lista, que es donde alguien se
                    pregunta de dónde salen estas experiencias.
                  */}
                  {s.bloqueExperiencias.nota && (
                    <p className="mt-3 max-w-[34ch] text-small text-gray">{s.bloqueExperiencias.nota}</p>
                  )}
                  {experiences.length > destacadas.length && (
                    <Link
                      href="/experiencias"
                      className="mt-2 inline-flex min-h-11 items-center text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
                    >
                      Ver las {experiences.length} experiencias
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </InViewReveal>

          {/* Aire de verdad entre la cabecera y el contenido: el vacío es parte
              de la composición, no relleno entre bloques. */}
          <div className="mt-16 lg:mt-28">
            <ExperienciasDestacadas experiences={destacadas} />
          </div>
        </Container>
      </section>
      {/* ── 03 · QUÉ ES SUNNY ─────────────────────────────────────────────── */}
      <section id="que-es-sunny" className="scroll-mt-24 bg-warm-white py-20 sm:py-28 lg:py-40">
        <Container>
          <WhatIsSunny bloque={s.bloqueSunny} />
        </Container>
      </section>

      {/* ── 04 · CÓMO FUNCIONA ────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24">
        <HowItWorks bloque={s.bloqueRecorrido} />
      </section>

      {/*
        ── 05 · COMUNIDAD ─────────────────────────────────────────────────

        El capítulo oscuro. Pone su propio fondo carbón: está escrito con texto
        en blanco cálido, y cuando el fondo lo decidía la portada acabó montado
        sobre `bg-warm-white`, o sea texto blanco sobre casi blanco.

        No se rediseñó. Es la sección que ya tenía la personalidad que el resto
        de la portada fue a buscar: el statement ES el elemento visual. Tocarla
        para que «combine» habría sido igualar hacia abajo.
      */}
      <section id="comunidad" className="scroll-mt-24">
        <CommunitySection bloque={s.bloqueComunidad} instagramUrl={s.instagramUrl} />
      </section>

      {/*
        ── 06 · PARA NEGOCIOS ─────────────────────────────────────────────

        Un díptico, no otra sección de conversión.

        Era titular, párrafo, botón y una lista de tres pasos dentro de una caja
        con borde: la misma receta que el resto de la página, con un rectángulo
        más. Ahora la propuesta se dice en dos voces —lo que tiene el negocio en
        Manrope, lo que pone Sunny en Newsreader— y ocupa la mitad izquierda a
        cuerpo de titular. Lo que pasa después baja a letra pequeña en la
        derecha, sin caja y sin borde: tres líneas separadas por reglas finas.

        Las tres líneas no prometen nada que el sistema no cumpla: llega la
        propuesta, hay una conversación, y publicar es una decisión posterior.
        Es exactamente lo que hace hoy el formulario.
      */}
      <section className="bg-orange/8 py-20 sm:py-28 lg:py-36">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-[48px]">
            <div className="min-w-0 lg:col-span-7">
              <InViewReveal variant="lead">
                <h2 className="max-w-[14ch] text-display text-balance">
                  {s.bloqueNegocios.titulo}
                  {s.bloqueNegocios.acento && (
                    <>
                      {" "}
                      <span className="font-serif font-normal text-orange-ink italic">
                        {s.bloqueNegocios.acento}
                      </span>
                    </>
                  )}
                </h2>
              </InViewReveal>

              <InViewReveal delay={0.08}>
                <p className="mt-8 max-w-[48ch] text-lead text-carbon/80">{s.bloqueNegocios.texto}</p>
              </InViewReveal>

              <InViewReveal delay={0.14}>
                {/*
                  DISCIPLINA DEL COLOR SATURADO.

                  El amarillo Sunny queda reservado a tres momentos de marca: la
                  frase destacada del manifiesto, la banda de la ruptura y el
                  cierre. Un botón relleno aquí lo convertía en color de
                  interfaz — cuatro amarillos en la misma página y ninguno
                  significando nada. La acción va en contorno: igual de clara,
                  sin gastar el color.
                */}
                <div className="mt-10">
                  <LinkButton href="/para-negocios" size="lg" variant="secondary" arrow>
                    Cuéntanos de tu espacio
                  </LinkButton>
                </div>
              </InViewReveal>
            </div>

            <InViewReveal delay={0.12} className="min-w-0 lg:col-span-4 lg:col-start-9">
              <ol className="lg:pt-3">
                {[
                  ["Nos escribes", "Cuéntanos qué haces y dónde. Sin formularios largos."],
                  ["Platicamos", "Te contactamos para entender tu espacio y ver si encaja."],
                  ["Lo armamos juntos", "Si tiene sentido para los dos, definimos fecha y cupo."],
                ].map(([titulo, texto], i) => (
                  <li key={titulo} className="border-t border-carbon/15 py-5 last:pb-0">
                    <span
                      aria-hidden
                      className="font-serif text-small text-orange-ink/70 tabular-nums"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-1.5 text-heading">{titulo}</p>
                    <p className="mt-1.5 max-w-[38ch] text-small text-gray">{texto}</p>
                  </li>
                ))}
              </ol>
            </InViewReveal>
          </div>
        </Container>
      </section>

      {/*
        ── 07 · CIERRE ────────────────────────────────────────────────────

        La portada no terminaba: se quedaba sin secciones. Después de las
        preguntas frecuentes venía un bloque de contacto que solo aparece si hay
        algún canal en Sanity —hoy no lo hay—, así que la última pantalla real
        era una lista de dudas. Un cierre es lo que le dice a alguien que llegó
        al final y qué puede hacer con eso.

        Es el único bloque de amarillo pleno del sitio y el segundo momento
        centrado, a mucha distancia del hero. Si hay canales de contacto, viven
        aquí en vez de en una sección propia: son parte del cierre, no un
        capítulo.
      */}
      <section className="bg-sunny py-20 text-carbon sm:py-28">
        <Container className="text-center">
          <InViewReveal variant="lead">
            {/* Las dos voces en dos líneas, igual que en el hero: en línea
                corrida la «Y» quedaba huérfana al final del renglón y el giro
                se leía como un tropiezo en vez de como una segunda frase. */}
            <p className="manifiesto mx-auto max-w-[14ch]">
              <span className="block">{s.bloqueCierre.titulo}</span>
              {s.bloqueCierre.acento && (
                <span className="manifiesto__acento mt-1.5 block font-serif">{s.bloqueCierre.acento}</span>
              )}
            </p>
          </InViewReveal>

          <InViewReveal delay={0.1}>
            <div className="mt-10 flex justify-center sm:mt-12">
              <LinkButton href="/experiencias" size="lg" variant="secondary" arrow>
                Ver experiencias
              </LinkButton>
            </div>
          </InViewReveal>

          {hayContacto && (
            <InViewReveal delay={0.16}>
              <div className="mt-12 border-t border-carbon/20 pt-8">
                <p className="text-small text-carbon/70">
                  Para dudas, propuestas o para contarnos qué experiencia te gustaría ver.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                  {s.whatsapp && <ContactLink href={whatsappLink(s.whatsapp)} icon={MessageCircle} label="WhatsApp" />}
                  {s.instagramUrl && <ContactLink href={s.instagramUrl} icon={AtSign} label="Instagram" />}
                  {s.contactEmail && (
                    <ContactLink href={`mailto:${s.contactEmail}`} icon={Mail} label={s.contactEmail} />
                  )}
                </div>
              </div>
            </InViewReveal>
          )}
        </Container>
      </section>

      {/*
        ── 08 · PREGUNTAS FRECUENTES ──────────────────────────────────────

        Información secundaria y densa, en una columna estrecha: después del
        amarillo, el descanso. Editable desde Sanity.
      */}
      {s.faq.length > 0 && (
        <section className="bg-warm-white py-16 sm:py-20">
          <Container className="max-w-3xl">
            <InViewReveal>
              <p className="eyebrow">Preguntas frecuentes</p>
              <h2 className="mt-3 text-subtitle">Lo que casi siempre nos preguntan.</h2>
            </InViewReveal>
            <div className="mt-8">
              <FaqList items={s.faq.map((item) => ({ q: item.question, a: item.answer }))} />
            </div>
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
      className="inline-flex min-h-11 items-center gap-2 text-small font-medium text-carbon underline decoration-carbon/40 underline-offset-4 transition-colors hover:decoration-carbon"
    >
      <Icon aria-hidden size={16} strokeWidth={1.75} />
      {label}
    </Link>
  );
}
