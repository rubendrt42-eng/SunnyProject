# Sunny — Análisis de referencias (MVP 1.1)

Este documento registra lo que **realmente** se observó en las tres referencias, y cómo cada patrón se adapta a Sunny Project. No es una lista de adjetivos ("se ve moderna"): cada fila explica el problema de producto que el patrón resuelve.

---

## 0. Método y limitación de acceso (importante)

**Cómo se estudiaron las referencias.** El entorno de ejecución de esta sesión enruta todo el tráfico HTTPS por un proxy de agente. `curl` sí atraviesa ese proxy; **Chromium no** (`net::ERR_CONNECTION_RESET`, reproducido incluso contra `https://example.com/`). Por lo tanto:

- ✅ **Sí se obtuvo**: el HTML servido real de las 6 URLs, y de ahí la jerarquía de encabezados textual (`h1`–`h4`), la navegación, los textos de sección, las familias tipográficas declaradas, los archivos de fuente cargados, el conteo de `<video>`/`<img>`, y los nombres de clase que revelan el comportamiento de layout y scroll (sticky, carousel, overflow, máscaras).
- ❌ **No se obtuvo**: la página renderizada en píxeles (no hubo captura de pantalla de las referencias, ni desktop ni mobile). No se pudo medir color exacto, tamaño tipográfico real en px, timing de animación, ni comportamiento táctil observado.

**Consecuencia honesta**: todo lo que este documento afirma sobre *estructura, jerarquía textual, tipografía declarada y mecánica de scroll* está respaldado por el markup servido. Todo lo que se refiere a *sensación visual* proviene de las instrucciones del brief, no de una observación propia, y está marcado como **(del brief)**. No se inventó contenido de ninguna referencia.

**Contradicción encontrada con el brief — se documenta, no se resuelve en silencio.** El brief pide analizar en Phamily la "mezcla de serif y sans serif". El markup real de Phamily **no carga ninguna serif**: usa `Anton` (display condensada, muy pesada) para titulares y `Poppins` (sans geométrica) para texto — archivos `Anton-Regular.woff2`, `Poppins-Regular`, `Poppins-SemiBold`. Su carácter editorial no viene de una serif, viene de **una display condensada muy pesada + copy corto con humor + fotografía humana**. Sunny **no** copia Anton/Poppins; conserva Manrope + Newsreader (ver `SUNNY_VISUAL_DIRECTION_1_0.md` §2) y toma de Phamily el *mecanismo* (contraste extremo de peso y escala entre titular y cuerpo), no las familias.

---

## 1. Phamily — `phamilypharma.com`

Rubro real: cabinet francés de compraventa de farmacias. Nav real: `Acheter · Vendre · Ressources · À propos · Concept · Contact`.

| Página | Sección observada | Qué problema resuelve | Scroll | Jerarquía tipográfica | Interacción | Adaptable | NO copiar | Aplicación en Sunny |
|---|---|---|---|---|---|---|---|---|
| Home | `h1` "L'Achat et Vente de Pharmacies **sans les maux de tête**" | Nombra la categoría y el dolor en una frase, con humor (juego de palabras farmacéutico) | Hero estático, sin altura artificial | Un solo `h1` enorme; nada compite | CTA directo | Titular = promesa + alivio de una fricción concreta, no eslogan abstracto | El pun, el idioma, la estructura literal | Hero: **"Descubre algo nuevo. Vívelo con alguien."** — promesa + con quién, en dos líneas cortas |
| Home | `h2` "Au-delà de la simple transaction : **notre mission**" | Declara propósito antes de vender | Capítulo propio | `h2` sentence case, no mayúsculas | — | Una sección de misión explícita, temprana | Copy corporativo francés | Sección **"Qué es Sunny Project"** (§17 del brief), colocada después de las experiencias |
| Home | 3 × `h3`: "Un achat serein" / "Des démarches allégées" / "Une proximité sans faille" | Tres beneficios en 3 palabras cada uno | Fila simple | `h3` corto, sin párrafo | — | Beneficios de 2–4 palabras | Convertir *todo* en tríos de tarjetas (el brief lo prohíbe) | Se usa **una sola vez** (en "Cómo funciona" como pasos numerados), no repetido |
| Home | `h2` "Un parcours de battant. **Pas du combattant**" | Rompe el ritmo con una frase memorable a mitad de scroll | Cambio de ritmo | Frase corta, alto contraste | — | Insertar una frase-ancla entre capítulos | El pun | **"Puedes llegar solo. Eso no significa que te vas a ir igual."** en la sección Comunidad |
| Home + À propos | Par repetido: `h2/h3` "**Besoin de changer d'air ?**" / "**Prêt à devenir proprio ?**" | El visitante se autoclasifica por intención en vez de leer todo | Reaparece en varias páginas como CTA recurrente | Dos preguntas del mismo tamaño, en paralelo | Dos rutas clicables | **Navegación por intención en forma de pregunta** | Solo dos opciones; el vocabulario | **Selector por intención** (§16): "¿Qué buscas esta semana?" → Moverme / Desconectarme / Conocer gente / Con amigos / Probar algo nuevo |
| Home | "Acheter — Nos pharmacies à la vente" + `h3` por inmueble ("Pharmacie sur l'Est Lyonnais") | El inventario real es contenido protagonista, no un anexo | Listado tras la misión | Cada ítem con `h3` propio | Tarjetas navegables | El inventario real como sección editorial | Métricas o inmuebles inventados | **"Esta semana en Sunny"** con experiencias reales de Supabase, colocada **antes** de "Cómo funciona" |
| Home | `h2` "Transaction officinale : **la FAQ by Phamily**" + `h3` por pregunta | Resuelve objeciones sin llamar | Cerca del cierre | Preguntas como `h3` | Acordeón | FAQ con voz propia ("by Phamily") | — | FAQ ya existe; se recorta a 3 preguntas reales y se corrige la copy de acompañantes |
| À propos | `h1` "UNE PHARMACIE C'EST TOUTE UNE VIE" | Titular emocional en mayúsculas, **una sola vez en el sitio** | — | Mayúsculas como recurso único | — | Mayúsculas como excepción, no como norma | Mayúsculas en todos los títulos | Sunny usa mayúsculas solo en *eyebrows* y en el sello "SUNNY ORIGINAL" |
| À propos | `h3` "Phamily est né dans le Sud, d'un désir collectif de dépoussiérer…" | El origen cabe en **una frase**, no en una biografía | Bloque breve | Una oración como `h3` | — | Origen corto | Biografía extensa; inventar historia | Emmy aparece en **un párrafo + una foto**, con el texto marcado como provisional en `SUNNY_CONTENT_NOTES` del release report |
| À propos | `h2` "VOICI L'ÉQUIPE AU COMPLET" | Las personas dan confianza | Sección propia | — | — | Mostrar personas reales | Inventar un equipo | Sunny tiene **una** persona real (Emmy); no se fabrica equipo. La comunidad ocupa ese rol visual |
| Contact | `h1` "Un projet, une question ? Discutons-en" + `h2` "**Choisissez votre conseiller**" | Formulario progresivo: primero eliges interlocutor, luego escribes | — | Pregunta → instrucción | Selección previa al formulario | **Formulario progresivo** (elegir antes de escribir) | Elegir asesor (Sunny no tiene asesores) | Formulario de negocios: primero **categoría del espacio**, después los datos — reduce el muro de campos |

### Por qué estos patrones mejoran el producto (no solo la estética)

- **Comprensión**: el titular-promesa con fricción nombrada ("sin los dolores de cabeza") funciona porque dice *qué cambia para ti*. Sunny lo aplica diciendo con quién ("Vívelo con alguien"), que es exactamente el diferenciador frente a una página de eventos.
- **Descubrimiento**: poner el inventario real antes del "cómo funciona" es la decisión estructural más importante de Phamily, y coincide con §11 del brief. Una persona que ya vio algo que quiere hacer tolera leer el mecanismo; al revés, no.
- **Navegación**: el par de preguntas por intención evita el menú. Es más barato de entender que una taxonomía de categorías, y es la base del selector por intención de Sunny.
- **Confianza**: misión explícita + personas reales + FAQ con voz propia. Sunny puede sostener misión y FAQ hoy; personas reales solo parcialmente (una foto de Emmy), y eso se declara.
- **Conversión**: el formulario progresivo baja la fricción inicial a un clic.

---

## 2. Coda — `coda.co`

Rubro real: *Merchant of Record* y pagos para gaming. `h1`: "Accelerate Growth with Coda's Merchant of Record and Payment Solutions".

| Página | Sección observada | Qué problema resuelve | Scroll | Jerarquía tipográfica | Interacción | Adaptable | NO copiar | Aplicación en Sunny |
|---|---|---|---|---|---|---|---|---|
| Home | `h2` en mayúsculas, una idea cada uno: "YOUR WEB STORE YOUR WAY" · "A TRUSTED NETWORK TO HELP YOU GROW" · "GET IN FRONT OF MILLIONS" | Cada capítulo defiende **una sola afirmación** | Capítulos secuenciales | `h2` corto, mayúsculas, un claim | — | **Una idea por sección**, enunciada como afirmación | Mayúsculas en todo; tono empresarial | Cada sección de Home tiene un único `h2` afirmativo ("Salir de la rutina no debería ser complicado") |
| Home | `class="w-full home-header h-[100vh] … sticky left-0"` y `md:h-[100vh] md:sticky` | El contenedor se fija mientras el contenido interno avanza: el usuario "atraviesa" un capítulo sin perder contexto | **Sticky de viewport completo, solo `md:` y arriba** | — | Scroll | Sticky **condicionado al breakpoint** | Sticky en mobile (Coda mismo lo desactiva) | "Cómo funciona": sticky en `lg:`, **secuencia vertical simple en mobile** — exactamente lo que pide §18 |
| Home | `class="eyebrow relative w-fit mb-statsCarouselEyebrowMB"` | Etiqueta pequeña que ubica la sección antes del titular | — | Eyebrow ≪ `h2` | — | Patrón *eyebrow* | El token de spacing ad-hoc | Sunny ya usa eyebrow naranja en mayúsculas; se formaliza como clase del sistema |
| Home | `type-body-l`, `h-footer`, `w-headerLogo`, `w-impactCarouselToolbarW` | Escala tipográfica y espaciado **con nombre**, no valores sueltos | — | Escala nombrada | — | **Escala tipográfica semántica** (`type-*`) | Nombres tan específicos que solo sirven a una sección | Se agrega escala `--text-display / title / heading / body / label` en `globals.css` y se usa en toda la app |
| Home | `card-carousel-item`, `impact-carousel-outer`, `stats-carousel md-gradient-mask-sides` | Varias familias de carrusel distintas, con **máscara de degradado en los bordes** para insinuar continuidad | Horizontal | — | Arrastre / scroll | Máscara de bordes; carruseles diferenciados por propósito | Tener 3 carruseles en una sola página (saturación) | **Uno** solo: la cinta de experiencias (§14), con máscara lateral y pausa en hover/focus |
| Home | `stats-carousel` con cifras | Prueba social por volumen | Horizontal | Cifra grande | — | El *lugar* de la prueba social | **Las métricas** — Sunny no tiene volumen y el brief prohíbe inventarlas | Ese espacio lo ocupa **"Espacios que forman parte de Sunny"**, condicionado a `featured_as_partner`; si no hay aliados reales, la sección **no se renderiza** |
| Home | `pointer-events-none absolute w-full h-full overflow-hidden` | Capa decorativa que nunca intercepta clics | — | — | — | Decoración siempre `pointer-events-none` | — | Se aplica a los degradados y sellos decorativos de Sunny |

### Por qué mejoran el producto

- **Jerarquía / comprensión**: una afirmación por capítulo es lo que permite entender la página *escaneando*. Es la corrección directa al riesgo de "todo son grids de tres tarjetas".
- **Navegación**: el sticky por capítulo mantiene el contexto en explicaciones de varios pasos — ideal para "Cómo funciona", donde el usuario debe retener que son 5 pasos.
- **Consistencia**: la escala nombrada es la razón por la que Coda se ve sistemático. Es la adaptación de mayor impacto/menor riesgo para Sunny, y ataca el "parece plantilla de IA" (que casi siempre es tipografía inconsistente).
- **Honestidad**: Coda enseña *dónde* va la prueba social. Sunny copia la posición y **rechaza el contenido**, porque no tiene las cifras.

---

## 3. Eight Sleep — `eightsleep.com/mx`

`h1` real: "Enfría a la temperatura exacta que necesitas" + `h2` "Pod 5". 13 `<video>`, 109 `<img>`.

| Página | Sección observada | Qué problema resuelve | Scroll | Jerarquía tipográfica | Interacción | Adaptable | NO copiar | Aplicación en Sunny |
|---|---|---|---|---|---|---|---|---|
| bed-cooling-system | `h1` beneficio + `h2` nombre de producto | Vendes el resultado, no el SKU | Hero | Beneficio > nombre | — | Beneficio antes que nombre propio | Lenguaje de compra | Tarjeta de experiencia: **frase breve** por encima del nombre del negocio |
| bed-cooling-system | `Sticky_container` / `Sticky_benefits_content` / `Sticky_benefit` | Beneficios que avanzan sobre un visual fijo | Sticky con contenido interno | — | Scroll | Sticky de beneficios | Estructura e-commerce | Refuerza la decisión de sticky en "Cómo funciona" (desktop) |
| bed-cooling-system | `Sticky_desktop_button` **y** `Sticky_mobile_button` (dos clases distintas) | La acción principal nunca se pierde, **con tratamiento distinto por dispositivo** | Sticky | — | Clic | **CTA sticky diferenciado desktop/mobile** | — | Quick View y detalle: CTA sticky; en mobile barra inferior fija, en desktop dentro del panel |
| bed-cooling-system | `grid overflow-x-auto scrollbar-hidden` + `pl-[var(--carousel-padding-sm)]` | Carrusel **nativo**: scroll del navegador, sin librería | Horizontal nativo | — | Swipe nativo | **Scroll nativo con `overflow-x-auto` + snap**, no JS | Ocultar el scrollbar sin dar otra pista de affordance | Cinta de experiencias y carruseles de Sunny usan scroll nativo + `snap-x` (mejor rendimiento y swipe real en móvil, §42) |
| bed-cooling-system | `ImageCarousel_pills` / `horizontal_pills` | Indicadores de posición legibles | — | — | Clic | Píldoras en vez de puntos diminutos | — | El rotador del hero usa píldoras con área táctil ≥ 24 px |
| bed-cooling-system | `h2` "Explore how the Pod works" | Invitación explícita a profundizar | Puente entre capítulos | — | Ancla | Un puente textual hacia la explicación | — | "Cómo funciona" se ancla desde el hero con el CTA secundario **"Conoce Sunny"** |
| bed-cooling-system | `h3` "Dos personas. Una buena noche." | Dos frases mínimas comunican un beneficio compartido | — | Dos oraciones cortas | — | Ritmo de dos frases | El contexto de producto | Copy de acompañantes: **"Vas con alguien. Un solo pase."** |
| bed-cooling-system | `<video playsInline>` (13 videos) | Movimiento real del producto, sin bloquear | Lazy | — | Autoplay silencioso | `muted loop playsInline` + poster | Peso de 13 videos | **Sunny no tiene video** (ver manifest): se usa fotografía real. No se fabrica video |

### Por qué mejoran el producto

- **Facilidad para reservar**: el CTA sticky diferenciado por dispositivo es la mejora de conversión más directa y aplica tal cual al Quick View y al detalle de experiencia.
- **Rendimiento**: el carrusel nativo con `overflow-x-auto` + `snap` elimina JS, da swipe correcto en móvil y respeta `prefers-reduced-motion` sin código extra. Sustituye lógica de arrastre propia.
- **Claridad**: beneficio antes del nombre propio. En Sunny el negocio importa, pero lo que mueve a la persona es *qué va a vivir*.

---

## 4. Dirección resultante y qué se rechaza explícitamente

**Se adopta**: capítulos de una sola idea con eyebrow (Coda) · inventario real antes del mecanismo (Phamily) · navegación por intención en forma de pregunta (Phamily) · escala tipográfica nombrada (Coda) · sticky solo en desktop (Coda + Eight Sleep) · CTA sticky diferenciado (Eight Sleep) · carrusel nativo con máscara de bordes (Eight Sleep + Coda) · frase-ancla memorable a mitad de scroll (Phamily) · origen en una frase (Phamily) · formulario progresivo (Phamily).

**Se rechaza y por qué**:

| Rechazado | Referencia | Motivo |
|---|---|---|
| Anton / Poppins | Phamily | Es su identidad tipográfica. Sunny mantiene Manrope + Newsreader |
| Mayúsculas en todos los `h2` | Coda | El brief lo prohíbe; se reserva a eyebrows y al sello Original |
| Carrusel de métricas | Coda | Sunny no tiene cifras reales. Prohibido inventarlas (§37, §39) |
| Tres carruseles en una página | Coda | Saturación; Sunny tiene **uno** |
| Sticky en mobile | Coda | Coda mismo lo limita a `md:`; §18 pide secuencia vertical |
| Video de hero | Eight Sleep | No hay material de video en `PaginaWeb`. No se fabrica |
| Logos de aliados | Coda | Sin `featured_as_partner` real la sección no se renderiza |
| Estructura e-commerce / selector de producto | Eight Sleep | Sunny no vende |
| Equipo / biografía extensa | Phamily | Solo existe Emmy; no se inventa equipo |

---

## 5. Riesgo de "plantilla de IA" — diagnóstico y contramedidas

El brief insiste en que Sunny no debe parecer plantilla generada. De las referencias se extraen las tres causas reales de esa sensación, y su contramedida concreta:

1. **Tipografía inconsistente** (tamaños ad-hoc por sección). → Escala nombrada `--text-*` usada en toda la app; ninguna sección define tamaños propios.
2. **Repetición del mismo bloque** (grid de 3 tarjetas ×6). → Cada sección de Home usa una composición distinta: rotador, cinta horizontal, grid asimétrico 2+3, selector interactivo, split editorial, sticky numerado, banda de contraste, acordeón.
3. **Copy genérica sin dato detrás** ("experiencias únicas"). → Toda afirmación de disponibilidad, cupo o estado viene de Supabase; las frases sin dato se eliminan (§39).
