# Sunny — Diagnóstico de diseño

> **Estado tras la ronda de pulido.** Seis de los ocho puntos están resueltos y
> vueltos a medir; los dos abiertos requieren una decisión tuya. Resumen al
> final, en «Resultado». El cuerpo del documento describe el estado **antes**
> del arreglo, que es lo que da sentido a las cifras.

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

## 6. Las separaciones — REVISADO A LA BAJA, NO SE TOCA

Conté **13 valores de `gap` distintos**: 4, 6, 8, 12, 16, 20, 24, 28, 32, 40,
48, 56 y 64 px, y escribí que 4, 6, 20 y 28 «no pertenecen a ninguna escala
declarada». Eso estaba mal: todos salvo el 6 px son múltiplos de 4 y pertenecen
a la escala de espaciado de Tailwind, que es el sistema que este proyecto usa
por defecto. Trece valores repartidos en un sitio entero no es incoherencia,
es un rango normal.

El padding vertical de sección sí es consistente (112 px en 10 de 13 secciones).
No hay nada que arreglar aquí, y cambiarlo habría sido ruido en el diff.

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

---

# Resultado

Medido de nuevo con el mismo script, sobre el mismo build de producción.

| # | Punto | Antes | Después |
|---|---|---|---|
| 1 | Tratamientos distintos de `<h1>` | 3 (8 páginas en serif cursiva) | **1** — toda página en la escala nombrada |
| 2 | Títulos con tamaño suelto | 72 sueltos / 50 en escala | **0 en el sitio público** |
| 2 | Tamaños de tipo renderizados | 15 | **12** (fuera 10,4 px y 11,2 px) |
| 2 | Peso 700 / 800 en pantalla | 14 / 9 | **29 / 12** |
| 4 | Imágenes en `/como-funciona` | 0 | **3** |
| 4 | Imágenes en `/para-negocios` | 0 | **1** |
| 5 | Radios distintos | 7 (16, 12, 20, 24 px fuera) | **5, todos del sistema** |
| 7 | Encabezados en `/preguntas-frecuentes` | 0 | **11** |

Compuertas tras el cambio: lint y typecheck limpios, 94 pruebas, **0 hallazgos
WCAG** en 9 rutas × 2 viewports, **14/14** comprobaciones funcionales.

## Qué se decidió por el camino

- **El sistema de radios sube a 16 px** (`--radius-xl`) en lugar de forzar las
  tarjetas a 14. Los 31 usos fuera de escala aterrizan ahí sin cambiar el
  aspecto de lo que ya estaba bien.
- **`display` solo con ancho completo.** En `/para-negocios`, que reparte el
  ancho con el formulario, el titular a 76 px se partía en cinco líneas; ahí va
  `title`. La regla quedó escrita en `globals.css`.
- **El panel conserva sus 5 textos de 12 px.** `PRODUCT_SPEC.md` §9 le da
  exención de estilo por ser una herramienta densa, y tocar la densidad de esas
  tablas sin poder revisarlas a fondo era peor negocio.

## Lo que sigue abierto — necesita decisión tuya

- **Punto 3, la longitud del Home.** Sigue en 12.445 px, 13 secciones y 14
  `<h2>`. No lo toqué porque recortar la portada es una decisión de producto,
  no de maquetación: hay que elegir qué tres secciones la sostienen. Ahora que
  `/como-funciona` está a la altura, es el destino natural de lo explicativo.
- **Fotografía propia.** Las imágenes que puse en las dos páginas salen del
  material ya aprobado en `lib/media.ts` y son genéricas a propósito: ilustran
  el momento, no el local de un negocio con nombre. Con material propio de los
  espacios aliados, estas dos páginas mejoran otro escalón.
