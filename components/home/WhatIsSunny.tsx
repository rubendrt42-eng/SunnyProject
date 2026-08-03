import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { EMMY_PHOTO } from "@/lib/media";

/**
 * "Qué es Sunny Project" (brief §17). Purpose, community, and the
 * relationship with local spaces — plus a deliberately short presence for
 * Emmy.
 *
 * Emmy gets one paragraph and one photograph, not a biography: the brief's
 * narrative rule is "Emmy impulsa Sunny, la comunidad protagoniza Sunny".
 * Nothing here invents her history — no home town, no founding anecdote, no
 * dates. The provisional line is flagged in
 * SUNNY_MVP_1_1_RELEASE_REPORT.md so it can be replaced with her own words
 * rather than quietly shipping as if she had written it.
 */
export function WhatIsSunny() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <InViewReveal>
          <p className="eyebrow">Qué es Sunny Project</p>
          {/* The one place on the page a serif accent carries a full
              statement — an anchor phrase between chapters, adopted from
              Phamily's mid-scroll rhythm break. */}
          <h2 className="mt-4 text-title">
            No se trata solo de encontrar planes.{" "}
            <span className="font-serif italic text-orange-ink">Se trata de encontrar nuevas formas de vivir.</span>
          </h2>
        </InViewReveal>

        <InViewReveal delay={0.1}>
          <p className="mt-6 max-w-xl text-body-l text-gray">
            Sunny Project nace para reunir a personas que quieren mejorar, descubrir y salir de su zona de confort.
            Conectamos esa energía con experiencias y espacios locales que quieren construir una comunidad más activa,
            curiosa y cercana.
          </p>
        </InViewReveal>

        <InViewReveal delay={0.16}>
          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="text-heading">Para quien busca</dt>
              <dd className="mt-1 text-small text-gray">
                Un lugar donde probar algo distinto cada semana sin comprometerte con una membresía.
              </dd>
            </div>
            <div>
              <dt className="text-heading">Para los espacios</dt>
              <dd className="mt-1 text-small text-gray">
                Estudios, cafés y clubes locales abren lugares y conocen personas que llegan por curiosidad, no por
                descuento.
              </dd>
            </div>
          </dl>
        </InViewReveal>

        <InViewReveal delay={0.22}>
          <Link
            href="/como-funciona"
            className="mt-8 inline-flex items-center gap-1.5 text-small font-semibold text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
          >
            Cómo funciona el pase
            <ArrowRight aria-hidden size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </InViewReveal>
      </div>

      <div className="lg:col-span-5">
        <InViewReveal delay={0.12}>
          <figure>
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-carbon/5">
              <Image
                src={EMMY_PHOTO.src}
                alt={EMMY_PHOTO.alt}
                fill
                sizes="(min-width: 1024px) 34vw, 90vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-4 max-w-sm">
              <p className="text-heading">Emmy · Fundadora y curadora</p>
              <p className="mt-1 text-small text-gray">
                Emmy selecciona cada experiencia y conecta a la comunidad con los espacios que la reciben. También
                organiza los Sunny Originals.
              </p>
            </figcaption>
          </figure>
        </InViewReveal>
      </div>
    </div>
  );
}
