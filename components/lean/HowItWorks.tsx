import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { Recorrido } from "@/components/lean/Recorrido";
import type { BloqueDeTexto } from "@/lib/sanity/types";

/**
 * Capítulo 04 de la portada — el recorrido.
 *
 * La secuencia vive en `Recorrido`, que la comparte con la página
 * `/como-funciona`. Aquí solo va la entrada del capítulo: en la portada el
 * recorrido llega después de cinco capítulos y necesita presentarse; en su
 * propia página es lo primero que se ve y se presenta sola.
 */
export function HowItWorks({ bloque }: { bloque: BloqueDeTexto }) {
  return (
    <>
      <Container>
        <InViewReveal variant="lead">
          {/*
            «Cuatro pasos, y ninguna cuenta que crear» contaba el trámite y
            enumeraba lo que Sunny no pide, que es vocabulario de producto de
            software. La entrada al capítulo tiene que recoger a alguien que
            acaba de ver la lista de arriba y llevarlo al procedimiento.
          */}
          <h2 className="max-w-[16ch] text-title">
            <span className="block">{bloque.titulo}</span>
            {bloque.acento && (
              <span className="mt-1 block font-serif text-[1.06em] leading-[1.06] font-normal tracking-normal text-orange-ink italic">
                {bloque.acento}
              </span>
            )}
          </h2>
        </InViewReveal>
      </Container>

      <div className="mt-12 sm:mt-16">
        <Recorrido />
      </div>
    </>
  );
}
