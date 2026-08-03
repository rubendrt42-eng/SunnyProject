# Sunny — QA de movimiento

Rama `claude/sunny-motion-choreography`. Compilación de producción servida
localmente contra un doble de Supabase (el proyecto real no es alcanzable desde
este entorno). Chromium 1194, Playwright 1.62.

Todo número de aquí salió de una medición. Donde no pude medir, lo digo.

---

## 1. Compuertas

| | |
|---|---|
| `npm run lint` | ✓ |
| `npm run typecheck` | ✓ |
| `npm test` | **119 pasan**, 9 omitidas (eran 107 antes de esta fase) |
| `npm run build` | ✓ compila en 6.9 s |

Las 12 pruebas nuevas son las del sistema de movimiento y las de
`AdminActionButton`.

---

## 2. Lo que se comprobó moviéndose de verdad

Esto es lo que no pude hacer en la auditoría —que fue de código— y sí aquí.

### 2.1 `prefers-reduced-motion` ahora se respeta. Medido

`HoverLift`, leyendo el `transform` calculado del envoltorio antes y después de
pasar el cursor por una tarjeta del catálogo:

| Ajuste | Antes | Después de 500 ms |
|---|---|---|
| `no-preference` | `none` | `matrix(1, 0, 0, 1, 0, -3)` |
| `reduce` | `none` | **`none`** |

Es decir: con movimiento normal la tarjeta sube (capturada a mitad del
recorrido, camino de los −6 px); con el ajuste puesto **no se mueve en
absoluto**. Antes de esta fase se movía en los dos casos.

`WordReveal` en el titular del hero, tras la hidratación:

| Ajuste | Spans animados por palabra | Opacidad del h1 |
|---|---|---|
| `no-preference` | 6 | 1 |
| `reduce` | **0** | 1 |

Bajo `reduce` no se genera ni una palabra animada: el titular aparece entero.

> **Una corrección sobre mi propia medición.** La primera pasada de este script
> reportó 6 spans en los dos modos, y 218 px de desplazamiento de la tarjeta en
> los dos modos. Las dos cifras eran mías, no del producto: medí los spans
> antes de que terminara la hidratación (el HTML del servidor no puede conocer
> el ajuste del navegador), y los 218 px eran el scroll que hace `hover()` para
> poner el elemento a la vista, no el lift. Repetido correctamente, salen los
> números de las tablas de arriba.

### 2.2 El panel de Quick View entra desde el borde y aterriza

| Momento | `transform` del `[role="dialog"]` |
|---|---|
| 60 ms después de abrirlo | `matrix(1, 0, 0, 1, 181.5, 0)` |
| 500 ms después | `none` |

Recorre el eje X y termina en 0. Confirma que la geometría de
`lib/quick-view-motion.ts` funciona y que el panel no queda varado —que fue un
fallo real en su día, con el panel aparcado una pantalla por debajo del pliegue.

### 2.3 El sistema llegó al CSS compilado

```css
.transition-colors{ … ;
  transition-timing-function: var(--tw-ease, var(--ease-sunny));
  transition-duration:        var(--tw-duration, var(--motion-tint)) }
```

Los **28 sitios** que escriben `transition-colors` a secas —casi todos botones y
enlaces del panel— quedaron alineados con la curva del producto sin tocar una
sola clase.

### 2.4 Nada se rompió por el camino

| Comprobación | Resultado |
|---|---|
| Scroll horizontal — 5 rutas × 6 anchos (375→1440) | **0 fallos en 30 combinaciones** |
| `axe-core` WCAG 2.1 AA — 6 rutas × 2 viewports | **0 hallazgos** |

---

## 3. Lo que NO se pudo comprobar

Dicho sin adornos, porque es la mitad honesta del informe.

### 3.1 El panel de Emmy, en pantalla, con sesión

**Es el trabajo principal de esta fase y no lo he visto correr.** Chromium no
sale a internet desde este entorno, y la sesión simulada contra el doble la
rechaza el middleware, que valida contra Supabase de verdad.

Lo que sí está comprobado del panel:

- `AdminActionButton` tiene 5 pruebas unitarias que verifican la **propiedad**
  que arregla el defecto: que la etiqueta sigue montada mientras la acción
  corre. Esa es la causa del salto de la fila —`busy ? "…" : label` la
  desmontaba—, así que si sigue en el documento, el botón conserva su ancho.
  jsdom no calcula diseño, de modo que no puedo dar el ancho en píxeles.
- `aria-busy`, el texto de estado para lectores de pantalla, y que un segundo
  clic no dispara la acción: comprobados.

Lo que **no** está comprobado: cómo se ve el giro, si 100 ms de retraso es el
número correcto en la práctica, y `NavPending` funcionando durante una
navegación real. La lógica de `useLinkStatus` es la que documenta Next para
este caso exacto (ruta dinámica, sin `loading.tsx`), pero no la he visto
disparar.

**Qué hacer con esto mañana:** entra al panel, pulsa «Asistió» en una
reservación y «Siguiente» en una lista. Son 20 segundos y confirman las dos
cosas.

### 3.2 El sitio de referencia (Titan)

No existe en el repositorio y no es alcanzable. Ver
`SUNNY_TITAN_MOTION_ANALYSIS.md` §0.

### 3.3 Fotogramas

No puedo grabar ni medir *jank*. Puedo decir qué anima y con qué curva; no
puedo decir si va a 60 fps en un teléfono de gama media.

---

## 4. Un hallazgo nuevo, encontrado mientras medía

**El titular del hero depende de JavaScript para ser visible.** — MEDIO

El HTML que sirve el servidor trae las palabras así:

```html
<span aria-hidden="true" class="inline-block whitespace-pre"
      style="opacity:0;transform:translateY(0.6em)">Descubre </span>
```

`opacity: 0` viene en el marcado. Si el JavaScript no llega a ejecutarse —red
mala, bundle bloqueado, un error en otro componente— **el titular de la portada
no se ve**. El texto para lectores de pantalla sí está (`sr-only`), así que la
accesibilidad está cubierta; es el ojo el que se queda sin nada.

No es regresión de esta fase: es así desde que existe `WordReveal`. No lo he
tocado porque arreglarlo bien significa cambiar lo que renderiza el servidor, y
eso no es algo que quiera empujar la noche antes de una presentación. **Lo dejo
señalado para decidirlo con calma.**

---

## 5. Resumen de lo que cambió

| Hallazgo de la auditoría | Estado |
|---|---|
| 2.1 Acciones del panel sin señal visible | **Resuelto** (verificado en pruebas, no en pantalla) |
| 2.2 El panel no usa el botón del sistema | **Resuelto** — `AdminActionButton` en los tres componentes de fila |
| 2.3 El indicador desplaza la interfaz | **Resuelto** — la etiqueta ya no se desmonta |
| 2.4 Navegación del panel sin respuesta | **Resuelto** (`NavPending`, sin verificar en pantalla) |
| 2.5 `HoverLift` ignora reduced-motion | **Resuelto y medido** |
| 2.6 Dos escalas de tiempo sin nombre | **Resuelto** — `lib/motion.ts` + `--motion-*` |
| 2.7 Telones sin curva declarada | **Resuelto** |
| 2.8 Dos curvas propias en el cargador | **Sin tocar, a propósito** |
| — | **+7 componentes más** que se saltaban reduced-motion, encontrados por la prueba nueva |

Y una guardia para que no se vuelva a deshacer solo:
`tests/unit/motion-system.test.ts` falla si alguien escribe la curva a mano,
usa `duration-300` en vez del token, o anima un `transform` desde JavaScript sin
consultar `useReducedMotion`.
