import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { es } from "date-fns/locale";
import { TIMEZONE } from "@/lib/constants";
import { ExperienceGrid } from "@/components/lean/ExperienceGrid";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { formatTime } from "@/lib/dates";
import { blurProps, sanityImageUrl } from "@/lib/sanity/image";
import type { ExperienceCardData } from "@/lib/sanity/types";

/**
 * Capítulo 02 — lo que está pasando ahora.
 *
 * LA RANURA DE FOTOGRAFÍA
 *
 * Aquí estaba el problema de fondo del sitio: donde va una foto había un
 * degradado naranja. Un degradado no es una imagen que falta, es una imagen
 * fingida, y repetida cuatro veces se nota.
 *
 * La ranura ahora es un campo plano de carbón al 5% con la proporción que
 * tendrá la fotografía real. Mientras no la haya, **la fecha ocupa ese sitio en
 * Newsreader a cuerpo grande**: no es un relleno esperando algo, es una
 * portada tipográfica: dice lo único que de verdad importa saber de una
 * experiencia antes de abrirla. El día que Emmy suba la foto entra en el mismo
 * hueco, con la misma proporción, y la fecha baja al pie. No hay que rehacer
 * la sección.
 *
 * LA JERARQUÍA ES LA INFORMACIÓN
 *
 * Tres rectángulos iguales dicen que las tres cosas pesan lo mismo, y en un
 * catálogo semanal eso es falso: hay una que va primero. La más próxima ocupa
 * siete columnas; las siguientes bajan a una lista de reglas finas donde la
 * fecha vuelve a hacer de grafismo, a un cuerpo mucho menor. Ninguna caja,
 * ningún borde alrededor de nada.
 *
 * EN TELÉFONO
 *
 * Se mantiene la cinta horizontal con sus indicadores, que ya estaba resuelta y
 * probada. Solo una de las dos composiciones existe a la vez —la otra va en
 * `display:none`, que también la esconde de los lectores de pantalla—, así que
 * nadie recorre los enlaces dos veces.
 */
function fecha(iso: string) {
  return {
    dia: formatInTimeZone(iso, TIMEZONE, "d", { locale: es }),
    mes: formatInTimeZone(iso, TIMEZONE, "MMMM", { locale: es }),
    mesCorto: formatInTimeZone(iso, TIMEZONE, "MMM", { locale: es }),
  };
}

export function ExperienciasDestacadas({ experiences }: { experiences: ExperienceCardData[] }) {
  if (experiences.length === 0) {
    return <ExperienceGrid experiences={experiences} />;
  }

  const [protagonista, ...resto] = experiences;
  const f = fecha(protagonista.startDateTime);

  return (
    <>
      <div className="lg:hidden">
        <ExperienceGrid experiences={experiences} />
      </div>

      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-x-[48px]">
        {/* ── La protagonista ────────────────────────────────────────────── */}
        <div className="lg:col-span-7">
          <InViewReveal variant="media">
            <Link href={`/experiencias/${protagonista.slug}`} className="group block">
              <figure>
                <div className="relative aspect-[16/10] w-full overflow-clip bg-carbon/[0.055]">
                  {protagonista.image ? (
                    <Image
                      src={sanityImageUrl(protagonista.image, 1200)}
                      alt={protagonista.image.alt}
                      fill
                      sizes="(min-width: 1024px) 58vw, 100vw"
                      className="parallax object-cover"
                      {...blurProps(protagonista.image)}
                    />
                  ) : (
                    /* Sin fotografía, la fecha es la portada. Ver la nota de
                       arriba: es una decisión, no un hueco esperando. */
                    <div className="absolute inset-0 flex items-end p-8">
                      <p className="font-serif text-carbon/25">
                        <span className="block text-[clamp(4rem,7vw,6.5rem)] leading-[0.85] tabular-nums">
                          {f.dia}
                        </span>
                        <span className="mt-2 block text-[clamp(1.25rem,2vw,1.75rem)] leading-none italic">
                          {f.mes}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <figcaption className="mt-6 border-t border-carbon/15 pt-5">
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <h3 className="max-w-[20ch] text-subtitle text-balance transition-colors group-hover:text-orange-ink">
                        {protagonista.title}
                      </h3>
                      {protagonista.hostName && (
                        <p className="mt-1.5 font-serif text-body-l text-orange-ink italic">{protagonista.hostName}</p>
                      )}
                    </div>
                    <ArrowUpRight
                      aria-hidden
                      size={22}
                      strokeWidth={1.25}
                      className="mt-1 shrink-0 text-carbon/30 transition-[transform,color] duration-[var(--motion-nudge)] ease-sunny group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-carbon"
                    />
                  </div>
                  <p className="mt-3 text-small text-gray">
                    {f.dia} de {f.mes} · {formatTime(protagonista.startDateTime)} · {protagonista.locationName}
                    {protagonista.status === "sold_out" && <span className="text-carbon/70"> · Agotada</span>}
                  </p>
                </figcaption>
              </figure>
            </Link>
          </InViewReveal>
        </div>

        {/* ── Las siguientes ─────────────────────────────────────────────── */}
        {resto.length > 0 && (
          <div className="lg:col-span-4 lg:col-start-9">
            <ul>
              {resto.map((experiencia, i) => {
                const g = fecha(experiencia.startDateTime);
                return (
                  <li key={experiencia._id}>
                    <InViewReveal delay={0.06 + i * 0.06}>
                      <Link
                        href={`/experiencias/${experiencia.slug}`}
                        className="group flex items-baseline gap-5 border-b border-carbon/15 py-6 first:border-t"
                      >
                        <span aria-hidden className="w-[4.75rem] shrink-0 font-serif whitespace-nowrap text-carbon/45">
                          <span className="text-2xl leading-none tabular-nums">{g.dia}</span>
                          <span className="ml-1 text-small lowercase italic">{g.mesCorto}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-heading text-balance transition-colors group-hover:text-orange-ink">
                            {experiencia.title}
                          </span>
                          <span className="mt-1.5 block text-small text-gray">
                            {formatTime(experiencia.startDateTime)} · {experiencia.locationName}
                            {experiencia.status === "sold_out" && <span className="text-carbon/70"> · Agotada</span>}
                          </span>
                        </span>
                      </Link>
                    </InViewReveal>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
