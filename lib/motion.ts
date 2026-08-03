/**
 * Sunny — sistema de movimiento 1.0
 *
 * Un solo sitio donde vive el ritmo del producto. Antes de esto había 36
 * números escritos a mano en 22 archivos y dos escalas de tiempo —una en JS,
 * otra en CSS— que no se conocían entre sí.
 *
 * Las duraciones se nombran por PARA QUÉ SIRVEN, no por cuánto duran. Eso es
 * deliberado: `MOTION.panel` sigue siendo el nombre correcto si mañana
 * decidimos que 350 ms es demasiado, mientras que `MOTION.ms350` habría que
 * renombrarlo o mentiría.
 *
 * La regla que ordena la escala está en SUNNY_TITAN_MOTION_ANALYSIS.md §2.3:
 * la duración la fija la distancia recorrida, no el gusto. Un color no se
 * mueve, así que es lo más rápido; un panel cruza media pantalla, así que es
 * de lo más lento.
 */

/**
 * `cubic-bezier(0.22, 1, 0.36, 1)` — ease-out-quint.
 *
 * Arranca rápido (la interfaz responde en el primer fotograma) y frena largo
 * (el elemento se posa en vez de estrellarse). No rebota nunca: Sunny vende
 * calma y un `overshoot` diría lo contrario.
 *
 * Ya era la curva de facto del proyecto —20 de 22 transiciones -— antes de
 * que existiera este archivo. Esto no la cambia, la nombra.
 */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Duraciones en segundos, que es la unidad que espera `motion/react`. */
export const MOTION = {
  /** Color, borde, opacidad de un control. No recorre distancia. */
  tint: 0.15,
  /** Micro-desplazamiento: la flecha que se adelanta 4px, el punto del carrusel. */
  nudge: 0.25,
  /** Elevación al pasar el cursor por una tarjeta. */
  lift: 0.25,
  /** Telón oscuro de un modal. No se desplaza, pero cubre mucha superficie. */
  scrim: 0.25,
  /** Acordeón, desplegable: la caja cambia de alto. */
  collapse: 0.3,
  /** Panel que entra desde un borde — Quick View, menú de pantalla completa. */
  panel: 0.35,
  /** Contenido que aparece dentro de algo que acaba de abrirse. */
  settle: 0.4,
  /** Entrada de un bloque al montarse (párrafo, fila de botones). */
  enter: 0.5,
  /** Revelado al entrar en el viewport al hacer scroll. El más lento a propósito. */
  reveal: 0.6,
  /** Un número contando hasta su valor. El único caso donde la duración ES el efecto. */
  count: 1.1,
} as const;

/**
 * Nota sobre cómo se eligieron los valores: son EXACTAMENTE los que ya estaban
 * escritos a mano en el proyecto. La escala nombra lo que había, no lo
 * reemplaza. Eso hace que adoptarla no cambie ni una animación —el cambio es
 * puro renombrado, y por tanto verificable— y deja la discusión sobre si 350 ms
 * es el número correcto para un momento en que se pueda ver el sitio moverse.
 */

/** Escalonados, en segundos. Lo que separa un elemento del siguiente. */
export const STAGGER = {
  /** Entre palabras de un titular. */
  word: 0.055,
  /** Entre elementos de una lista o menú. */
  item: 0.06,
} as const;

/**
 * Cuánto esperar antes de admitir que algo va lento.
 *
 * Por debajo de este umbral, mostrar un indicador de carga hace más daño que
 * bien: aparece y desaparece en un parpadeo y lo único que transmite es
 * nerviosismo. La documentación de Next recomienda exactamente esta técnica
 * para `useLinkStatus` — animación con `animation-delay`, empezando invisible.
 */
export const PENDING_DELAY_MS = 100;

/**
 * Transición estándar del sistema, lista para pasarse a `motion/react`.
 *
 *   <motion.div transition={transition("panel")} />
 *
 * Existe para que el sitio de llamada no tenga que repetir `ease: EASE` y
 * poder olvidárselo — que es justo como aparecieron los tres telones sin curva
 * declarada (auditoría §2.7).
 */
export function transition(duration: keyof typeof MOTION, delay = 0) {
  return { duration: MOTION[duration], ease: EASE, ...(delay ? { delay } : {}) };
}
