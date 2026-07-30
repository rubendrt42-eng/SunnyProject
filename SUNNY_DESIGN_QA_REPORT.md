# Sunny — Reporte de QA visual y funcional (MVP 1.1)

Rama `claude/sunny-mvp-1-1-design-admin`. Este documento registra **lo que realmente se probó, cómo, y qué se encontró** — incluyendo los defectos que encontré en mi propio trabajo y en el código previo.

---

## 1. Cómo se probó (y la limitación que hubo que resolver)

**Problema**: Supabase no es alcanzable desde este entorno (`Host not in allowlist: qtygzhvzuzllpzssqbzw.supabase.co`). Sin datos, cada página renderiza su estado vacío y **los diseños con contenido no se podrían haber revisado**.

**Solución**: se levantó un servidor local que imita el subconjunto de la API REST de Supabase que la app usa (6 experiencias, 6 negocios, conteos de reservación, un perfil admin). Vive **fuera del repositorio**, en el scratchpad de la sesión; no es parte de la app y no se commiteó. El `.env.local` se apuntó a él durante la sesión de QA y **se restauró al valor original al terminar** (verificado).

Eso permitió revisar las páginas **con datos reales de forma**: seis experiencias con fotografía, badges de modalidad, un Sunny Original, disponibilidad calculada, y el panel completo con sesión de administradora.

**Lo que sigue sin probarse y por qué** (ver §5): magic link real, reservación real contra Postgres, y las migraciones.

---

## 2. Capturas generadas — 24

| # | Captura | Viewport |
|---|---|---|
| 01 | Home | 1440 |
| 02 | Home | 390 |
| 03 | Catálogo | 1440 |
| 04 | Catálogo | 390 |
| 05 | Detalle de experiencia | 1440 |
| 06 | Detalle de experiencia | 390 |
| 07 | Quick View (`?ver=`) | 1440 |
| 08 | Quick View (bottom sheet) | 390 |
| 09 | Acceso | 1440 |
| 10 | Home | 768 |
| 11 | Catálogo | 1024 |
| 12 | Home | 430 |
| 13 | Home | 375 |
| 14 | `/admin` sin sesión → redirección | 1440 |
| 20 | Panel · Dashboard | 1440 |
| 21 | Panel · Experiencias | 1440 |
| 22 | Panel · Reservaciones | 1440 |
| 23 | Panel · Negocios | 1440 |
| 24 | Panel · Usuarios | 1440 |
| 25 | Panel · Solicitudes | 1440 |
| 26 | Panel · Dashboard | 390 |
| 27 | Panel · Experiencias | 390 |
| 28 | Mi pase | 1440 |
| 29 | Panel · Nueva experiencia | 1440 |

Las capturas son artefactos de sesión (13 MB) y **no se commitearon** al repositorio.

---

## 3. Defectos encontrados y corregidos

Los cuatro primeros salieron de mirar las capturas y de medir el DOM — ninguno se habría visto compilando.

### 3.1 Scroll horizontal accidental en Home (150 px a 375 px) — CORREGIDO

El brief §40 lo prohíbe explícitamente. Medido con Playwright: `documentElement.scrollWidth − innerWidth` daba **150 px a 375, 135 a 390, 95 a 430**.

Diagnóstico (midiendo `min-content` de cada hijo del grid): la columna de tarjetas secundarias de "Esta semana" reportaba **505 px de min-content** en un viewport de 375. La causa era la línea de metadatos con `truncate` (`white-space: nowrap`): su ancho intrínseco es el de la cadena completa —`"4 ago 2026 · 10:18 PM · Club Norte Pádel — Valle Oriente"`— y el grid lo respetaba, ensanchando la columna.

**Corrección**: `overflow-hidden` en la columna de texto (junto al `min-w-0` que ya tenía) y la línea de metadatos ahora **envuelve en vez de truncarse** — que además deja de esconder la zona, uno de los datos que más importa en un teléfono.

### 3.2 ~41 px de scroll horizontal fantasma en todas las páginas por debajo de 900 px — CORREGIDO

Tras 3.1 quedaba un residuo: `scrollWidth` excedía el viewport en ~41 px en **todas** las rutas, incluida `/acceso`, pero **ningún elemento sobresalía** (verificado recorriendo todo el DOM: 0 elementos con `right > innerWidth` fuera de contenedores con recorte). Era ancho scrolleable vacío.

**Corrección**: `overflow-x: clip` en `html`. Se eligió `clip` y no `hidden` a propósito: `hidden` convertiría la raíz en contenedor de scroll y rompería `position: sticky` del header y de la barra de filtros.

**Verificación correcta del arreglo**: `scrollWidth` sigue reportando el tamaño del contenido bajo `clip` (no crea contenedor de scroll), así que esa métrica dejó de servir. Se cambió a la pregunta real — *¿puede la persona hacer scroll lateral?* — con `window.scrollTo(500, 0)` y lectura de `scrollX`. **42 combinaciones** (7 rutas × 6 viewports): `scrollX` queda en 0 en todas. **PASA.**

### 3.3 Palabras pegadas en el titular del hero — CORREGIDO

La captura mostraba **"Descubre algonuevo. Vívelocon alguien."** Bug preexistente en `WordReveal`: el espacio final va *dentro* de un `inline-block`, donde se colapsa. Corregido con `whitespace-pre` en cada palabra. Verificado en la captura recortada: ahora lee correctamente.

### 3.4 Fotos ausentes en Categorías y Para negocios — CORREGIDO

`CATEGORY_COVER` y `ForBusinessSection` apuntaban a `/demo-assets/*.webp`, archivos **borrados dos fases atrás**, así que ambas secciones mostraban el estado "falta foto". Ahora apuntan a la biblioteca `public/media/sunny`. `outdoor` se deja a propósito sin foto: no hay ninguna imagen outdoor en los assets adjuntos, y prestarle una ajena sería justo el error que el manifiesto evita.

De paso se borró `CATEGORY_PHOTOS` y `demoPhotoForSlug` de `lib/media.ts`: quedaron sin uso y duplicaban la fuente de verdad.

### 3.5 `/admin` se servía a peticiones anónimas — CORREGIDO (defecto de seguridad, preexistente)

Ver el detalle completo en el commit de la Fase 5. Resumen: `redirect()` en el layout de admin **no impide** que la página se envíe — esta versión de Next documenta que en contexto de streaming inserta un `<meta http-equiv="refresh">` y responde **200 con todo el markup**. `curl http://.../admin` devolvía el panel completo (42 KB). No se filtraron datos privados (RLS restringe cada tabla a `is_admin()`), pero la estructura del panel sí salía. La compuerta se movió a `proxy.ts`, que ahora responde **307 sin cuerpo** (21 bytes, verificado). Seis pruebas lo fijan en `tests/unit/admin-gate.test.ts`.

### 3.6 Dos bugs en la migración de grupos — CORREGIDOS antes de escribir el archivo final

- Agregar parámetros a `claim_reservation` crea una **sobrecarga**, no un reemplazo: la función de 2 argumentos habría sobrevivido contando filas. `DROP` explícito + prueba 18 del plan.
- `reserved_counts_for_experiences` devuelve `integer` y Postgres no permite cambiar el tipo de retorno con `CREATE OR REPLACE`: ampliarlo a `bigint` habría hecho fallar la migración.

### 3.7 Un fixture propio mal escrito — CORREGIDO

Una prueba de capacidad usaba `party_size: 4`, que `partySizeOf()` recorta a 3 (techo del MVP). La prueba falló y tenía razón: el fixture estaba mal, el `clamp` bien.

---

## 4. Revisión visual de las capturas

| Aspecto | Resultado |
|---|---|
| Orden de secciones de Home | ✅ Coincide con §11 del brief |
| Ritmo de composición | ✅ Ninguna sección consecutiva repite layout |
| Jerarquía tipográfica | ✅ Un solo `text-display` por página; escala nombrada aplicada |
| Mayúsculas | ✅ Solo en eyebrows y en el sello Original |
| Serif | ✅ Solo en frases-ancla y el logotipo |
| Contraste sobre fotografía | ✅ Badges `onPhoto` legibles |
| Amarillo | ✅ Solo CTA, chip activo y sello; ningún fondo completo |
| Botones | ✅ Radio de 10 px, no cápsulas; píldora solo en filtros |
| Estados vacíos | ✅ Con icono, mensaje concreto y acción |
| Sello Sunny Original | ✅ Visible en tarjeta, quick view y panel |
| Badges de modalidad | ✅ Solo donde la experiencia los declara |
| Header con sesión admin | ✅ Muestra Mi pase · Mi cuenta · Panel |
| Sidebar del panel | ✅ Fijo en desktop, fila desplazable en móvil, activo con `aria-current` |
| Tablas del panel | ✅ Tabla en `sm:`+, tarjetas apiladas por debajo |
| Cortes / overlays | ✅ Ninguno detectado |
| Errores de consola | ✅ 0 en las 24 capturas |

**Observaciones menores no corregidas** (cosméticas, sin impacto funcional):
- El hero deja bastante aire arriba del eyebrow en 1440; la columna de texto está centrada verticalmente contra una foto más alta.
- La tarjeta rotatoria del hero solapa la parte baja de la fotografía y puede cubrir parte de una figura, según la imagen.
- `HeroFeaturedRotator` etiqueta sus puntos con `aria-label` + `aria-current`, mientras `CarouselDots` usa `role="tablist"`/`role="tab"`. Dos patrones para un mismo control; ambos son accesibles, pero conviene unificarlos.

---

## 4 bis. Segunda ronda de QA — auditoría WCAG automatizada

Esta ronda se corrió **contra el build de producción**, no contra `next dev`.
Motivo: una primera pasada contra el servidor de desarrollo reportó todo el
hero invisible (`opacity: 0`, `translateY(45.6px)`). No era un defecto: el
websocket de HMR no conecta desde este entorno (`ERR_INVALID_HTTP_RESPONSE`),
así que tras muchas ediciones el bundle del cliente quedó desincronizado del
HTML servido y la hidratación no aplicó las animaciones. En `pnpm build` +
`pnpm start` el hero se pinta correctamente y sin errores de consola. **Para
QA visual, `next dev` no es un objetivo confiable en este entorno.**

Herramienta: `axe-core` inyectado en la página (9 rutas × 2 viewports = 18
combinaciones), reglas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y
`best-practice`. `axe-core` vive solo en el scratchpad: **no** se agregó como
dependencia del proyecto.

Resultado inicial: 10 hallazgos en 2 reglas. Resultado final: **0 hallazgos**.

### 4b.1 El naranja de marca era ilegible como texto — CORREGIDO

`--color-orange` (`#ff7a3d`) se usaba a la vez como relleno y como color de
letra. Como texto puntuaba **2.29:1 sobre ivory** y **2.56:1 con warm-white
encima**; AA pide 4.5:1 para texto pequeño. Afectaba a los eyebrows, la
segunda línea del titular del hero, los numerales de los pasos, los badges
naranjas y **todos los mensajes de error de formulario** — el texto que más
falta hace leer era el más difícil de leer. `axe` solo marcó lo que se
renderizaba en las rutas visitadas; los errores de formulario no aparecen en
un estado de reposo, pero comparten exactamente la misma causa.

Corrección a nivel de token, no parche por parche:

| Token | Valor | Uso |
|---|---|---|
| `--color-orange` | `#ff7a3d` | Rellenos, contornos, foco. **Sin cambios.** |
| `--color-orange-ink` | `#bf4408` | Letras e iconos sobre fondo claro. **Nuevo.** |

Contraste de `orange-ink` medido: ivory 4.60 · warm-white 5.12 · white 5.19 ·
neutral-50 4.97. Todos pasan AA para texto pequeño.

Regla del sistema: **`orange` rellena, `orange-ink` escribe.** Se verificó
antes de aplicar que las 33 apariciones de `text-orange` estaban sobre
superficies claras, así que el cambio global es seguro. `text-orange-600`
(paleta por defecto de Tailwind, usada en dos formularios del panel para el
mismo propósito) se unificó a `orange-ink`.

Los dos rellenos que llevan texto encima cambiaron solo la letra, no el
relleno: `Badge tone="orange"` y la píldora de conteo de `AdminNav` pasaron de
`text-warm-white` (2.56:1) a `text-carbon` (**6.93:1**).

### 4b.2 El titular del hero no existía para un lector de pantalla — CORREGIDO

`WordReveal` ponía `aria-label={text}` en el elemento contenedor y marcaba
cada palabra como `aria-hidden`. Pero `aria-label` está **prohibido en un
`span` sin rol**, así que se ignoraba — y al estar todas las palabras
ocultas, el elemento quedaba **sin texto accesible alguno**. En Home eso
significa que el `h1`, que es la promesa completa del producto, no se
anunciaba. Detectado por `axe` (`aria-prohibited-attr`, gravedad *serious*).

Corregido con un nodo de texto realmente oculto a la vista (`sr-only`), que se
lee literalmente sea cual sea el elemento contenedor. Verificado: el nombre
accesible del `h1` es ahora "Descubre algo nuevo.Vívelo con alguien." y el
nodo mide 1×1 px con `clip-path: inset(50%)` — invisible en pantalla.

---

## 4 ter. Defectos funcionales encontrados con la prueba de humo

13 comprobaciones sobre el build de producción. Tres pasadas expusieron
defectos reales; dos "fallos" iniciales eran errores de la propia prueba
(buscaba botones donde el catálogo usa enlaces, y trataba `alt=""` como
defecto cuando es el marcado correcto para una foto decorativa cuyo título
adyacente ya nombra el enlace).

### 4t.1 El Quick View quedaba fuera de pantalla en desktop — CORREGIDO

Medido a 1440×900: el panel estaba en `y=900` de un viewport de 900 px, es
decir **un viewport completo por debajo del pliegue**, con su botón de cerrar
en `y=916` — imposible de pulsar. Presente en el DOM, con foco, anunciado por
lectores de pantalla, y completamente invisible.

Causa: `useIsDesktop()` devuelve `false` durante la hidratación (una instantánea
de servidor no puede conocer el viewport). El panel declaraba **solo el eje por
el que viajaba**, así que la secuencia era:

1. monta con el `initial` móvil → `translateY(100%)`
2. llega el breakpoint real → `animate` pasa a `{ x: 0 }`
3. `y` ya no se menciona en el destino → nada lo devuelve a 0

Solo ocurría cuando el panel está abierto en el primer pintado: es decir
**exactamente el enlace `?ver=<slug>` que genera `ShareButton`**. Al abrirlo
desde una tarjeta ya hidratada funcionaba, y por eso no se había visto.

Corregido en `lib/quick-view-motion.ts`: `initial` y `exit` declaran **siempre
los dos ejes** y `animate` devuelve **ambos** a 0, de modo que ningún eje puede
quedar huérfano por un cambio de opinión a mitad de vuelo. 6 pruebas unitarias
fijan esa invariante, incluida una que reproduce el salto de hidratación.

Verificado tras la corrección a 1440×900, 1024×768 y 375×812: el panel y su
botón de cerrar quedan dentro del viewport en los tres.

### 4t.2 Cerrar un enlace compartido echaba al visitante del sitio — CORREGIDO

Dos mecanismos de historial se pisaban. `QuickView` empuja su propia entrada al
abrir y **todos** sus cierres pasan por `window.history.back()`; `CatalogGrid`
además empujaba `?ver=` y su `onClose` llamaba otra vez a `router.back()`. Un
cierre consumía **dos** entradas.

Abrir desde una tarjeta lo disimulaba, porque ese camino empuja dos entradas y
los dos retrocesos se compensaban. Llegar directo a `/experiencias?ver=<slug>`
solo tiene una que dar, así que el segundo retroceso salía del sitio: al pulsar
Escape sobre un enlace compartido el visitante abandonaba el catálogo.

Corregido dejando un solo dueño del gesto: `closeQuickView` ya no navega hacia
atrás, solo quita `ver` de la URL con `replace`. Los cuatro caminos verificados
en navegador — enlace compartido + Escape, tarjeta + Escape, tarjeta + botón
atrás, y la hoja inferior de Home + Escape — cierran el panel y **dejan al
visitante donde estaba**.

### 4t.3 El logotipo se partía en dos líneas en todo el móvil — CORREGIDO

Como hijo flexible, el logotipo se encogía por debajo del ancho de su propio
contenido y rendía "Sunny / Project": 64 px de alto (dos líneas de 32) dentro
de una cabecera de 72 px, **en todos los viewports por debajo de 640 px y en
todas las páginas del sitio**.

La causa de fondo era otra: `className="hidden sm:inline-flex"` en el CTA móvil
**no hacía nada**. `LinkButton` ya declara `inline-flex` en sus clases base y,
entre dos utilidades de `display` con la misma especificidad, decide el orden
de aparición en la hoja de estilos — así que el botón se mostraba a todos los
anchos y desplazaba al logotipo. Corregido moviendo el cambio de `display` a un
elemento envolvente (que no compite con nadie) y añadiendo
`whitespace-nowrap shrink-0` al logotipo, que nunca debe partirse.

Efecto colateral que también era un defecto: el botón de menú medía **29×44 px
a 320 px** y 37×44 a 375 — por debajo del mínimo de 44 px de área táctil. Al
dejar de comprimirse mide 44×44 en todos los anchos.

Medición final del logotipo: 132 px de ancho, 32 px de alto (una línea) a 320,
360 y 375 px.

---

## 5. Lo que NO se probó — explícitamente

| No probado | Por qué | Quién debe probarlo |
|---|---|---|
| **Magic link de punta a punta** | El límite `over_email_send_rate_limit` sigue vigente y el brief prohíbe reintentar OTP. **No se declara que auth funcione.** | El usuario, tras liberarse el límite |
| **Reservación real contra Postgres** | Supabase inalcanzable | El usuario en el Preview |
| **Las dos migraciones** | No se ejecutó SQL en ninguna base. La garantía de no-sobreventa **no está demostrada** | Entorno aislado, con las 20 pruebas de `SUNNY_COMPANIONS_MIGRATION_PLAN.md` §6 |
| **Concurrencia de dos reclamos por el último lugar** | Requiere dos sesiones psql reales | Prueba 11 del plan |
| **Correos (Resend)** | No se envió ninguno | El usuario |
| **Dispositivo móvil físico** | Solo emulación de viewport en Chromium | El usuario |
| **Referencias en píxeles** | Chromium no atraviesa el proxy de este entorno (`ERR_CONNECTION_RESET` incluso contra `example.com`); el análisis se hizo sobre el markup servido real | — |

---

## 6. Compuertas automáticas

| Compuerta | Resultado |
|---|---|
| `pnpm lint` | ✅ Sin errores |
| `pnpm typecheck` | ✅ Sin errores |
| `pnpm test` | ✅ **94 pruebas** en 11 archivos (9 omitidas: integración que requiere Supabase real) |
| `pnpm build` | ✅ Compila; 30 rutas |
| Scroll horizontal | ✅ 49/49 combinaciones sin scroll lateral (7 rutas × 7 anchos, sobre el build de producción) |
| WCAG (`axe-core`) | ✅ **0 hallazgos** en 9 rutas × 2 viewports, reglas AA + best-practice |
| Prueba de humo funcional | ✅ 13/13 comprobaciones (Quick View, historial, filtros, `alt`, rotador) |
| Rutas públicas | ✅ 200 en `/`, `/experiencias`, `/experiencias/[slug]`, `/acceso`, `/como-funciona`, `/para-negocios`, `/preguntas-frecuentes`, `/terminos` |
| Rutas de panel sin sesión | ✅ 307 a `/acceso?next=…`, cuerpo vacío |
| Rutas de panel con sesión admin | ✅ 200 en las 6 |

`pnpm test:e2e` no se ejecutó: las especificaciones de Playwright existentes esperan un Supabase alcanzable.
