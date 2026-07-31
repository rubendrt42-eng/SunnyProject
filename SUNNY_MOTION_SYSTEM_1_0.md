# Sistema de movimiento Sunny 1.0

Dónde vive: `lib/motion.ts` (JavaScript) y el bloque `--motion-*` de
`app/globals.css` (CSS). Los dos tienen los mismos nombres y los mismos valores
a propósito.

---

## 1. Una curva

```
cubic-bezier(0.22, 1, 0.36, 1)
```

En JS: `EASE`. En CSS: `ease-sunny`.

Arranca rápido y frena largo. La interfaz responde en el primer fotograma —la
sensación de «me hizo caso» se decide en los primeros 80 ms, no al final— y el
elemento llega a su sitio y se posa en vez de estrellarse.

**No rebota.** No hay `overshoot` en ninguna parte del producto. Sunny vende
calma; un rebote diría lo contrario.

Ya era la curva de facto —20 de las 22 transiciones del proyecto— antes de que
tuviera nombre. Esto no la cambió, la escribió.

La única excepción viva es `SessionLoader`, que usa `[0.65, 0, 0.35, 1]` y
`easeInOut` para la cortina de entrada. Una cortina quiere una curva simétrica,
no una que frene al final. Es una excepción consciente, no un despiste.

---

## 2. Una escala, nombrada por para qué sirve

| Nombre | ms | Para qué |
|---|---|---|
| `tint` | 150 | Color, borde, opacidad de un control. No recorre distancia. |
| `nudge` | 250 | Micro-desplazamiento: la flecha que se adelanta, el punto del carrusel. |
| `lift` | 250 | Elevación al pasar el cursor por una tarjeta. |
| `scrim` | 250 | Telón oscuro de un modal. No se desplaza, pero cubre mucha superficie. |
| `collapse` | 300 | Acordeón, desplegable: la caja cambia de alto. |
| `panel` | 350 | Panel que entra desde un borde — Quick View, menú de pantalla completa. |
| `settle` | 400 | Contenido que aparece dentro de algo que acaba de abrirse. |
| `enter` | 500 | Entrada de un bloque al montarse (párrafo, fila de botones). |
| `reveal` | 600 | Revelado al entrar en el viewport al hacer scroll. |
| `count` | 1100 | Un número contando. El único caso donde la duración **es** el efecto. |

Escalonados: `STAGGER.word` = 55 ms entre palabras de un titular,
`STAGGER.item` = 60 ms entre elementos de una lista.

**Por qué los nombres dicen el uso y no el número.** `MOTION.panel` sigue siendo
el nombre correcto si mañana decidimos que 350 ms es demasiado. `MOTION.ms350`
habría que renombrarlo o mentiría.

**La regla que ordena la tabla:** la duración la fija la distancia recorrida, no
el gusto. Se lee de arriba abajo como «de lo que no se mueve a lo que cruza más
pantalla».

**Los valores son los que ya estaban.** La escala nombra lo que había; no
retimó nada. Eso hizo que adoptarla fuera verificable —cero cambios visuales— y
deja la discusión sobre si 350 ms es el número correcto para cuando se pueda
ver el sitio moverse de verdad.

### En CSS

Solo cuatro de los diez existen en CSS, porque son los únicos que se usan ahí:

```css
--motion-tint: 150ms;
--motion-nudge: 250ms;
--motion-collapse: 300ms;
--motion-enter: 500ms;
```

Se usan como `duration-[var(--motion-collapse)]`.

**Y además** el sistema pisa los valores por defecto de Tailwind:

```css
--default-transition-duration: var(--motion-tint);
--default-transition-timing-function: var(--ease-sunny);
```

Eso alinea de golpe los **28 sitios que escriben `transition-colors` a secas**
—casi todos botones y enlaces del panel— sin tocar una sola clase. Es la parte
que no se hizo la vez anterior, y por eso el panel se había quedado con la
curva por defecto de Tailwind mientras el sitio público usaba la suya.

Comprobado en el CSS compilado:

```css
.transition-colors{ …; transition-timing-function:var(--tw-ease,var(--ease-sunny));
                       transition-duration:var(--tw-duration,var(--motion-tint)) }
```

---

## 3. Las cinco reglas

### 3.1 El movimiento confirma; no decora

Cada animación responde a una pregunta que alguien se está haciendo: *¿me oyó?*,
*¿de dónde salió esto?*, *¿a dónde volvió?* Si no responde a ninguna, sobra.

### 3.2 Lo que aparece dice de dónde vino

El Quick View entra desde el borde derecho en escritorio y desde abajo en móvil,
y **sale por donde entró**. Eso enseña dónde vive el panel respecto de la página
sin una palabra.

### 3.3 Nada que se mueva puede empujar lo que está al lado

Un indicador de carga que cambia el ancho de un botón mueve la fila entera. Se
reserva el espacio siempre y se anima solo la opacidad.

La documentación de Next lo dice literalmente de su propio indicador:
*«Inline indicators can easily introduce layout shifts. Prefer a fixed-size,
always-rendered hint element.»*

### 3.4 Nada parpadea

Un indicador que aparece y desaparece en una décima de segundo no informa de
nada; solo transmite nerviosismo. Todo indicador de «en curso» entra tras
`--motion-pending-delay` (100 ms), empezando invisible.

Con una advertencia que costó un intento aprender: **si retrasas la entrada del
indicador, tienes que retrasar igual la salida de lo que va a tapar.** Si no, la
etiqueta desaparece al instante, el indicador tarda 100 ms, y toda acción rápida
enseña un botón vacío. Por eso hay `.pending-indicator` **y** `.pending-label`.

### 3.5 «Sin movimiento» significa sin movimiento

`prefers-reduced-motion` no es un descuento del 50 %. Quien lo activa suele
hacerlo por vértigo o migraña.

Y aquí está la trampa que se comió ocho componentes de este proyecto:

> El bloque global de `globals.css` anula `transition-duration` y
> `animation-duration` **de CSS**, y nada más. Un `transform` animado por
> `motion/react` no es ninguna de las dos cosas. Se lo salta entero.

Es un fallo silencioso perfecto: el ajuste está puesto, el bloque global existe,
y aun así la pantalla se mueve. `HoverLift` —que envuelve todas las tarjetas de
experiencia, lo que más aparece en el sitio— llevaba meses así.

**Regla:** si declaras `x`, `y`, `scale` o `height` en un `initial`, `animate` o
`exit`, tienes que ofrecer una versión quieta. `tests/unit/motion-system.test.ts`
lo comprueba en cada `npm test`.

---

## 4. Cómo se escribe una animación nueva

```tsx
import { EASE, MOTION } from "@/lib/motion";
import { useReducedMotion } from "motion/react";

const still = useReducedMotion() ?? false;

<motion.div
  initial={{ opacity: 0, y: still ? 0 : 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: MOTION.enter, ease: EASE }}
/>
```

O, si no hay retraso ni nada raro, el atajo:

```tsx
import { transition } from "@/lib/motion";

<motion.div transition={transition("panel")} />
```

`transition()` incluye siempre la curva. Existe justo porque olvidarla es lo que
dejó tres telones de modal entrando con una aceleración distinta a la del panel
que aparecía encima.

En CSS:

```tsx
className="transition-transform duration-[var(--motion-collapse)] ease-sunny"
```

## 5. Lo que las pruebas no dejan hacer

`tests/unit/motion-system.test.ts` falla si:

1. Alguien escribe `0.22, 1, 0.36, 1` a mano en vez de usar `EASE`.
2. Alguien escribe `duration-300` en vez de `duration-[var(--motion-collapse)]`.
3. Alguien anima `x`/`y`/`scale`/`height` desde JS sin consultar
   `useReducedMotion`.
4. La escala deja de estar ordenada, o algo se pasa de 600 ms sin ser el
   contador.

Ninguna de las cuatro comprueba que las animaciones se vean bien —eso no se
automatiza—. Comprueban que la siguiente se escriba con el sistema en vez de a
mano, que es la parte que se deshace sola.
