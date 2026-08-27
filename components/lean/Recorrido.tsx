import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { RECORRIDO, type PasoDelRecorrido } from "@/lib/lean-content";

/**
 * El recorrido, con lámina fija.
 *
 * QUÉ ESTABA MAL
 *
 * El recorrido era texto quieto: mucho aire para muy poca información, y nada
 * ocurría al bajar. Lo que le faltaba no eran cosas que picar — era que el acto
 * de recorrerlo se sintiera.
 *
 * CÓMO FUNCIONA AHORA
 *
 * Cada paso ocupa una pantalla y se parte en dos: una **lámina que se queda
 * fija** mientras lees el texto de al lado, y que sale cuando el paso termina
 * para dejar entrar la del paso siguiente. Si subes, vuelve la anterior. Es el
 * scroll del navegador el que manda: no hay nada que lo intercepte, ni saltos,
 * ni pantallas robadas.
 *
 * Se hace con `position: sticky`, que existe desde siempre y no cuesta
 * JavaScript. Encima, cada lámina entra con una escala y una opacidad ligadas a
 * su posición (`animation-timeline: view()`), así que **no se enciende y se
 * apaga: se acerca y se aleja**. Como depende de la posición y no del tiempo, va
 * y viene con el dedo — que es exactamente lo que se pidió.
 *
 * POR QUÉ LA LÁMINA NO ES UN DEGRADADO
 *
 * Aquí es donde irían las fotografías del día que existan, y el hueco está
 * dimensionado para ellas. Mientras tanto la lámina la compone la tipografía: el
 * verbo del paso a cuerpo enorme en Newsreader y el número pequeño arriba. Cada
 * una sobre un tinte plano distinto, para que el cambio de una a otra se lea sin
 * necesidad de mirar el texto.
 *
 * LA RUPTURA VIVE DENTRO DE LA SECUENCIA
 *
 * El paso 03 —«solicitar no es estar confirmado»— era una banda que cortaba la
 * página. Ahora es la lámina amarilla del tercer paso: está en pantalla todo el
 * tiempo que dura ese paso, en vez de pasar de largo. Es más difícil de saltarse
 * que un cartel.
 *
 * EN TELÉFONO
 *
 * Nada se fija. La lámina va encima y el texto debajo, y cada paso entra con el
 * mismo revelado que el resto del sitio. Un panel pegajoso en 390 px taparía
 * media pantalla de texto.
 *
 * `prefers-reduced-motion` desactiva las escalas; el `sticky` se queda, porque
 * no es una animación: es una posición.
 */
const TINTES = [
  "bg-carbon/[0.055] text-carbon",
  "bg-orange/[0.09] text-carbon",
  "bg-sunny text-carbon",
  "bg-carbon text-warm-white",
  "bg-orange/[0.14] text-carbon",
];

function Lamina({ paso, indice }: { paso: PasoDelRecorrido; indice: number }) {
  return (
    <div
      /*
        La proporción cambia con el ancho, no por capricho: en escritorio la
        lámina es una columna estrecha y alta (4/5) que acompaña la lectura;
        en un teléfono ocupa todo el ancho, y a 4/5 se convertía en un bloque
        de color de 437 px con un verbo al fondo y el resto vacío. A 3/2 mide
        233 px y sigue siendo un hueco válido para la fotografía futura.
      */
      className={`recorrido-lamina relative flex aspect-[3/2] w-full flex-col justify-between overflow-clip p-7 sm:p-9 lg:aspect-[4/5] ${TINTES[indice % TINTES.length]}`}
    >
      <span aria-hidden className="text-small tracking-[0.18em] tabular-nums opacity-60">
        {paso.numero} / {String(RECORRIDO.length).padStart(2, "0")}
      </span>

      {paso.ruptura ? (
        /* La ruptura no lleva verbo: lleva la frase entera. Es el único paso
           que existe para corregir una idea equivocada, así que la lámina la
           dice completa. */
        <p className="recorrido-frase max-w-[14ch] font-serif italic">
          Solicitar no es estar confirmado.
        </p>
      ) : (
        <p aria-hidden className="recorrido-verbo font-serif italic">
          {paso.clave}
        </p>
      )}
    </div>
  );
}

export function Recorrido() {
  return (
    <ol className="recorrido">
      {RECORRIDO.map((paso, i) => (
        <li key={paso.numero} className="recorrido-paso">
          <Container>
            <div className="lg:grid lg:grid-cols-12 lg:gap-[48px]">
              {/*
                LA LÁMINA SE QUEDA.

                `sticky` con `top` a un quinto de la ventana: la lámina se
                detiene ahí y acompaña la lectura del paso entero. De `lg` hacia
                abajo no se fija — ver la nota de arriba.
              */}
              <div className="lg:col-span-5 lg:sticky lg:top-[18vh] lg:self-start">
                <Lamina paso={paso} indice={i} />
              </div>

              <div className="mt-8 lg:col-span-6 lg:col-start-7 lg:mt-0 lg:flex lg:min-h-[70vh] lg:items-center">
                <InViewReveal>
                  <div>
                    <span
                      aria-hidden
                      className="recorrido-num block font-serif text-orange-ink/30 lg:hidden"
                    >
                      {paso.numero}
                    </span>
                    <h3 className="mt-4 max-w-[20ch] text-title text-balance lg:mt-0">{paso.titulo}</h3>
                    <p className="mt-4 max-w-[40ch] text-lead text-carbon/80">{paso.texto}</p>

                    {/*
                      LA EXPLICACIÓN DE VERDAD.

                      Cada paso tenía una sola línea y el recorrido se leía como
                      un índice: quien llegaba sin saber qué es Sunny seguía sin
                      saberlo al final. Esto responde lo que de verdad se
                      pregunta — qué dejo, quién me contesta, cuándo sé que
                      tengo lugar, qué llevo.
                    */}
                    <p className="mt-6 max-w-[46ch] text-body text-gray">{paso.detalle}</p>

                    {paso.ruptura && (
                      /* La frase que evita el malentendido caro se repite en el
                         texto y no solo en la lámina: quien lee de cerca no
                         debería depender de haber mirado el panel de al lado. */
                      <p className="mt-6 max-w-[42ch] border-l-2 border-sunny pl-5 text-body-l text-carbon">
                        Solicitar no es estar confirmado.
                      </p>
                    )}
                  </div>
                </InViewReveal>
              </div>
            </div>
          </Container>
        </li>
      ))}
    </ol>
  );
}
