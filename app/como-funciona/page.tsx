import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { COMMUNITY_PHOTOS, EXPERIENCE_PHOTOS, HERO_TOGETHER } from "@/lib/media";

export const metadata: Metadata = { title: "Cómo funciona — Sunny Project" };

/**
 * Cada paso lleva fotografía. Esta página tenía **cero** imágenes y era más
 * pobre que su propio resumen en el Home, que sí tiene recorrido visual: quien
 * entraba por el menú a la página dedicada veía menos que quien no salió de la
 * portada. Las fotos son las mismas ya aprobadas en `lib/media.ts`, elegidas
 * porque ilustran el momento del paso, no un negocio concreto.
 */
const STEPS = [
  {
    number: "01",
    title: "Descubre",
    body: "Explora experiencias seleccionadas de wellness, movimiento, cafés, outdoor y comunidad en Monterrey.",
    photo: EXPERIENCE_PHOTOS["mat-pilates"],
  },
  {
    number: "02",
    title: "Reclama",
    body: "Cada semana tienes un pase gratuito. Úsalo antes de que se agoten los lugares en la experiencia que elijas.",
    photo: HERO_TOGETHER,
  },
  {
    number: "03",
    title: "Vive",
    body: "Presenta tu nombre y folio al llegar, disfruta la experiencia y vuelve la próxima semana por otra.",
    photo: COMMUNITY_PHOTOS[0],
  },
];

const RULES = [
  "Un pase gratuito por semana calendario (inicia el lunes).",
  "El pase es personal y no transferible. Cada experiencia define cuántos lugares admite por reservación: la mayoría uno, algunas hasta tres.",
  "Solo puedes tener una reservación activa a la vez por semana.",
  "Puedes cancelar hasta 12 horas antes y recuperar tu pase.",
  "No hay pagos, suscripciones ni pases adicionales en esta etapa.",
];

export default function ComoFuncionaPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow">El recorrido</p>
          <h1 className="mt-3 text-display">Cómo funciona</h1>
          <p className="mt-5 max-w-xl text-body-l text-gray">
            Sunny Project conecta personas con espacios locales de bienestar a través de un pase semanal gratuito.
          </p>
        </div>

        <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step) => (
            <div key={step.number} className="flex flex-col">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-carbon/5">
                <Image
                  src={step.photo.src}
                  alt={step.photo.alt}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <span aria-hidden className="mt-5 text-label text-orange-ink">
                {step.number}
              </span>
              <h2 className="mt-2 text-subtitle">{step.title}</h2>
              <p className="mt-2 text-gray">{step.body}</p>
            </div>
          ))}
        </div>

        <section className="mt-20 rounded-xl border border-carbon/10 bg-warm-white p-8 sm:p-10">
          <h2 className="text-subtitle">Reglas del pase semanal</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-x-10">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-3 text-carbon">
                <span aria-hidden className="text-orange-ink">
                  •
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <LinkButton href="/experiencias" size="lg" arrow>
            Explorar experiencias
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
