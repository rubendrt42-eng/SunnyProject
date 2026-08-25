import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { RECORRIDO } from "@/lib/lean-content";

export const metadata: Metadata = {
  title: "Cómo funciona — The Sunny Project",
  description:
    "Cinco pasos: encuentras una experiencia, solicitas tu lugar, Sunny revisa disponibilidad y te confirma por WhatsApp. Sin cuentas y sin pagar nada.",
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
          <p className="mt-6 max-w-[46ch] text-lead text-carbon/75">
            Cinco pasos. Sin cuentas, sin pagos y sin letra chica.
          </p>
        </div>
      </Container>

      {/*
        El índice. `<ol>` a ancho completo con un `Container` dentro de cada
        `<li>`, para que el paso de la ruptura pueda pintar su banda de borde a
        borde sin sacar el documento de su ancho — y sin perder que sea una
        lista para quien la escucha.
      */}
      <ol className="mt-16 sm:mt-24">
        {RECORRIDO.map((paso) =>
          paso.ruptura ? (
            <li key={paso.numero} className="ruptura my-8 py-16 sm:my-12 sm:py-24">
              <Container>
                {/*
                  EL HUECO VA EN PÍXELES, NO EN REM.

                  Es una rejilla de 12 columnas con dos bloques, así que separa
                  once veces aunque solo haya dos cosas que separar. Con el
                  hueco en rem y el texto del navegador al 200%, esos once
                  huecos pasan de 32 a 64 px: 704 px de hueco dentro de un
                  contenedor de 640, y las doce columnas calculadas a 0. La
                  página se iba de ancho — está medido y documentado.

                  En píxeles el hueco mide lo mismo a cualquier tamaño de texto,
                  porque es separación estructural y no texto. Hay una prueba
                  que lo vigila y me lo acaba de reprobar.
                */}
                <div className="sm:grid sm:grid-cols-12 sm:gap-[32px]">
                  <InViewReveal className="sm:col-span-7">
                    <p className="text-title text-balance text-carbon">
                      Solicitar <span className="font-serif font-normal italic">no es</span> estar confirmado.
                    </p>
                    <p className="mt-6 max-w-[46ch] text-body-l text-carbon/75">
                      Al enviar el formulario nos llega tu solicitud y revisamos la disponibilidad del espacio. Tu
                      lugar queda confirmado cuando te escribimos por WhatsApp, no antes. Si no hay cupo, también te
                      avisamos.
                    </p>
                  </InViewReveal>

                  <InViewReveal delay={0.08} className="mt-10 sm:col-span-4 sm:col-start-9 sm:mt-0">
                    <div className="border-t border-carbon/25 pt-5">
                      <span aria-hidden className="recorrido-num block font-serif text-carbon/40">
                        {paso.numero}
                      </span>
                      <h2 className="mt-5 text-heading text-carbon">{paso.titulo}</h2>
                      <p className="mt-2 text-body text-carbon/75">{paso.texto}</p>
                    </div>
                  </InViewReveal>
                </div>
              </Container>
            </li>
          ) : (
            <li key={paso.numero}>
              <Container>
                <InViewReveal delay={0.05}>
                  {/*
                    El número en su propia columna, alineado con la regla. Es
                    lo que hace que esto se lea como un índice y no como una
                    lista de párrafos con una cifra delante.
                  */}
                  <div className="grid grid-cols-[3.5rem_1fr] items-start gap-x-6 border-t border-carbon/15 py-10 sm:grid-cols-[7rem_1fr] sm:gap-x-10 sm:py-14">
                    <span
                      aria-hidden
                      className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-[0.85] text-orange-ink/35 tabular-nums"
                    >
                      {paso.numero}
                    </span>
                    <div className="min-w-0">
                      <h2 className="max-w-[22ch] text-subtitle text-balance">{paso.titulo}</h2>
                      <p className="mt-3 max-w-[42ch] text-body-l text-gray">{paso.texto}</p>
                    </div>
                  </div>
                </InViewReveal>
              </Container>
            </li>
          ),
        )}
      </ol>

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
