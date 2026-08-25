import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { EMMY_PHOTO } from "@/lib/media";

/**
 * Capítulo 03 — el propósito.
 *
 * QUÉ CAMBIÓ EN LA COMPOSICIÓN
 *
 * Era texto a la izquierda y fotografía a la derecha, las dos columnas del
 * mismo alto y centradas entre sí: la composición por defecto de cualquier
 * sección «sobre nosotros». Y llegaba justo después de un capítulo de dos
 * columnas, así que dos capítulos seguidos se leían igual.
 *
 * Ahora el statement va primero y solo, a ancho casi completo — es el capítulo
 * donde la idea manda, así que la idea ocupa la primera pantalla del bloque. El
 * texto de apoyo baja a una columna estrecha a la izquierda y la fotografía de
 * Emmy sube desplazada a la derecha, más pequeña que antes y sin alinearse con
 * nada: rompe la retícula a propósito. La asimetría es lo que impide que esto
 * se lea como el bloque de arriba.
 *
 * EMMY PRESENTE, SUNNY PROTAGONISTA
 *
 * La fotografía se hizo más pequeña, no más grande. La regla narrativa del
 * proyecto es que Emmy impulsa Sunny y la comunidad lo protagoniza; un retrato
 * a media sección decía otra cosa. Sigue teniendo su párrafo y su pie, que es
 * exactamente la presencia que le toca.
 *
 * Lleva `parallax`: se desplaza algo más despacio que la columna de texto al
 * hacer scroll. Es el único parallax del capítulo y es lo que le da profundidad
 * sin añadir ninguna animación nueva.
 */
export function WhatIsSunny() {
  return (
    <div>
      {/* El statement, solo y a ancho casi completo. */}
      <InViewReveal variant="lead">
        <p className="eyebrow">Qué es Sunny Project</p>
        {/*
          La medida se ESTRECHA en pantalla ancha, no se ensancha.

          A 22ch el statement llegaba hasta la columna 9, que es justo donde
          entra la fotografía desplazada: el retrato se comía la última palabra
          («vivir») y no había forma de leerla. Con 17ch el texto termina antes
          de la columna 9 y las dos piezas pueden superponerse en vertical sin
          tocarse nunca. La asimetría se mantiene; la colisión desaparece.
        */}
        <h2 className="mt-5 max-w-[19ch] text-display text-balance lg:max-w-[17ch]">
          No se trata solo de encontrar planes.{" "}
          <span className="font-serif font-normal text-orange-ink italic">
            Se trata de encontrar nuevas formas de vivir.
          </span>
        </h2>
      </InViewReveal>

      <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-12">
        {/* Columna estrecha de texto: deliberadamente más angosta que el
            statement de arriba, para que se lea como la nota al pie de una idea
            grande y no como otro bloque del mismo peso. */}
        <div className="min-w-0 lg:col-span-5">
          <InViewReveal delay={0.06}>
            <p className="max-w-[46ch] text-lead text-carbon/80">
              Sunny Project nace para reunir a personas que quieren mejorar, descubrir y salir de su zona de confort.
              Conectamos esa energía con experiencias y espacios locales que quieren construir una comunidad más
              activa, curiosa y cercana.
            </p>
          </InViewReveal>

          {/*
            Dos notas con la etiqueta colgada, no dos tarjetas en rejilla.

            Misma información que antes; lo que cambia es que la etiqueta se
            sale a la izquierda en pantalla ancha, así que el bloque se lee como
            una ficha editorial y no como dos cajas gemelas — que es justo la
            forma que había que evitar.
          */}
          <InViewReveal delay={0.12}>
            <dl className="mt-10 space-y-6 border-t border-carbon/15 pt-6">
              <div className="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-5">
                <dt className="text-small font-semibold tracking-[0.1em] text-carbon uppercase">Para quien busca</dt>
                <dd className="mt-1.5 max-w-[42ch] text-body text-gray sm:mt-0">
                  Un lugar donde probar algo distinto cada semana, sin cuentas y sin pagar nada.
                </dd>
              </div>
              <div className="sm:grid sm:grid-cols-[10rem_1fr] sm:gap-5">
                <dt className="text-small font-semibold tracking-[0.1em] text-carbon uppercase">Para los espacios</dt>
                <dd className="mt-1.5 max-w-[42ch] text-body text-gray sm:mt-0">
                  Estudios, cafés y clubes locales abren lugares y conocen personas que llegan por curiosidad, no por
                  descuento.
                </dd>
              </div>
            </dl>
          </InViewReveal>

          <InViewReveal delay={0.18}>
            <Link
              href="/como-funciona"
              className="group mt-10 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
            >
              Cómo funciona
              <ArrowRight
                aria-hidden
                size={14}
                className="transition-transform duration-[var(--motion-nudge)] ease-sunny group-hover:translate-x-1"
              />
            </Link>
          </InViewReveal>
        </div>

        {/*
          La fotografía, desplazada.

          Ni centrada con el texto ni pegada al borde: entra por la columna 8 y
          sube por encima de la línea del párrafo en pantalla ancha. Es lo único
          de la portada que no se alinea con la retícula, y por eso funciona.
        */}
        <div className="min-w-0 lg:col-span-4 lg:col-start-9 lg:-mt-32">
          <InViewReveal variant="media" delay={0.1}>
            <figure>
              {/* `overflow-clip`, no `hidden`: con `hidden` esta caja es
                  contenedor de scroll y el `parallax` del retrato se queda
                  congelado a mitad de recorrido. */}
              <div className="relative aspect-[4/5] w-full max-w-[19rem] overflow-clip bg-carbon/5">
                <Image
                  src={EMMY_PHOTO.src}
                  alt={EMMY_PHOTO.alt}
                  fill
                  sizes="(min-width: 1024px) 20vw, 60vw"
                  className="parallax object-cover"
                />
              </div>
              <figcaption className="mt-5 max-w-[19rem] border-t border-carbon/15 pt-4">
                <p className="text-small font-semibold tracking-[0.1em] text-carbon uppercase">Emmy</p>
                <p className="mt-2 text-small text-gray">
                  Fundadora y curadora. Selecciona cada experiencia y conecta a la comunidad con los espacios que la
                  reciben. También organiza los Sunny Originals.
                </p>
              </figcaption>
            </figure>
          </InViewReveal>
        </div>
      </div>
    </div>
  );
}
