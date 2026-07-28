import Link from "next/link";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LinkButton } from "@/components/ui/Button";
import { HeroFeaturedCard } from "@/components/home/HeroFeaturedCard";
import { HeroVideo } from "@/components/home/HeroVideo";
import type { ExperienceWithBusiness } from "@/lib/queries";

export function Hero({ featured }: { featured: ExperienceWithBusiness | null }) {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden rounded-b-[2rem] text-warm-white sm:rounded-b-[3rem]">
      <HeroVideo poster="/demo-assets/hero-poster.webp" src="/demo-assets/hero-reel.mp4" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/92 via-carbon/40 to-carbon/60" />

      <div className="relative mx-auto mt-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-16 sm:px-8 sm:pb-20 lg:flex-row lg:items-end lg:justify-between lg:pb-24">
        <div className="max-w-xl">
          <WordReveal
            as="h1"
            text="DESCUBRE ALGO NUEVO ESTA SEMANA."
            className="text-5xl leading-[1.03] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.75rem] lg:leading-[1.02]"
          />
          <LineReveal delay={0.5}>
            <p className="mt-6 max-w-md text-lg text-warm-white/90">
              Experiencias seleccionadas en Monterrey con cupos limitados y un pase gratuito cada semana.
            </p>
          </LineReveal>
          <LineReveal delay={0.65}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <LinkButton href="/experiencias" size="lg" variant="secondary">
                Explorar experiencias
              </LinkButton>
              <Link
                href="/como-funciona"
                className="rounded-full border border-warm-white/50 px-8 py-4 text-base font-medium text-warm-white transition-colors hover:bg-warm-white/10"
              >
                Cómo funciona
              </Link>
            </div>
          </LineReveal>
        </div>

        {featured && <HeroFeaturedCard experience={featured} />}
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-warm-white/70 sm:flex">
        <span className="text-xs tracking-widest uppercase">Descubre más</span>
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 motion-safe:animate-bounce">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    </section>
  );
}
