import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Cómo funciona — Sunny Project" };

const STEPS = [
  {
    number: "01",
    title: "Descubre",
    body: "Explora experiencias seleccionadas de wellness, movimiento, cafés, outdoor y comunidad en Monterrey.",
  },
  {
    number: "02",
    title: "Reclama",
    body: "Cada semana tienes un pase gratuito. Úsalo antes de que se agoten los lugares en la experiencia que elijas.",
  },
  {
    number: "03",
    title: "Vive",
    body: "Presenta tu nombre y folio al llegar, disfruta la experiencia y vuelve la próxima semana por otra.",
  },
];

const RULES = [
  "Un pase gratuito por semana calendario (inicia el lunes).",
  "El pase es individual, no transferible y no admite acompañantes.",
  "Solo puedes tener una reservación activa a la vez por semana.",
  "Puedes cancelar hasta 12 horas antes y recuperar tu pase.",
  "No hay pagos, suscripciones ni pases adicionales en esta etapa.",
];

export default function ComoFuncionaPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl italic sm:text-5xl">Cómo funciona</h1>
        <p className="mt-4 text-lg text-gray">
          Sunny Project conecta personas con espacios locales de bienestar a través de un pase semanal gratuito.
        </p>

        <div className="mt-14 flex flex-col gap-12">
          {STEPS.map((step) => (
            <div key={step.number} className="flex gap-6">
              <span className="font-serif text-5xl text-orange">{step.number}</span>
              <div>
                <h2 className="text-xl font-semibold">{step.title}</h2>
                <p className="mt-2 text-gray">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <section className="mt-16 rounded-2xl border border-carbon/10 bg-warm-white p-8">
          <h2 className="text-xl font-semibold">Reglas del pase semanal</h2>
          <ul className="mt-4 space-y-2 text-carbon">
            {RULES.map((rule) => (
              <li key={rule} className="flex gap-3">
                <span aria-hidden className="text-orange">
                  •
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12">
          <LinkButton href="/experiencias" size="lg">
            Explorar experiencias
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
