import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { Recorrido } from "@/components/lean/Recorrido";

/**
 * Capítulo 04 de la portada — el recorrido.
 *
 * La secuencia vive en `Recorrido`, que la comparte con la página
 * `/como-funciona`. Aquí solo va la entrada del capítulo: en la portada el
 * recorrido llega después de cinco capítulos y necesita presentarse; en su
 * propia página es lo primero que se ve y se presenta sola.
 */
export function HowItWorks() {
  return (
    <>
      <Container>
        <InViewReveal variant="lead">
          <h2 className="max-w-[16ch] text-title">
            <span className="block">Cuatro pasos,</span>
            <span className="mt-1 block font-serif text-[1.06em] leading-[1.06] font-normal tracking-normal text-orange-ink italic">
              y ninguna cuenta que crear.
            </span>
          </h2>
        </InViewReveal>
      </Container>

      <div className="mt-12 sm:mt-16">
        <Recorrido />
      </div>
    </>
  );
}
