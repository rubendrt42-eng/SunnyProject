import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { SpotRequestForm } from "@/components/lean/SpotRequestForm";
import { ShareExperience } from "@/components/lean/ShareExperience";
import { BrandCanvas } from "@/components/lean/BrandCanvas";
import { env } from "@/lib/env";
import { ExperienceViewTracker } from "@/components/lean/ExperienceViewTracker";
import { formatDateTime, formatTime, isPast } from "@/lib/dates";
import { blurProps, sanityImageUrl } from "@/lib/sanity/image";
import { getAllExperienceSlugs, getExperienceBySlug } from "@/lib/sanity/queries";

/**
 * 60 segundos. Tiene que ser un número literal: Next analiza esta
 * configuración de forma estática en el build y una constante importada no la
 * puede leer — falla con «Invalid segment configuration export». El mismo
 * valor vive nombrado en SANITY_REVALIDATE_SECONDS para las consultas.
 */
export const revalidate = 60;

/**
 * Se generan en el build las páginas de todas las experiencias, incluidas las
 * pasadas. Las que se creen después se generan a la primera visita y quedan
 * cacheadas — Next las añade sin necesidad de redesplegar.
 */
export async function generateStaticParams() {
  const slugs = await getAllExperienceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);
  if (!experience) return { title: "Experiencia no encontrada — The Sunny Project" };

  return {
    title: `${experience.title} — The Sunny Project`,
    description: experience.shortDescription,
    openGraph: {
      title: experience.title,
      description: experience.shortDescription,
      /**
       * Solo se declara `images` cuando hay fotografía real.
       *
       * Antes decía `: []`, y un array vacío es una imagen declarada: como los
       * metadatos de Next se combinan de forma superficial, este bloque
       * `openGraph` reemplaza entero el del layout raíz, así que el `[]` no
       * heredaba nada — dejaba la tarjeta de WhatsApp sin ninguna imagen.
       * Justo la página que el botón «Compartir» está hecho para mandar.
       *
       * Omitiéndolo, entra en su lugar `opengraph-image.tsx` de esta misma
       * carpeta, que dibuja una tarjeta con el título y la fecha.
       */
      ...(experience.image ? { images: [{ url: sanityImageUrl(experience.image, 1200) }] } : {}),
    },
  };
}

/**
 * La página de una experiencia.
 *
 * TRES ESTADOS, NO UNO
 *
 * 1. **Vigente y disponible** — se puede solicitar lugar.
 * 2. **Vigente y agotada** — se ve completa, con la insignia, y el formulario
 *    se sustituye por un aviso. No se deshabilita un botón: se explica.
 * 3. **Ya pasó** — la página sigue existiendo y lo dice. No devuelve 404
 *    porque el enlace pudo compartirse por WhatsApp y un 404 seco parece un
 *    sitio roto; decir «esta experiencia ya ocurrió» y ofrecer las vigentes es
 *    más útil.
 *
 * La expiración se calcula aquí y no en la consulta a propósito: la consulta
 * por dirección trae la experiencia siempre, y la página decide qué enseñar.
 */
export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);

  if (!experience) notFound();

  /**
   * Comparación de dos instantes absolutos: `endDateTime` viene de Sanity en
   * UTC y la hora actual también lo es. No hay conversión de zona horaria que
   * hacer aquí — la zona solo importa al FORMATEAR, y de eso se encarga
   * `lib/dates.ts`, que fija America/Monterrey.
   *
   * Se usa el ayudante `isPast` y no `Date.now()` suelto porque la regla
   * `react-hooks/purity` prohíbe llamar funciones impuras en el cuerpo de un
   * componente, y tiene razón: haría el render no idempotente. Aquí el valor
   * se recalcula en cada revalidación de la página, que es cada minuto, y eso
   * basta de sobra para una experiencia que dura horas.
   */
  const yaPaso = isPast(experience.endDateTime);
  const agotada = experience.status === "sold_out";
  const sePuedeSolicitar = !yaPaso && !agotada;

  return (
    <main className="pb-20">
      <ExperienceViewTracker title={experience.title} />

      {/*
        Cabecera a lo ancho.

        Cuando la experiencia no tiene fotografía —hoy, ninguna la tiene— esto
        dibujaba un rectángulo gris de más de seiscientos píxeles: lo primero
        que veía alguien al abrir una experiencia era un hueco del alto de media
        pantalla. Ahora, sin foto, la franja se reduce a un tercio y lleva el
        lienzo de marca, que ocupa el sitio con intención en vez de anunciar que
        algo falta.
      */}
      <div
        className={
          experience.image
            // `overflow-clip` y no `hidden`: `hidden` haría de esta caja un
            // contenedor de scroll y congelaría el `parallax` de la fotografía.
            ? "relative aspect-[4/3] w-full overflow-clip bg-carbon/5 sm:aspect-[16/9] lg:aspect-[21/9]"
            : "relative h-40 w-full overflow-clip sm:h-52 lg:h-60"
        }
      >
        {experience.image ? (
          <Image
            src={sanityImageUrl(experience.image, 1800)}
            alt={experience.image.alt}
            fill
            priority
            sizes="100vw"
            className="parallax object-cover"
            {...blurProps(experience.image)}
          />
        ) : (
          <BrandCanvas seed={experience.title} className="h-full w-full" />
        )}
      </div>

      {/*
        DOS COLUMNAS EN ESCRITORIO, UNA EN MÓVIL

        El formulario estaba al final, después de la descripción y los
        requisitos, en una sola columna. Quien ya había decidido que quería ir
        tenía que bajar la página entera para pedirlo — en la única página del
        sitio que existe para convertir.

        Ahora en escritorio vive en una columna propia que se queda fija
        mientras se lee lo demás. En móvil vuelve a ser una sola columna y el
        formulario va abajo: ahí una columna fija ocuparía media pantalla y
        estorbaría en vez de ayudar. Nada de formularios pegados en móvil.
      */}
      <Container>
        <Link
          href="/experiencias"
          className="mt-8 inline-flex items-center gap-1.5 text-small font-medium text-gray transition-colors hover:text-carbon"
        >
          <ArrowLeft aria-hidden size={15} strokeWidth={1.75} />
          Todas las experiencias
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {yaPaso ? (
                <Badge tone="neutral">Ya ocurrió</Badge>
              ) : agotada ? (
                <Badge tone="neutral">Agotada</Badge>
              ) : (
                <Badge tone="success">Disponible</Badge>
              )}
            </div>

            <h1 className="mt-3 text-title text-balance">{experience.title}</h1>
            <p className="mt-4 text-body-l text-gray">{experience.shortDescription}</p>

            <dl className="mt-8 grid grid-cols-1 gap-4 border-y border-carbon/10 py-6 sm:grid-cols-2">
              <Dato icon={CalendarDays} label="Cuándo" value={formatDateTime(experience.startDateTime)} />
              <Dato icon={Clock} label="Termina" value={formatTime(experience.endDateTime)} />
              <Dato icon={MapPin} label="Dónde" value={experience.locationName} detail={experience.address} />
              {experience.hostName && <Dato icon={User} label="Con" value={experience.hostName} />}
            </dl>

            <div className="mt-8">
              <h2 className="text-subtitle">Sobre esta experiencia</h2>
              <p className="mt-3 text-body whitespace-pre-line text-carbon/85">{experience.fullDescription}</p>
            </div>

            {experience.requirements.length > 0 && (
              <div className="mt-8">
                <h2 className="text-subtitle">Qué necesitas llevar</h2>
                <ul className="mt-3 space-y-2">
                  {experience.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-body text-carbon/85">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-orange" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Compartir. En Monterrey, para este público, WhatsApp es el canal
                de crecimiento — más que Instagram. Va después de leer de qué va
                la experiencia, que es cuando alguien decide que le sirve a otra
                persona. */}
            <div className="mt-10 border-t border-carbon/10 pt-6">
              <p className="text-small text-gray">¿Le va a alguien que conoces?</p>
              <div className="mt-3">
                <ShareExperience
                  title={experience.title}
                  fecha={formatDateTime(experience.startDateTime)}
                  url={`${env.siteUrl}/experiencias/${experience.slug}`}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div id="solicitar" className="scroll-mt-24 lg:sticky lg:top-24">
              {sePuedeSolicitar ? (
                <div className="rounded-xl border border-carbon/10 bg-warm-white p-6">
                  <h2 className="text-subtitle">Solicitar mi lugar</h2>
                  <p className="mt-2 mb-6 text-small text-gray">
                    Déjanos tus datos y revisamos la disponibilidad. Te confirmamos por WhatsApp.
                  </p>
                  <SpotRequestForm
                    experienceId={experience._id}
                    experienceName={experience.title}
                    experienceDate={formatDateTime(experience.startDateTime)}
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-carbon/10 bg-warm-white p-6 text-center">
                  <h2 className="text-subtitle">
                    {yaPaso ? "Esta experiencia ya ocurrió" : "Esta experiencia está agotada"}
                  </h2>
                  <p className="mx-auto mt-2 max-w-sm text-body text-gray">
                    {yaPaso
                      ? "Publicamos experiencias nuevas cada semana."
                      : "Se llenaron los lugares. Publicamos experiencias nuevas cada semana."}
                  </p>
                  <div className="mt-6">
                    {/* El texto cambia según por qué no se puede solicitar: quien
                        llega a una experiencia agotada busca otra parecida; quien
                        llega a una que ya pasó, por un enlace viejo, necesita saber
                        que hay cosas nuevas. */}
                    <LinkButton href="/experiencias" variant="secondary" arrow>
                      {yaPaso ? "Ver experiencias actuales" : "Ver otras experiencias"}
                    </LinkButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}

function Dato({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs tracking-wide text-gray uppercase">
        <Icon aria-hidden size={14} strokeWidth={1.75} />
        {label}
      </dt>
      <dd className="mt-1 text-body text-carbon">
        {value}
        {detail && <span className="block text-small text-gray">{detail}</span>}
      </dd>
    </div>
  );
}
