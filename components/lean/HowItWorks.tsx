import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";

/**
 * Los tres pasos, en el lenguaje correcto para esta etapa.
 *
 * El tercer paso es el importante y por eso está redactado con cuidado:
 * **el sitio no confirma nada**. Recibe una solicitud y Emmy contesta. Decir
 * «reserva tu lugar» aquí sería prometer algo que el sistema no hace, y quien
 * lo leyera se presentaría a una clase creyendo que tiene lugar apartado.
 *
 * Tres pasos y no cinco: es la cantidad que alguien lee de un vistazo sin
 * decidir que es complicado.
 */
const PASOS = [
  {
    titulo: "Descubre una experiencia",
    texto: "Mira lo que hay disponible esta semana en los espacios aliados de Monterrey.",
  },
  {
    titulo: "Solicita tu lugar",
    texto: "Déjanos tu nombre y tu WhatsApp. Sin crear cuenta y sin pagar nada.",
  },
  {
    titulo: "Confirmamos contigo",
    texto: "Revisamos la disponibilidad y te escribimos por WhatsApp para confirmar tu lugar.",
  },
];

export function HowItWorks() {
  return (
    <Container>
      <InViewReveal>
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-3 max-w-2xl text-title text-balance">Salir de la rutina no debería ser complicado.</h2>
      </InViewReveal>

      <ol className="mt-10 grid gap-6 sm:grid-cols-3">
        {PASOS.map((paso, i) => (
          <InViewReveal key={paso.titulo} delay={i * 0.08}>
            <li className="flex h-full flex-col rounded-lg border border-carbon/10 bg-warm-white p-6">
              {/* El número es el orden real de una secuencia, no una decoración:
                  estos pasos ocurren uno después de otro. */}
              <span className="text-2xl font-bold text-orange-ink tabular-nums">{i + 1}</span>
              <h3 className="mt-3 text-heading">{paso.titulo}</h3>
              <p className="mt-2 text-body text-gray">{paso.texto}</p>
            </li>
          </InViewReveal>
        ))}
      </ol>
    </Container>
  );
}
