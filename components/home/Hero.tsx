import Image from "next/image";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HERO_TOGETHER } from "@/lib/media";

/**
 * Editorial split rather than a full-bleed media hero.
 *
 * This is a constraint turned into a decision: there is no video material
 * and no horizontal photography in the attached assets — everything is
 * 736px-wide vertical (SUNNY_ASSET_MANIFEST.md §5). A 736px image stretched
 * across a 1440px viewport would look soft, so the photograph occupies a
 * column at roughly its native size while the type carries the left half.
 * It also happens to be the composition both Phamily and Coda use for
 * their strongest statements.
 *
 * The five-second question the hero has to answer: what Sunny is
 * (experiencias locales) and what you can do (explorar esta semana). The
 * week's actual experiences are the very next thing on the page, so the
 * hero does not need to show one here — see the note on the photograph.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-carbon/10 bg-ivory">
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div className="max-w-xl">
          <LineReveal>
            <p className="eyebrow">Monterrey · Cada semana</p>
          </LineReveal>

          {/* Two short lines, ~7 words. The promise is the discovery AND
              the company — that pairing is the whole differentiator.
              Both lines live inside the single h1 so the page's heading is
              the whole promise, not just its first half. */}
          <h1 className="mt-4 text-display">
            <WordReveal as="span" text="Descubre algo nuevo." className="block" />
            <WordReveal as="span" text="Vívelo con alguien." delay={0.22} className="block text-orange-ink" />
          </h1>

          <LineReveal delay={0.5}>
            <p className="mt-6 max-w-md text-body-l text-gray">
              Experiencias locales para salir de la rutina, conectar y formar parte de una comunidad que busca crecer.
            </p>
          </LineReveal>

          <LineReveal delay={0.62}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/experiencias" size="lg" variant="primary" arrow>
                Explorar esta semana
              </LinkButton>
              <LinkButton href="/#que-es-sunny" size="lg" variant="secondary">
                Conoce Sunny
              </LinkButton>
            </div>
          </LineReveal>
        </div>

        {/* The photograph is a photograph, not a tray.
            A rotating card used to float on top of it, covering the lower
            third — in practice the players' legs — while a sliver of image
            stayed visible around it. It also showed the week one experience
            at a time behind pagination dots, which is a worse way to read a
            five-item list than the grid that already sits directly below in
            "Esta semana". Redundant AND obstructive, so it goes: the image
            gets its full frame back and the list is read as a list. */}
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-lg bg-carbon/5 sm:aspect-3/4 lg:aspect-square">
          <Image
            src={HERO_TOGETHER.src}
            alt={HERO_TOGETHER.alt}
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
      </Container>
    </section>
  );
}
