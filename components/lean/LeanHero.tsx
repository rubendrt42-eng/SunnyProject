import Image from "next/image";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HERO_TOGETHER } from "@/lib/media";

/**
 * Hero del MVP lean.
 *
 * Conserva la composición aprobada de la versión avanzada —fotografía a sangre
 * completa, contenido anclado abajo a la izquierda, velo en dos capas, grano
 * para compensar el escalado— y cambia dos cosas:
 *
 * 1. **El titular viene de Sanity**, así que Emmy lo puede cambiar sin tocar
 *    código. Si el documento de textos todavía no existe, se usan los valores
 *    por defecto: el sitio tiene que poder desplegarse antes de que ella haya
 *    escrito nada.
 * 2. **Un solo botón.** El segundo («Conoce Sunny») llevaba a una sección de la
 *    misma página, que en un hero es una manera elegante de repartir la
 *    atención sin ganar nada. La única acción es explorar experiencias.
 *
 * Sobre la fotografía: sigue siendo de referencia y no está autorizada para
 * producción. Ver SUNNY_ASSET_MANIFEST.md y MVP_SETUP.md.
 */
export function LeanHero({
  title,
  subtitle,
  experienceCount,
}: {
  title: string;
  subtitle: string;
  experienceCount: number;
}) {
  // Se parte el titular en dos frases para poder darle a la segunda el color
  // de marca, que es lo que hace que el hero se lea como Sunny y no como una
  // plantilla. Si Emmy escribe una sola frase, se muestra una sola.
  const [primera, ...resto] = title.split(/(?<=\.)\s+/);
  const segunda = resto.join(" ");

  return (
    <section className="relative isolate -mt-18 flex min-h-[88svh] flex-col justify-end overflow-hidden lg:min-h-[92svh]">
      <Image
        src={HERO_TOGETHER.src}
        alt={HERO_TOGETHER.alt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[center_72%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-carbon/45" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-carbon/90 via-carbon/60 to-carbon/25" />
      <div aria-hidden className="hero-grain absolute inset-0 -z-10" />

      <Container className="pt-32 pb-14 sm:pb-20">
        <LineReveal>
          <p className="inline-flex rounded-full border border-white/25 bg-carbon/55 px-4 py-1.5 text-label text-warm-white backdrop-blur-sm">
            Monterrey · Cada semana
          </p>
        </LineReveal>

        <h1 className="mt-6 max-w-3xl text-display text-warm-white">
          <WordReveal as="span" text={primera} className="block" />
          {segunda && <WordReveal as="span" text={segunda} delay={0.22} className="block text-sunny" />}
        </h1>

        <LineReveal delay={0.5}>
          <p className="mt-6 max-w-lg text-body-l text-warm-white/85">{subtitle}</p>
        </LineReveal>

        <LineReveal delay={0.62}>
          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <LinkButton href="/experiencias" size="lg" variant="primary" arrow>
              Explorar experiencias
            </LinkButton>

            {/* El número es real: sale de contar lo que Emmy tiene publicado y
                vigente. Una semana con dos experiencias dice dos. */}
            {experienceCount > 0 && (
              <p className="text-small text-warm-white/85">
                <span className="font-bold text-warm-white">{experienceCount}</span>{" "}
                {experienceCount === 1 ? "experiencia disponible" : "experiencias disponibles"}
              </p>
            )}
          </div>
        </LineReveal>
      </Container>
    </section>
  );
}
