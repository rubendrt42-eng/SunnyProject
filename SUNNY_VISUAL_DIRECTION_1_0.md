# Sunny — Dirección visual 1.0

Sistema visual de Sunny Project para MVP 1.1. Este documento es **normativo**: lo que aquí se define es lo que existe en `app/globals.css` y en `components/ui/*`. Si una pantalla se desvía, la pantalla está mal, no el documento.

Objetivo de sensación: **una revista cultural viva que además permite descubrir, compartir y reservar experiencias.** Cálida, joven, contemporánea, local, premium pero accesible. No infantil, no corporativa, no dashboard SaaS en la parte pública, no marketplace de descuentos.

---

## 1. Paleta

| Token | Valor | Rol | Reglas |
|---|---|---|---|
| `--color-carbon` | `#171714` | Texto principal; fondo de capítulos de contraste | Fondo de: Sunny Originals, Pase semanal, cierre, footer |
| `--color-ivory` | `#f4f1e8` | Fondo por defecto del sitio | Fondo del `body` |
| `--color-warm-white` | `#fffdfc` | Superficies elevadas; texto sobre carbón | Tarjetas, campos, secciones alternas |
| `--color-sunny` | `#f8d347` | **Acento y CTA** | Botón primario, estado activo, selección, sello. **Nunca** fondo de página completa |
| `--color-orange` | `#ff7a3d` | Acento secundario, eyebrows, foco | Etiquetas de sección, `:focus-visible`, alertas suaves |
| `--color-gray` | `#6d6d65` | Texto secundario | Párrafos de apoyo, metadatos |
| `--color-pine` | `#2f4739` | **Color secundario limitado** | Solo dos usos: sello "Sunny Original" y badge "Conoce gente nueva". Nada más |

**Reglas de color**

- El amarillo es acento, no lienzo. Superficie amarilla máxima admitida: un botón, un sello, un chip activo.
- Máximo **un** fondo de contraste (carbón) cada dos secciones claras, para que el ritmo se note sin volverse oscuro (el brief prohíbe "exceso de negro" de Coda).
- `--color-pine` existe para dar jerarquía a lo comunitario sin introducir una cuarta familia de color. Si aparece en una tercera ubicación, se está abusando.
- Contraste mínimo AA: `carbon` sobre `ivory` = 13.7:1; `gray` sobre `ivory` = 4.9:1; `carbon` sobre `sunny` = 11.1:1; `warm-white` sobre `carbon` = 15.4:1; `warm-white` sobre `pine` = 8.9:1. Texto `orange` sobre `ivory` (3.1:1) **solo** en tamaño ≥ 14 px semibold, uso de eyebrow.

## 2. Tipografía

Dos familias, ni una más.

| Familia | Uso | Peso |
|---|---|---|
| **Manrope** (`--font-sans`) | Todo: titulares, cuerpo, UI, panel | 400 / 500 / 600 / 700 |
| **Newsreader** (`--font-serif`) | **Solo acentos**: frase-ancla de sección, eyebrow editorial ocasional, cifra de folio | 400, italic |

**No se copian las familias de las referencias.** Phamily usa Anton + Poppins (verificado en su markup); Sunny conserva Manrope + Newsreader. El *mecanismo* adoptado de Phamily es el contraste extremo de escala y peso entre titular y cuerpo, no su tipografía.

**Escala nombrada** (patrón `type-*` de Coda). Ninguna sección define tamaños propios: usa estos tokens.

| Token | Valor | Uso |
|---|---|---|
| `--text-display` | `clamp(2.5rem, 6.5vw, 4.75rem)`, `line-height: 0.98`, `letter-spacing: -0.03em`, peso 600 | **Solo el `h1` del hero.** Una vez por página |
| `--text-title` | `clamp(1.875rem, 3.6vw, 3rem)`, `1.06`, `-0.022em`, peso 600 | `h2` de sección |
| `--text-subtitle` | `clamp(1.375rem, 2.2vw, 1.875rem)`, `1.15`, `-0.015em`, peso 600 | Titular de tarjeta destacada, `h2` de panel |
| `--text-heading` | `1.125rem`, `1.3`, `-0.01em`, peso 600 | `h3`, títulos de tarjeta estándar |
| `--text-body-l` | `1.0625rem`, `1.6` | Párrafo de entrada, bajada de hero |
| `--text-body` | `1rem`, `1.6` | Cuerpo |
| `--text-small` | `0.875rem`, `1.5` | Metadatos, ayuda de formulario |
| `--text-label` | `0.6875rem`, `1.2`, `0.14em`, mayúsculas, peso 600 | Eyebrow, badges, encabezados de tabla |

**Reglas de titulares**

- Grandes, breves, con ritmo. Un titular de hero **nunca** es un párrafo: máximo 2 líneas visuales, ~7 palabras.
- Mayúsculas solo en `--text-label` y en el sello `SUNNY ORIGINAL`. Ningún `h1`/`h2`/`h3` en mayúsculas.
- Serif/italic solo en frases-ancla aisladas, nunca en dos titulares consecutivos.
- `text-wrap: balance` en `h1`/`h2` para evitar líneas viudas.

## 3. Espaciado y ritmo

| Token | Valor | Uso |
|---|---|---|
| `--space-section` | `5rem` móvil → `7rem` `sm:` | Padding vertical de sección |
| `--space-section-lg` | `6rem` → `8rem` | Secciones de contraste (respiran más) |
| Gutter de `Container` | `1.25rem` → `2rem` `sm:` | Ya existente |
| Ancho máximo | `80rem` (contenido), `48rem` (lectura), `28rem` (formulario) | — |

Ritmo de composición de Home: ninguna sección consecutiva usa el mismo tipo de layout (ver §8).

## 4. Radios

| Token | Valor | Uso |
|---|---|---|
| `--radius-xs` | `4px` | Chips pequeños, badges cuadrados |
| `--radius-sm` | `8px` | Campos, botones `sm` |
| `--radius-md` | `10px` | **Botones** (todos los tamaños), controles |
| `--radius-lg` | `14px` | Tarjetas, paneles, modales |
| `--radius-full` | `9999px` | **Solo** chips de filtro y píldoras de carrusel |
| `0` | — | Bloques fotográficos editoriales a sangre |

Regla: **los botones no son cápsulas.** `--radius-full` está reservado a controles de filtro, donde la forma de píldora comunica "seleccionable/deseleccionable".

## 5. Botones — tres niveles

| Nivel | Estilo | Uso |
|---|---|---|
| **Primario** | Relleno `sunny`, texto `carbon` | Una sola acción principal por vista |
| **Secundario** | Borde `carbon/25`, fondo transparente | Acción alterna ("Conoce Sunny", "Ver experiencia") |
| **Textual** | Sin contenedor, subrayado en hover, flecha opcional | Navegación terciaria ("Ver todas →") |
| *Peligro* (excepción) | Borde `orange/60`, texto `orange` | Solo "Cancelar reservación" |

**Estados obligatorios**: `hover` (oscurece 15 %) · `focus-visible` (outline `orange` 2 px, offset 2 px) · `disabled` (opacidad 40 %, sin puntero) · `loading` (texto cambia a gerundio + spinner, botón deshabilitado, `aria-busy`).

**Área táctil**: alto mínimo 44 px en móvil (`md` = 44 px, `lg` = 50 px, `sm` = 36 px solo en panel de escritorio).

**Texto**: específico y verbal. "Reservar mi lugar", no "Enviar". "Proponer una experiencia", no "Contacto". Prohibido "Agendar" para experiencias — la acción es **reservar**.

**Flecha**: opt-in por llamada (`arrow`), desplazamiento 4 px en hover/focus. Nunca en todos los botones de una vista.

## 6. Campos

Radio `--radius-sm`, borde `carbon/20`, fondo `warm-white`, alto 44 px, `text-body`. Label visible siempre (nunca solo placeholder). Error: borde `orange`, mensaje bajo el campo con `aria-describedby` y `aria-invalid`. El panel usa la clase `.input` (neutra, más densa) documentada en `PRODUCT_SPEC.md` §9.

## 7. Badges

Dos ejes: **tono** y **forma**.

| Tono | Uso |
|---|---|
`neutral` | Categoría, metadatos |
`sunny` | Destacada, "Último lugar" |
`orange` | Agotada, urgencia |
`pine` | "Conoce gente nueva" |
`success` / `danger` | Solo panel (asistió / cancelada) |
`outline` | Modalidad social sobre fotografía |

**Badges de modalidad social** (§15 del brief) — se muestran **solo** si la experiencia realmente los declara; no son decorativos:

`Puedes venir solo` · `Ideal para ir con amigos` · `Conoce gente nueva` · `Permite acompañante` · `Grupo pequeño` · `Apto para principiantes`

El sello **`SUNNY ORIGINAL`** es un badge propio: fondo `pine`, texto `warm-white`, mayúsculas `--text-label`, con punto amarillo a la izquierda.

## 8. Tarjetas — seis tipos, deliberadamente distintos

| Tipo | Composición | Dónde |
|---|---|---|
| **Destacada** | Foto 4:5 grande + overlay inferior con degradado, titular `--text-subtitle`, hasta 3 badges | Primera de "Esta semana", primera del catálogo |
| **Estándar** | Foto 4:5, texto **debajo** de la foto (no encima), titular `--text-heading` | Grid de catálogo y de Home |
| **Sunny Original** | Fondo `carbon`, foto sangrada a un lado, sello `pine`, texto `warm-white` | Sección Originals, y como variante dentro del grid |
| **Comunidad** | Solo fotografía + pie de foto corto; sin CTA propio | Sección Comunidad |
| **Administrativa** | Sin foto, densa, borde `carbon/10`, datos alineados en columnas, acciones a la derecha | Panel de Emmy |
| **Estado vacío** | Borde punteado `carbon/15`, icono lucide 20 px, mensaje concreto + acción | Catálogo sin resultados, panel sin registros |

Regla anti-plantilla: **en Home no hay dos secciones consecutivas con la misma composición.** Orden real: rotador → cinta horizontal → grid asimétrico (1 destacada + 3) → selector interactivo → split editorial → sticky numerado → banda fotográfica → banda de contraste → grid de categorías → carrusel condicional → panel de estado → split de negocios → acordeón → cierre centrado.

## 9. Fotografía

- Relación por defecto **4:5** (vertical): es la proporción real de los assets disponibles (736 × ~920). No se recorta a 16:9 ni se deforma.
- Hero: **split editorial** (tipografía a la izquierda, foto vertical a la derecha) en lugar de fondo a sangre completa — decisión tomada porque no existe material horizontal ni de video.
- `next/image` siempre, con `sizes` explícito. `priority` **solo** en la foto del hero.
- `alt` descriptivo real de lo que ocurre en la imagen. Nunca el nombre del archivo, nunca vacío en fotos de contenido.
- Sobre fotografía con texto encima: degradado `from-carbon/85 via-carbon/35 to-transparent` para garantizar contraste, con `pointer-events-none`.
- Estado de foto ausente: `ManagedPhoto` renderiza un estado honesto que nombra el archivo faltante. **No se sustituye por una ilustración generada.**

## 10. Video

**No hay video en MVP 1.1.** La carpeta `PaginaWeb` no incluye material de video (ver `SUNNY_ASSET_MANIFEST.md`). No se fabrica video sintético.

Como consecuencia, en esta fase se eliminaron `HeroVideo.tsx`, `HeroExperienceRotator.tsx` y el hook `useVideoAllowed.ts`: quedaron sin uso al reemplazar el hero por el split editorial, y mantener código muerto que promete una capacidad inexistente es peor que borrarlo. Si más adelante llega material de video, el contrato a reconstruir es: `autoplay muted loop playsInline` + `poster` obligatorio + fallback a fotografía + respeto a `prefers-reduced-motion` y a la cabecera `Save-Data`.

## 11. Iconografía

`lucide-react`, `strokeWidth={1.5}`, tamaño 16 px (inline) / 20 px (bloque) / 24 px (acción táctil). Siempre `aria-hidden` cuando acompaña texto. Nunca un icono como única señal de significado.

## 12. Movimiento

| Regla | Implementación |
|---|---|
| Breve | 150–400 ms; nada por encima de 500 ms |
| Suave | `ease-out` de entrada, `ease-in-out` en desplazamientos |
| Funcional | Solo revelado de entrada, hover de tarjeta, transición de panel, avance de rotador |
| Nunca obligatorio | Todo el contenido es legible con JS y animación deshabilitados |
| Pausa en hover | Cinta y rotador se detienen con el puntero encima |
| Pausa en focus | También se detienen con foco de teclado dentro (`focus-within`) |
| Swipe | Carruseles usan **scroll nativo** `overflow-x-auto` + `snap-x` (adoptado de Eight Sleep) |
| Reduced motion | `prefers-reduced-motion: reduce` desactiva revelados, autoplay y parallax |
| Sin rebotes | Ningún `spring` con overshoot |
| Parallax | Máximo un elemento por página, desplazamiento ≤ 8 % |
| Sin animación permanente | Solo la cinta se mueve de forma continua; ninguna otra sección |

## 13. Estados de interfaz

Cada vista con datos define cuatro: **cargando** (skeleton o texto, nunca spinner a pantalla completa) · **vacío** (tarjeta de estado vacío con acción) · **error** (mensaje concreto + reintento; nunca un error crudo) · **éxito** (confirmación explícita, no solo un cambio de color).

## 14. Breakpoints

| Nombre | Ancho | Comportamiento |
|---|---|---|
| Base | 375–429 px | Una columna. Sin sticky. Cinta con swipe. Menú fullscreen. CTA sticky inferior en detalle/Quick View |
| `sm:` 640 | 640–767 px | Dos columnas en grids de tarjetas |
| `md:` 768 | 768–1023 px | Panel: navegación compacta superior. Público: split de hero comienza |
| `lg:` 1024 | 1024–1439 px | Panel: sidebar fijo. "Cómo funciona" sticky se activa |
| `xl:` 1280 | ≥ 1440 px | Grid asimétrico completo; anchos máximos topan |

Verificado en QA a 375 / 390 / 430 / 768 / 1024 / 1440 px (ver `SUNNY_DESIGN_QA_REPORT.md`).

## 15. Accesibilidad (mínimos no negociables)

Navegación completa por teclado · `:focus-visible` visible en todo control · `label` en todo campo · `alt` real · contraste AA · `aria-*` correcto en acordeones, modales y estados · botones semánticos (`<button>`, no `<div onClick>`) · modales con Escape, focus trap y retorno de foco · `aria-live` en confirmaciones · movimiento nunca como única señal.

## 16. El panel de Emmy comparte el sistema, no la personalidad

Mismos tokens (color, tipografía, radios, botones, badges). Diferencias deliberadas: sin fotografía decorativa, sin movimiento de entrada, densidad mayor (`--text-small` como cuerpo), tablas en desktop → tarjetas en móvil, y **fondo `warm-white` plano** en lugar de capítulos de color. El panel prioriza escaneo, velocidad y acción; la Home prioriza narrativa.
