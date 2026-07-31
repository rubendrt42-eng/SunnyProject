# Sunny — Auditoría de movimiento

Rama base `claude/sunny-mvp-1-1-design-admin` en `452c488`, sirviendo en
`sunny-project-teal.vercel.app`.

Todo lo que sigue está leído del código y contado. Donde digo un número, es un
número que salió de un `grep`, no una impresión.

---

## 0. Antes de nada: qué pude observar y qué no

| Quería observar | ¿Pude? |
|---|---|
| El código de movimiento completo | **Sí** — 17 archivos, 22 transiciones JS, 14 CSS |
| `sunny-project-teal.vercel.app` (HTML servido) | **Sí**, con `curl` |
| El Preview `sunny-project-ddzhb2skf-…` | **No** — está detrás del SSO de Vercel, redirige a `vercel.com/login` |
| **El sitio de referencia (Titan)** | **No.** No hay ninguna mención a Titan en el repositorio, y Chromium no sale a internet desde este entorno |
| Las animaciones corriendo de verdad, en pantalla | **No.** Sin navegador con red no puedo grabar ni medir fotogramas |

Esto último importa y no lo voy a disimular: **esta auditoría es de código, no de
pantalla.** Puedo decir con certeza qué curva y qué duración tiene declarada cada
animación, y puedo detectar incoherencias y defectos estructurales. No puedo
decirte «esto se siente lento» porque no lo he visto moverse.

Donde encontré un defecto, es un defecto demostrable leyendo el archivo, y digo
en qué línea está.

---

## 1. Lo que ya está bien (y no voy a tocar)

Conviene decirlo primero porque cambia el tamaño del trabajo: **la capa de
movimiento en JavaScript ya es casi un sistema.**

De 22 transiciones declaradas con `motion/react`, **20 usan exactamente la misma
curva**: `[0.22, 1, 0.36, 1]`. Eso no es casualidad, es criterio sostenido a lo
largo de meses de trabajo. La identidad de movimiento del sitio ya existe.

También está resuelto:

- **8 de los 14 componentes de `components/motion/` consultan
  `useReducedMotion()`** y degradan de verdad, no de mentira.
- `globals.css:141` tiene el bloque global de `prefers-reduced-motion` que mata
  animaciones y transiciones CSS.
- `WordReveal` tiene un `sr-only` con el texto completo — se arregló un fallo
  real de accesibilidad donde el h1 del hero no existía para un lector de
  pantalla.
- `QuickView` cierra por `history.back()` en los tres caminos (Escape, fondo,
  botón X), así que el botón «atrás» del teléfono cierra el panel en vez de
  salirse de la página. Eso es coreografía bien pensada.
- `Button` (`components/ui/Button.tsx`) ya tiene **estado de carga de primera
  clase**: spinner, etiqueta en gerundio, `disabled`, y `aria-busy`.

El trabajo, entonces, no es «añadir movimiento». Es **cerrar las fugas**.

---

## 2. Los defectos

### 2.1 El panel de Emmy no da señal de que la haya oído — ALTO

Este es el hallazgo grave, y es del panel, no del sitio público.

`components/admin/ReservationRowActions.tsx` guarda un estado `loading` por
acción (línea 10) y lo usa **solo** para desactivar los botones:

```tsx
disabled={loading !== null}
className="rounded-md border border-emerald-300 px-2.5 py-1 text-xs … hover:bg-emerald-50"
```

Fíjate en lo que no está en ese `className`: **no hay `disabled:opacity-50`.**
Ninguno de los cuatro botones lo tiene. Los demás componentes del panel sí
(`BusinessRowActions.tsx:60`, `ExperienceRowActions.tsx:173`,
`AdminListControls.tsx:53`).

El resultado concreto: Emmy pulsa «Asistió», empieza una petición de red, y
**en la pantalla no cambia absolutamente nada** hasta que la respuesta vuelve y
`router.refresh()` repinta la fila. Los botones están desactivados pero se ven
idénticos. Con una conexión lenta en la puerta de un estudio de pilates, eso es
exactamente el momento en que se vuelve a pulsar.

Y hay un `loading` que ya sabe cuál acción está en curso. La información existe;
simplemente no se dibuja.

### 2.2 El panel no usa el botón del sistema de diseño — ALTO

Conté los usos de `Button` en todo `app/admin/` y `components/admin/`:

```
0
```

Cero. De `@/components/ui/` el panel solo importa `Badge` y `EmptyState`. Todos
los botones del panel son `<button>` crudos con clases sueltas.

Eso explica el punto anterior: el estado de carga con spinner y `aria-busy` ya
estaba resuelto en `Button`, y el panel no se enteró. No es que faltara diseñar
la solución — es que había dos implementaciones y una se quedó atrás.

### 2.3 El indicador de «ocupado» mueve el botón de sitio — MEDIO

`ExperienceRowActions.tsx:180`:

```tsx
{busy ? "…" : label}
```

Cuando la acción está en curso, «Publicar» se convierte en «…». El botón se
encoge de golpe y **los botones de al lado saltan**. La documentación de Next
avisa de esto textualmente para su propio indicador de navegación: *«Inline
indicators can easily introduce layout shifts. Prefer a fixed-size,
always-rendered hint element.»*

Es la única animación del panel y es una que empuja el resto de la interfaz.

### 2.4 Navegar dentro del panel no tiene ninguna respuesta — MEDIO

`AdminNav` y el paginador (`AdminListControls.tsx:92,103`) son `<Link>` a rutas
con `export const dynamic = "force-dynamic"` — es decir, **siempre hay ida y
vuelta al servidor y nunca hay prefetch útil**. Emmy pulsa «Página 2», el
servidor consulta Supabase, y durante ese rato la pantalla está congelada
mostrando la página 1. No hay `loading.tsx` en ninguna ruta de `/admin`:

```
$ find app/admin -name "loading.tsx"   →  (nada)
```

Next 16 tiene `useLinkStatus` justo para esto, y este proyecto está en 16.2.12.

### 2.5 `HoverLift` ignora `prefers-reduced-motion` — MEDIO

`components/motion/HoverLift.tsx` es el **único** primitivo de movimiento del
proyecto que no llama a `useReducedMotion()`. Sus hermanos —`InViewReveal`,
`LineReveal`, `WordReveal`, `FloatingChip`, `CountUp`, `ParallaxImage`,
`SessionLoader`, `SmoothScrollProvider`— todos lo hacen.

Y el bloque global de `globals.css:141` **no lo cubre**: ese bloque anula
`transition-duration` y `animation-duration` de CSS. `HoverLift` anima con
`transform` desde JavaScript, que no es ni una transición CSS ni una animación
CSS. Sigue moviéndose.

`HoverLift` envuelve las tarjetas de experiencia, que es lo que más se toca del
sitio. Alguien que pidió que las cosas no se muevan, ve moverse las tarjetas.

### 2.6 Dos escalas de tiempo que no se conocen entre sí — MEDIO

| Capa | Valores en uso |
|---|---|
| JS (`motion/react`) | 250, 300, 350, 400, 500, 600, 650, 1100 ms |
| CSS (Tailwind) | 150, 200, 300, 500 ms |

Coinciden en 300 y 500 por accidente, no por decisión. `200` existe una sola vez
(`CategoriesSection.tsx:71`). `650` existe una sola vez
(`SessionLoader.tsx:55`).

Ninguno de los 36 valores tiene nombre. Están escritos a mano, número a número,
en 22 archivos. Cambiar el ritmo del sitio hoy es una búsqueda y reemplazo con
riesgo de olvidar uno — que es exactamente cómo se llegó a tener 8 duraciones
distintas.

### 2.7 Tres fondos oscuros se atenúan con la curva equivocada — BAJO

Los tres telones de fondo modales declaran duración pero **no declaran curva**:

- `QuickView.tsx:120` → `{ duration: 0.25 }`
- `AnimatedModal.tsx:53` → `{ duration: 0.25 }`
- `FullscreenMenu.tsx:58` → `{ duration: 0.25 }`

Sin `ease`, Motion aplica su curva por defecto, que no es la del sistema. Es
sutil —es una opacidad— pero significa que el fondo y el panel que aparece
encima entran con dos aceleraciones distintas.

### 2.8 El cargador de sesión usa dos curvas propias — BAJO

`SessionLoader.tsx:46` usa `[0.65, 0, 0.35, 1]` y la línea 55 usa `"easeInOut"`.
Son las dos únicas excepciones a `[0.22, 1, 0.36, 1]` en todo el proyecto.

En este caso concreto **puede estar justificado**: una cortina que sube quiere
una curva simétrica, no una que frena al final. Lo dejo señalado como decisión a
tomar conscientemente, no como error a corregir.

---

## 3. Resumen

| # | Hallazgo | Dónde | Gravedad |
|---|---|---|---|
| 2.1 | Acciones del panel sin ninguna señal visible | `ReservationRowActions.tsx` | **Alto** |
| 2.2 | El panel no usa `Button` del sistema | `components/admin/*` | **Alto** |
| 2.3 | El indicador de ocupado desplaza la interfaz | `ExperienceRowActions.tsx:180` | Medio |
| 2.4 | Navegación del panel sin respuesta | `AdminNav`, `AdminListControls` | Medio |
| 2.5 | `HoverLift` no respeta reduced-motion | `HoverLift.tsx` | Medio |
| 2.6 | Dos escalas de tiempo sin nombre | 22 archivos | Medio |
| 2.7 | Telones sin curva declarada | 3 archivos | Bajo |
| 2.8 | Dos curvas propias en el cargador | `SessionLoader.tsx` | Bajo (decisión) |

**Nada de esto está roto.** El sitio se mueve y se mueve bien. Lo que hay es una
capa pública cuidada y un panel que se quedó sin la misma atención, más un
sistema de tiempos que existe de facto pero no está escrito en ninguna parte.
