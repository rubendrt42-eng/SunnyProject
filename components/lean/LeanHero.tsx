import Image from "next/image";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { blurProps, sanityImageUrl } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

/**
 * Hero del MVP lean.
 *
 * POR QUÉ YA NO HAY FOTOGRAFÍA FIJA
 *
 * Antes usaba `HERO_TOGETHER` de `lib/media.ts`. Esa imagen es de referencia
 * —descargada de contenido publicado por otra marca— y el propio manifiesto del
 * proyecto marca su uso en producción como bloqueado. Estaba publicada en una
 * URL abierta e indexable.
 *
 * Se sustituye por una composición de marca hecha solo con CSS: carbón de base,
 * un sol de amarillo Sunny arriba a la izquierda, un barrido de naranja abajo a
 * la derecha y el mismo grano de antes. Cero archivos, cero licencias, cero
 * peticiones de red — y el texto queda en blanco cálido sobre carbón, que es
 * más contraste del que tenía sobre la fotografía.
 *
 * **En cuanto Emmy suba una fotografía** al campo «Fotografía del hero» del
 * documento de contenido, el hero la usa y la composición desaparece. No hace
 * falta tocar código: por eso el campo existe.
 *
 * EL CONTADOR
 *
 * Solo aparece a partir de tres experiencias. Con una o dos, un contador honesto
 * dice en voz alta que el sitio está casi vacío — y eso es peor que no decir
 * nada. No se inventa un número: se calla.
 */
export function LeanHero({
  title,
  subtitle,
  experienceCount,
  image,
}: {
  title: string;
  subtitle: string;
  experienceCount: number;
  image?: SanityImage | null;
}) {
  // Se parte el titular en dos frases para darle a la segunda el color de
  // marca, que es lo que hace que el hero se lea como Sunny y no como una
  // plantilla. Si Emmy escribe una sola frase, se muestra una sola.
  const [primera, ...resto] = title.split(/(?<=\.)\s+/);
  const segunda = resto.join(" ");

  return (
    <section className="relative isolate -mt-18 flex min-h-[86svh] flex-col justify-end overflow-hidden bg-carbon lg:min-h-[92svh]">
      {image ? (
        <>
          <Image
            src={sanityImageUrl(image, 1920)}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover object-[center_65%]"
            {...blurProps(image)}
          />
          <div aria-hidden className="absolute inset-0 -z-10 bg-carbon/45" />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-t from-carbon/90 via-carbon/60 to-carbon/25"
          />
        </>
      ) : (
        <>
          {/* Composición de marca. Ver la nota de arriba: sustituye a una
              fotografía sin licencia, no a una fotografía que falte por error. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-20"
            style={{
              background:
                "radial-gradient(85% 70% at 12% 8%, rgba(248,211,71,.55) 0%, rgba(248,211,71,.12) 42%, rgba(23,23,20,0) 72%)," +
                "radial-gradient(75% 65% at 92% 88%, rgba(255,122,61,.42) 0%, rgba(255,122,61,.08) 46%, rgba(23,23,20,0) 74%)," +
                "linear-gradient(160deg, #1d1d19 0%, #171714 55%, #221f1a 100%)",
            }}
          />
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 -z-10 h-full w-full text-warm-white opacity-[0.07]"
          >
            <circle cx="18" cy="22" r="30" fill="none" stroke="currentColor" strokeWidth="0.35" />
            <circle cx="18" cy="22" r="46" fill="none" stroke="currentColor" strokeWidth="0.25" />
            <circle cx="88" cy="86" r="26" fill="none" stroke="currentColor" strokeWidth="0.35" />
          </svg>
        </>
      )}
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

            {experienceCount >= 3 && (
              <p className="text-small text-warm-white/85">
                <span className="font-bold text-warm-white">{experienceCount}</span> experiencias disponibles
              </p>
            )}
          </div>
        </LineReveal>
      </Container>
    </section>
  );
}
