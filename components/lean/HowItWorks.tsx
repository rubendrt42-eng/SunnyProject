import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";

/**
 * Capítulo 04 — el recorrido.
 *
 * QUÉ SE TIRÓ
 *
 * Tres columnas escalonadas con un número naranja encima. Era la composición
 * más reconocible de la portada y la que más delataba de dónde venía: tres
 * elementos, tres columnas, porque eran tres. Además el recorrido que contaba
 * estaba de más simplificado —descubrir, solicitar, confirmar— y se saltaba el
 * único punto donde alguien puede llevarse una idea equivocada.
 *
 * QUÉ HAY AHORA
 *
 * Cinco pasos en vertical, alternando lado en escritorio. El número deja de
 * acompañar y pasa a encabezar: Newsreader a cuerpo grande, con una regla fina
 * debajo. La lectura baja en zigzag en pantalla ancha y en columna única en
 * teléfono, que es la misma narrativa contada al ancho que toca — no una
 * rejilla apilada.
 *
 * EL PASO 03 ES UNA PANTALLA, NO UNA NOTA
 *
 * «Solicitar no es estar confirmado» era la letra pequeña de un párrafo. Es la
 * única frase de la portada que evita que alguien se presente a una clase
 * creyendo que tiene lugar, así que deja de ser una advertencia escondida y
 * pasa a ser el momento en que el recorrido se detiene: banda de amarillo Sunny
 * a todo el ancho, carbón encima, y el paso contado dentro. Es el único bloque
 * de la portada que toca los dos bordes, y por eso corta.
 *
 * ESTRUCTURA
 *
 * `<ol>` a ancho completo y un `Container` DENTRO de cada `<li>`. Así el paso
 * de la ruptura puede pintar su fondo de borde a borde sin salirse del
 * documento —nada de `100vw`, que en escritorio suma el ancho de la barra de
 * scroll y devuelve scroll horizontal— y la lista sigue siendo una lista para
 * quien la escucha: «elemento 3 de 5» se sigue anunciando.
 */
const PASOS = [
  {
    numero: "01",
    titulo: "Encuentra algo que quieras vivir",
    texto: "Explora las experiencias disponibles.",
  },
  {
    numero: "02",
    titulo: "Solicita tu lugar",
    texto: "Deja tus datos. No necesitas crear una cuenta.",
  },
  {
    numero: "03",
    titulo: "Sunny revisa disponibilidad",
    texto: "La solicitud llega y se revisa si todavía existe lugar.",
    ruptura: true,
  },
  {
    numero: "04",
    titulo: "Recibe tu confirmación",
    texto: "Sunny se comunica por WhatsApp.",
  },
  {
    numero: "05",
    titulo: "Vive la experiencia",
    texto: "Llegas al espacio y formas parte de la experiencia.",
  },
];

export function HowItWorks() {
  return (
    <>
      <Container>
        <InViewReveal variant="lead">
          {/*
            Sin antetítulo. «Cómo funciona» encima de «Cinco pasos» decía dos
            veces lo mismo, y era la fórmula —antetítulo, titular, párrafo— que
            esta portada dejó de repetir. El titular se basta.

            Las dos voces van en dos líneas y no en línea corrida: mezcladas en
            el mismo renglón la conjunción quedaba huérfana al final y el giro
            se leía como un tropiezo.
          */}
          <h2 className="max-w-[16ch] text-title">
            <span className="block">Cinco pasos,</span>
            <span className="mt-1 block font-serif text-[1.06em] leading-[1.06] font-normal tracking-normal text-orange-ink italic">
              y ninguna cuenta que crear.
            </span>
          </h2>
        </InViewReveal>
      </Container>

      <ol className="mt-14 sm:mt-20">
        {PASOS.map((paso, i) => {
          const derecha = i % 2 === 1;

          if (paso.ruptura) {
            return (
              <li key={paso.numero} className="ruptura my-10 py-16 sm:my-14 sm:py-24">
                <Container>
                  <div className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-8">
                    <InViewReveal className="lg:col-span-7">
                      {/*
                        El statement de la ruptura. La conjunción va en la otra
                        familia porque es donde está el giro: lo que se hace
                        (solicitar) y lo que todavía no se es (confirmado).
                      */}
                      <p className="text-display text-balance text-carbon">
                        Solicitar{" "}
                        <span className="font-serif font-normal italic">no es</span>{" "}
                        estar confirmado.
                      </p>
                    </InViewReveal>

                    <InViewReveal delay={0.1} className="mt-8 lg:col-span-5 lg:mt-0">
                      <div className="border-t border-carbon/25 pt-5">
                        <span aria-hidden className="recorrido-num block font-serif text-carbon/45">
                          {paso.numero}
                        </span>
                        <h3 className="mt-5 text-heading text-carbon">{paso.titulo}</h3>
                        <p className="mt-2 max-w-[36ch] text-body text-carbon/75">{paso.texto}</p>
                      </div>
                    </InViewReveal>
                  </div>
                </Container>
              </li>
            );
          }

          return (
            <li key={paso.numero} className={derecha && i === 1 ? "py-6 sm:py-8 lg:-mt-28" : "py-6 sm:py-8"}>
              <Container>
                {/*
                  Alternancia. En escritorio los pasos impares ocupan la mitad
                  izquierda y los pares la derecha, así que la mirada zigzaguea
                  en vez de recorrer una columna. Por debajo de `lg` el zigzag
                  desaparece —en 390 px no hay dos mitades— y queda una sola
                  narrativa vertical.
                */}
                <div className="lg:grid lg:grid-cols-12">
                  <InViewReveal
                    delay={0.06}
                    className={derecha ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-5 lg:col-start-1"}
                  >
                    <div className="border-t border-carbon/15 pt-5">
                      <span aria-hidden className="recorrido-num block font-serif text-orange-ink/35">
                        {paso.numero}
                      </span>
                      <h3 className="mt-5 max-w-[18ch] text-subtitle text-balance">{paso.titulo}</h3>
                      <p className="mt-3 max-w-[38ch] text-body-l text-gray">{paso.texto}</p>
                    </div>
                  </InViewReveal>
                </div>
              </Container>
            </li>
          );
        })}
      </ol>
    </>
  );
}
