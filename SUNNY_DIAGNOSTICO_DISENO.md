# Sunny — Diagnóstico de diseño

Todo lo de aquí está **medido**, no opinado. La telemetría se recogió con
Playwright sobre el build de producción (`pnpm build` + `pnpm start`) con datos
en las 7 rutas públicas, recorriendo cada página entera para que las
animaciones de entrada terminen antes de medir. Los conteos de código salen de
`grep` sobre `app/` y `components/`.

Está ordenado por impacto, no por esfuerzo.

---

## 1. Hay dos lenguajes visuales conviviendo en el sitio — CRÍTICO

El rediseño llegó a tres pantallas. Las otras nueve se quedaron en la versión
anterior, y la diferencia se nota al cambiar de página: el titular pasa de una
sans negra y apretada a una serif en cursiva.

Tratamiento del `<h1>` de cada página pública:

| Tratamiento | Páginas | Cuáles |
|---|---|---|
| `text-display` (escala nueva) | 2 | `/experiencias`, y el Home vía `Hero` |
| `font-serif text-4xl italic` (lenguaje anterior) | **8** | `/como-funciona`, `/para-negocios`, `/preguntas-frecuentes`, `/terminos`, `/privacidad`, `/mi-pase`, `/mi-cuenta`, `/historial` |
| Suelto, ni una cosa ni la otra | 1 | `/acceso` — `text-3xl font-semibold tracking-tight` |

Son **tres** voces distintas para el mismo producto. Es, con diferencia, lo que
más barato sale de arreglar y más cambia la percepción de conjunto.

**Corrección a lo que te dije antes:** cuando subí el peso del display a 800 y
el del title a 700, te reporté que los títulos quedaban más marcados. Es cierto,
pero solo alcanzó a las páginas que leen la escala — es decir, a 2 de 12. En el
resto no cambió nada. Ver el punto 2.

---

## 2. La escala tipográfica existe pero el 59% de los títulos la salta — ALTO

`app/globals.css` define una escala nombrada (`display`, `title`, `subtitle`,
`heading`) precisamente para que ningún componente invente tamaños. En la
práctica:

| | Usos |
|---|---|
| Escala nombrada (`text-display/title/subtitle/heading`) | 50 |
| Tamaños sueltos de Tailwind (`text-xl` … `text-6xl`) | **72** |
| `font-semibold` suelto | 77 |

En la página renderizada eso se traduce en **15 tamaños de tipo distintos** y
**5 pesos**, con el peso 600 apareciendo 173 veces frente a 14 del 700 y 9 del
800. Los tokens nuevos casi no se ven porque casi nadie los lee.

Hay además dos tamaños arbitrarios muy pequeños en circulación —**10.4 px y
11.2 px** (`text-[0.65rem]`, `text-[0.7rem]`)— usados en los badges. A ese
tamaño el texto es difícil de leer y no está en ninguna escala.

---

## 3. El Home mide 12.376 px — ALTO

Con 12 secciones y 11 `<h2>`. Para comparar, en la misma pantalla:

| Ruta | Alto | Secciones |
|---|---|---|
| `/` | **12.376 px** | 12 |
| `/experiencias` | 3.310 px | 1 |
| `/experiencias/[slug]` | 1.881 px | 1 |
| `/como-funciona` | 1.418 px | 1 |

El Home es **3,7 veces** el catálogo y unas 14 pantallas de scroll. Once
titulares de nivel 2 compiten entre sí, así que ninguno destaca. La consecuencia
de producto es que lo que de verdad vende —las experiencias de la semana— queda
diluido entre secciones explicativas.

No propongo borrar contenido a ciegas: propongo decidir qué tres secciones
sostienen la página y mover el resto a `/como-funciona`, que hoy está casi
vacía (punto 4).

---

## 4. `/como-funciona` y `/para-negocios` no tienen ni una fotografía — ALTO

Cero elementos `<img>` en ambas. Y las dos son **más pobres que su propio
resumen en el Home**:

- El Home tiene `HowItWorksNarrative`: recorrido con scroll, barra de progreso
  y experiencias reales como apoyo visual. `/como-funciona` es una lista 01/02/03
  en texto gris pequeño y una caja de reglas.
- El Home tiene `ForBusinessSection` con fotografía. `/para-negocios` es un
  formulario sobre fondo liso.

Quien llega desde el menú a la página dedicada ve menos que quien no salió del
Home. Debería ser al revés.

---

## 5. Los radios de borde no siguen el sistema — MEDIO

`globals.css` declara `--radius-xs: 4px`, `sm: 8px`, `md: 10px`, `lg: 14px`.
El código usa además:

| Fuera del sistema | Usos |
|---|---|
| `rounded-2xl` (16 px) | 19 |
| `rounded-xl` (12 px) | 7 |
| `rounded-[20px]` | 4 |
| `rounded-3xl` (24 px) | 1 |

**31 usos fuera de escala**, casi todos en tarjetas — que son justo el elemento
que más se repite. El resultado es que dos tarjetas contiguas pueden tener
esquinas distintas. O el sistema sube su tope a 16 px y se aplica, o las
tarjetas bajan a 14 px. Cualquiera de las dos, pero una sola.

---

## 6. Las separaciones tampoco tienen sistema — MEDIO

**13 valores de `gap` distintos** en circulación: 4, 6, 8, 12, 16, 20, 24, 28,
32, 40, 48, 56 y 64 px. Los de 4, 6, 20 y 28 px no pertenecen a ninguna escala
declarada. El padding vertical de sección, en cambio, sí es consistente
(112 px en 10 de 13 secciones), así que el problema está en el interior de los
componentes, no en el ritmo general de la página.

---

## 7. Las preguntas frecuentes no son encabezados — BAJO

`/preguntas-frecuentes` tiene **0 elementos `<h2>`**: cada pregunta es un
`<summary>` dentro de un `<details>`. Funciona y es accesible al teclado, pero
ni los buscadores ni la navegación por encabezados de un lector de pantalla ven
la estructura de la página. Un `<h2>` dentro de cada `<summary>` lo resuelve sin
cambiar nada visual.

---

## 8. Dos patrones para el mismo control — BAJO

`HeroFeaturedRotator` se eliminó, pero queda la incoherencia que documentaba:
`CarouselDots` usa `role="tablist"` / `role="tab"`, mientras otros carruseles
etiquetan con `aria-label` + `aria-current`. Conviene un solo patrón.

---

## Orden sugerido

1. **Unificar el `<h1>` de las 9 páginas rezagadas** a la escala nueva. Es el
   cambio con más efecto visible por menos riesgo, y desbloquea que futuros
   ajustes de tipografía se noten en todo el sitio.
2. **Sustituir los 72 tamaños sueltos** por la escala nombrada, y sacar los
   10.4/11.2 px de los badges.
3. **Decidir la longitud del Home** y llevar lo explicativo a `/como-funciona`.
4. **Dar contenido visual** a `/como-funciona` y `/para-negocios`.
5. Cerrar radios y separaciones a una sola escala.
6. Encabezados en las FAQ y un patrón único de carrusel.

Los puntos 1, 2, 5, 6 y 7 son mecánicos y verificables: se pueden hacer sin
decisiones de producto. Los puntos 3 y 4 sí las requieren — qué se cuenta en el
Home y qué material fotográfico existe para las páginas secundarias.
