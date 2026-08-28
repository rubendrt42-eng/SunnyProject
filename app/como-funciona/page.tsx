import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { Recorrido } from "@/components/lean/Recorrido";

export const metadata: Metadata = {
  title: "Cómo funciona — The Sunny Project",
  description:
    "Encuentras una experiencia, solicitas tu lugar, Sunny revisa el cupo y te confirma por WhatsApp. Así funciona de principio a fin.",
};

/**
 * Cómo funciona — la página del menú.
 *
 * POR QUÉ SE REHIZO
 *
 * Contaba TRES pasos mientras la portada contaba cinco. El sitio se contradecía
 * según por dónde entraras: quien bajaba por la portada leía el recorrido real
 * —con el momento en que Sunny revisa disponibilidad y el aviso de que
 * solicitar no es estar confirmado— y quien llegaba por el menú leía una
 * versión resumida donde ese momento no existía.
 *
 * Los pasos ya no se escriben aquí: vienen de `RECORRIDO` en lib/lean-content,
 * que es la misma lista que compone la portada. Es lo único que impide que
 * vuelvan a separarse.
 *
 * POR QUÉ NO SE PARECE A LA PORTADA
 *
 * Cuenta lo mismo y se compone distinto, que es la regla del sitio. La portada
 * lo dispone en zigzag, alternando mitades. Aquí es un **índice**: el número
 * vive en una columna fija a la izquierda y el texto en la de al lado, con una
 * regla fina entre pasos. Se lee como el sumario de un documento — que es lo
 * que esta página es.
 *
 * SIN LIENZOS DE MARCA
 *
 * La versión anterior ilustraba el primer paso con un `BrandCanvas`: un
 * degradado ocupando el sitio de una fotografía que no existe. Se retiró, como
 * en el resto del sitio. Esta página no lleva imágenes y no las echa de menos:
 * es un procedimiento de cinco pasos, y lo que tiene que hacer es leerse claro.
 */
export default function ComoFuncionaPage() {
  return (
    <main className="py-16 sm:py-24 lg:py-32">
      <Container>
        {/*
          Sin antetítulo. «El recorrido» encima de «Cómo funciona» decía dos
          veces lo mismo, y era la fórmula que el resto del sitio dejó de
          repetir.
        */}
        <div className="max-w-3xl">
          <h1 className="text-display text-balance">Cómo funciona</h1>
          {/*
            «Sin cuentas, sin pagos y sin letra chica» es la lista de lo que
            una fintech promete no hacerte. Enumerar ausencias no explica el
            proceso; esta página existe para explicarlo.
          */}
          <p className="mt-6 max-w-[46ch] text-lead text-carbon/75">
            Así funciona una experiencia en Sunny, de principio a fin.
          </p>
        </div>
      </Container>

      {/*
        La misma secuencia con lámina fija que la portada.

        Antes esta página era un índice de texto quieto y la portada un zigzag,
        cada una con su composición. Lo que faltaba en las dos era lo mismo: que
        recorrerlas se sintiera. Comparten `Recorrido` para que el gesto sea el
        mismo por las dos puertas — lo que cambia es la entrada, no el paso.
      */}
      <div className="mt-16 sm:mt-20">
        <Recorrido />
      </div>
      <Container>
        <div className="mt-16 border-t border-carbon/15 pt-10 sm:mt-20">
          <LinkButton href="/experiencias" size="lg" variant="secondary" arrow>
            Explorar experiencias
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
