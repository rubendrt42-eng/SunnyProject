import Image from "next/image";
import Link from "next/link";
// lucide-react dropped brand glyphs, so the handle is marked with AtSign
// rather than shipping a hand-drawn Instagram logo.
import { AtSign } from "lucide-react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { LinkButton } from "@/components/ui/Button";
import { COMMUNITY_PHOTOS } from "@/lib/media";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/constants";

/**
 * Comunidad (brief §19) — a section about people, not a feature.
 *
 * Explicitly NOT built here, per the out-of-scope list: no chat, no feed,
 * no public profiles, no comments, no matching. Community is expressed
 * through real photography, an anchor phrase, and three concrete actions
 * that already exist (explore this week's experiences, follow Sunny, share
 * an experience). Every claim about community has an action attached — the
 * brief forbids community promises with nothing behind them.
 */
export function CommunitySection() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <InViewReveal>
          <p className="eyebrow">Comunidad</p>
          <h2 className="mt-4 text-title text-warm-white">
            Puedes llegar solo.{" "}
            <span className="font-serif italic text-sunny">Eso no significa que te vas a ir igual.</span>
          </h2>
        </InViewReveal>

        <InViewReveal delay={0.1}>
          <p className="mt-6 text-body-l text-warm-white/75">
            No se trata solamente de probar una actividad. Se trata de encontrar nuevas formas de moverte, aprender,
            convivir y conectar con personas que tienen las mismas ganas de vivir algo diferente.
          </p>
        </InViewReveal>

        <InViewReveal delay={0.16}>
          <p className="mt-4 text-body text-warm-white/60">
            Una experiencia puede durar una hora. La conexión puede quedarse.
          </p>
        </InViewReveal>

        <InViewReveal delay={0.22}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/experiencias" variant="primary" arrow>
              Ver esta semana
            </LinkButton>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-warm-white/30 px-5 text-small font-medium text-warm-white transition-colors hover:bg-warm-white/10"
            >
              <AtSign aria-hidden size={16} strokeWidth={1.5} />
              Seguir a Sunny
              <span className="sr-only"> en Instagram, {INSTAGRAM_HANDLE}</span>
            </a>
          </div>
        </InViewReveal>

        <InViewReveal delay={0.28}>
          <p className="mt-5 text-small text-warm-white/50">
            ¿Ya viste algo que le va a alguien?{" "}
            <Link href="/experiencias" className="underline decoration-warm-white/40 underline-offset-4 hover:decoration-warm-white">
              Compártelo desde cualquier experiencia
            </Link>
            .
          </p>
        </InViewReveal>
      </div>

      {/* Two vertical photographs offset from each other — an asymmetric
          pair rather than a third card, so this section does not read like
          the grids above and below it. */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-6">
        {COMMUNITY_PHOTOS.map((photo, i) => (
          <InViewReveal key={photo.src} delay={0.1 + i * 0.08}>
            <div className={i === 1 ? "relative aspect-4/5 overflow-hidden rounded-lg bg-warm-white/10 lg:mt-12" : "relative aspect-4/5 overflow-hidden rounded-lg bg-warm-white/10"}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 28vw, 45vw"
                className="object-cover"
              />
            </div>
          </InViewReveal>
        ))}
      </div>
    </div>
  );
}
