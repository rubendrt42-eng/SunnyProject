# Sunny — Manifiesto de assets (`PaginaWeb`)

Inventario completo de la carpeta adjunta, con la decisión aplicada a cada archivo. **16 imágenes, 0 videos.**

---

## 0. Hallazgo de procedencia — leer antes de publicar

Al abrir la carpeta apareció un problema que cambia lo que se puede publicar, y se reporta antes que cualquier otra cosa:

**15 de las 16 imágenes tienen exactamente 736 px de ancho.** 736 px es el ancho canónico con el que Pinterest sirve las imágenes de su feed. Los nombres de archivo lo confirman: `The flagship home of Special Guests Coffee in….jpeg`, `_ @brooklynroastingjapan crew ♬ GOOD COFFEE, GOOD….jpeg`, `OACE (@oace_sports) • Instagram photos and videos.jpeg`, `Join our Oysho Running Club with weekly runs and….jpeg`, `Padel Mix-Ins at La Reserva Club — March….jpeg`, `Why Mat Pilates is Still a Game-Changer….jpeg`.

Es decir: **no son fotografías propias de Sunny.** Son imágenes de referencia (mood board) descargadas de contenido publicado por otras marcas. Además, varias no son de Monterrey: una muestra un local con rótulo *Marshall Livehouse **Bangkok***; otra, arquitectura del norte de Europa; otra, camisetas de un club de running de **Madrid**.

La única excepción es `FotoEmmy/Imagen_Emmy.jpg`, de 1080 × 1080 px (formato nativo de Instagram) — plausiblemente material propio.

**Consecuencias, aplicando las reglas §37 y §39 del propio brief:**

| | Decisión |
|---|---|
| **Uso en el Preview** | ✅ Sí. Se usan 13 de 16 para que el diseño pueda evaluarse con fotografía real en lugar de estados "falta foto" |
| **Uso en producción** | ❌ **Bloqueado.** No se puede publicar en `sunny-project-teal.vercel.app` sin fotografía propia de Emmy o una licencia |
| **Marcas de terceros legibles** | ❌ 3 archivos descartados del sitio por mostrar marca ajena identificable |
| **Atribución a negocios** | ❌ Ninguna foto se asigna a un negocio con nombre como si fuera de ese negocio. Los negocios demo no reciben logo |
| **Geografía** | ❌ No se afirma en ninguna parte que estas fotos sean de Monterrey |
| **Nombres personales / handles** | ❌ No se trasladan a los nombres finales ni al `alt`. Los `@handles` quedan solo en esta tabla, como evidencia de procedencia |
| **Originales** | ✅ Intactos. No se copió el ZIP al repositorio; los originales viven fuera del repo |

**Acción requerida de Emmy antes de producción**: una sesión de fotografía propia (o assets con licencia) para las 6 experiencias demo, la sección Comunidad y el hero. Hasta entonces el sitio público debe seguir en Preview.

---

## 1. Tabla A — Identificación

| ID | Ruta original | Carpeta | Archivo | Dimensiones | Orientación | Descripción visual (verificada abriendo el archivo, no por nombre) |
|---|---|---|---|---|---|---|
| A1 | `PaginaWeb/Comunidad/` | Comunidad | `A look back at our Culinary Creatives Collective….jpeg` | 736 × 920 | Vertical 4:5 | Interior industrial luminoso. ~12 personas sentadas en bancas conversando; tres en primer plano con **etiquetas adhesivas de nombre**, una sostiene un vaso de café para llevar. Ambiente de encuentro/meetup |
| A2 | `PaginaWeb/Comunidad/` | Comunidad | `Thank you to everyone who stopped by the backhouse….jpeg` | 736 × 920 | Vertical 4:5 | Seis personas alrededor de una mesa de madera en un taller creativo: pinceles, acuarelas, latas, cámara compacta. Dos ríen abiertamente. Cuadro ilustrado en la pared |
| A3 | `PaginaWeb/FotoEmmy/` | FotoEmmy | `Imagen_Emmy.jpg` | **1080 × 1080** | Cuadrada | Retrato de una mujer joven de perfil tres cuartos, camiseta blanca, apoyada en un barandal de madera. Fondo: ladera de bosque de pinos y huerto. Luz de tarde nublada |
| A4 | `PaginaWeb/Cafe/` | Cafe | `29977153765746850.jpeg` | 736 × 1104 | Vertical 2:3 | Mesa redonda de madera junto a ventanal. Capuchino con arte latte en taza blanca, croissant en plato, servilleta y tenedor. Luz lateral dura, empedrado al fondo |
| A5 | `PaginaWeb/Cafe/` | Cafe | `The flagship home of Special Guests Coffee in….jpeg` | 736 × 920 | Vertical 4:5 | Barra de café minimalista: isla de acero inoxidable con vitrina de pastelería, estación de filtrado V60, dos molinos, muro rosado pálido. Sin personas |
| A6 | `PaginaWeb/Cafe/` | Cafe | `_ @brooklynroastingjapan crew ♬ GOOD COFFEE, GOOD….jpeg` | 736 × 920 | Vertical 4:5 | Barista de espaldas trabajando en máquina de espresso, contraluz de ventanal con vegetación. Vapor visible. Mandil oscuro, gorra |
| A7 | `PaginaWeb/Yoga /` | Yoga | `NEW ARRIVAL ALERT 🔔 Finding joy in every moment….jpeg` | 735 × 914 | Vertical 4:5 | Tres mujeres en tapetes sobre césped, postura de extensión lateral con brazo al cielo. Palmeras, casa blanca moderna, sol pleno |
| A8 | `PaginaWeb/Yoga /` | Yoga | `This weekend with @thisisthelob….jpeg` | 735 × 976 | Vertical 3:4 | Estudio interior de líneas curvas y luz cálida ámbar. Instructora sentada en plataforma circular frente a ~8 personas sentadas en flor de loto sobre tapetes. Esferas de madera como props |
| A9 | `PaginaWeb/Yoga /` | Yoga | `Why Mat Pilates is Still a Game-Changer….jpeg` | 735 × 919 | Vertical 4:5 | Cuatro mujeres recostadas en tapetes, piso de madera, cada una sosteniendo una **pelota de pilates** contra el abdomen, piernas en mesa. Estudio interior |
| A10 | `PaginaWeb/Padel/` | Padel | `Padel Mix-Ins at La Reserva Club — March….jpeg` | 736 × 920 | Vertical 4:5 | Cancha de **pádel** con muro de cristal y malla. Cuatro personas (dos hombres, dos mujeres) saludándose junto a la red, palas en mano. Vegetación mediterránea, cielo despejado |
| A11 | `PaginaWeb/Padel/` | Padel | `The Gold Hot List.jpeg` | 736 × 1104 | Vertical 2:3 | Mujer riendo a carcajadas inclinada hacia adelante con pala verde menta en mano; tres mujeres de blanco al fondo desenfocadas. Césped, casa residencial |
| A12 | `PaginaWeb/Padel/` | Padel | `_ (19).jpeg` | 736 × 1104 | Vertical 2:3 | Dos mujeres en cancha de pádel de arcilla naranja **tocando palas** (gesto de celebración/saludo), sonriendo. Muro de cristal, muro vegetal y palmeras al fondo |
| A13 | `PaginaWeb/RunClub/` | RunClub | `@cruisecontrolrunclub x @marshalllivehouse….jpeg` | 736 × 981 | Vertical 3:4 | Grupo grande de corredores en la calle frente a un local. **Texto legible en camisetas: "CRUISE CONTROL RUN CLUB"**; **rótulo del local: "Marshall LIVEHOUSE BANGKOK"** |
| A14 | `PaginaWeb/RunClub/` | RunClub | `Instagram (3).jpeg` | 736 × 980 | Vertical 3:4 | Interior de techo de madera con lámpara esférica. Cinco personas en ropa deportiva riendo después de correr, con botellas de agua y una lata de bebida. Ambiente social post-actividad |
| A15 | `PaginaWeb/RunClub/` | RunClub | `Join our Oysho Running Club with weekly runs and….jpeg` | 736 × 736 | Cuadrada | Cinco mujeres corriendo en paralelo por camino de tierra, luz de mañana. **Texto legible en jerseys: "RUNNING CLUB MAD"** (Madrid) |
| A16 | `PaginaWeb/RunClub/` | RunClub | `OACE (@oace_sports) • Instagram photos and videos.jpeg` | 736 × 920 | Vertical 4:5 | Cinco hombres en ropa deportiva sobre un puente peatonal urbano al atardecer; dos se dan un apretón de manos. **Logotipo "OACE" grande y legible en la ropa.** Arquitectura de ladrillo del norte de Europa |

## 2. Tabla B — Decisión aplicada

| ID | Uso inferido | Sección propuesta | Experiencia propuesta | Nombre final | Confianza | Decisión aplicada |
|---|---|---|---|---|---|---|
| A1 | Encuentro de comunidad con personas reales conversando | **Comunidad** | — | `community/community-gathering-01.webp` | **Alta** | ✅ Usado. Foto principal de la sección Comunidad |
| A2 | Taller/actividad grupal creativa | **Comunidad** | — | `community/community-workshop-01.webp` | **Alta** | ✅ Usado. Segunda foto de Comunidad |
| A3 | Retrato de fundadora | **Qué es Sunny Project** | — | `emmy/emmy-founder-01.webp` | **Alta** | ✅ Usado. Único asset plausiblemente propio. Sin nombre completo ni biografía inventada en el `alt` |
| A4 | Producto de café, mesa de cafetería | Catálogo / detalle | **Coffee Tasting** | `experiences/experience-coffee-tasting-01.webp` | **Alta** | ✅ Usado como foto de la experiencia demo de café |
| A5 | Espacio de cafetería sin personas | **Para negocios** | — | `businesses/business-coffee-bar-01.webp` | **Alta** | ✅ Usado. Ilustra "tu espacio" en la sección de negocios. **No se atribuye a ningún negocio con nombre** |
| A6 | Oficio: barista trabajando | **Categorías** (café) | — | `categories/category-food-coffee-01.webp` | **Alta** | ✅ Usado en el mosaico de categorías |
| A7 | Yoga al aire libre, grupo pequeño | Catálogo / detalle | **Sunset Yoga** | `experiences/experience-sunset-yoga-01.webp` | **Alta** | ✅ Usado |
| A8 | Sesión guiada en interior, grupo sentado en calma | Catálogo / detalle | **Recovery & Breathwork** | `experiences/experience-recovery-breathwork-01.webp` | **Media** | ⚠️ Usado con reserva. La imagen es un estudio de yoga/meditación, **no** una sesión de contraste térmico. Por eso la experiencia demo se renombró de "Recovery Contrast Session" a **"Recovery & Breathwork"**, para que la foto no afirme algo falso |
| A9 | Mat pilates con pelota, grupo | Catálogo / detalle | **Mat Pilates Intro** | `experiences/experience-mat-pilates-01.webp` | **Alta** | ✅ Usado. Obligó a renombrar la experiencia demo (ver §3) |
| A10 | Pádel, cuatro personas, saludo en la red | Catálogo / detalle | **Pádel Mix-In** | `experiences/experience-padel-mixin-01.webp` | **Alta** | ✅ Usado. Refleja literalmente "conoce gente nueva" y "permite acompañante" |
| A11 | Pádel, emoción individual | **Categorías** (movimiento) | — | `categories/category-movimiento-01.webp` | **Media** | ⚠️ Usado en tamaño reducido. La pala lleva la marca legible `POUNCE PADEL`; a tamaño de mosaico no es identificable, pero queda registrada como razón para reemplazarla |
| A12 | Dos personas celebrando juntas | **Hero** | — | `hero/hero-together-01.webp` | **Alta** | ✅ Usado como foto del hero. Es la imagen que mejor sostiene la promesa "Vívelo con alguien": dos personas, gesto de conexión, sin marca legible |
| A13 | Club de running | — | — | — | **Baja** | ❌ **No usado.** Marca ajena legible (`CRUISE CONTROL RUN CLUB`) y rótulo de un local en **Bangkok**. Publicarla afirmaría una alianza inexistente |
| A14 | Convivencia social después de la actividad | **Sunny Originals** | **Run & Coffee Social** | `originals/original-run-and-coffee-01.webp` | **Alta** | ✅ Usado. Es el "después" de la experiencia, que es justo la promesa del Original (correr y quedarse a convivir) |
| A15 | Club de running femenino | — | — | — | **Baja** | ❌ **No usado.** Jerseys con `RUNNING CLUB MAD` legible (Madrid) |
| A16 | Club de running masculino | — | — | — | **Baja** | ❌ **No usado.** Logotipo `OACE` grande y legible; ciudad europea reconocible |

**Resumen**: 13 usados · 3 pendientes de asignación (descartados por marca de terceros legible) · 0 videos.

## 3. Mapeo de experiencias demo — corregido según los assets reales

El brief (§37) propone seis experiencias demo, pero añade: *"Si las carpetas de PaginaWeb indican otros nombres o experiencias: usa el contenido real adjunto; no fuerces estas seis; documenta el mapeo."* Se aplicó esa instrucción. Dos cambios:

| Propuesta del brief | Se cambió a | Por qué |
|---|---|---|
| **Sunrise Paddle** | **Pádel Mix-In** | La carpeta `Padel` contiene **pádel**, el deporte de raqueta con paredes de cristal (A10, A11, A12) — no *paddle boarding* sobre agua. No existe ni una sola foto acuática. Mantener "Sunrise Paddle" habría puesto una cancha de raqueta en una experiencia de remo |
| **Recovery Contrast Session** | **Recovery & Breathwork** | No hay foto de sauna, tina de hielo ni contraste térmico. La única imagen de recuperación disponible (A8) es una sesión guiada en calma. Se ajustó el nombre a lo que la foto realmente muestra |
| Pilates **Reformer** Intro | **Mat Pilates Intro** | A9 muestra pilates **en tapete con pelota**, no camas reformer. El nombre se ajustó a la evidencia |
| Coffee Tasting | *(sin cambio)* | A4 lo sostiene |
| Run & Coffee Social | *(sin cambio)* | A14 lo sostiene; se marca como **Sunny Original** |
| Sunset Yoga | *(sin cambio)* | A7 lo sostiene |

Resultado: 6 experiencias demo, 4 categorías (`movimiento`, `recovery`, `food_coffee`, `comunidad`), 1 Sunny Original, 2 que permiten acompañante. Todas marcadas **"Demostración"** en la interfaz y con fechas futuras.

## 4. Estructura final en el repositorio

```
public/media/sunny/
  hero/        hero-together-01.webp
  experiences/ experience-coffee-tasting-01.webp
               experience-sunset-yoga-01.webp
               experience-recovery-breathwork-01.webp
               experience-mat-pilates-01.webp
               experience-padel-mixin-01.webp
  community/   community-gathering-01.webp
               community-workshop-01.webp
  emmy/        emmy-founder-01.webp
  businesses/  business-coffee-bar-01.webp
  originals/   original-run-and-coffee-01.webp
  categories/  category-food-coffee-01.webp
               category-movimiento-01.webp
```

## 5. Optimización aplicada

- **Formato**: JPEG → **WebP** con `ffmpeg` (`libwebp`, calidad 82). Único codificador de imagen disponible en el entorno (no hay ImageMagick ni Pillow).
- **Proporción**: preservada exactamente. **No se recortó ni se deformó ninguna imagen.** Las verticales siguen verticales; la de Emmy sigue cuadrada.
- **Escala**: no se ampliaron. Los originales de 736 px ya son pequeños para un hero a pantalla completa — razón adicional por la que el hero se diseñó como **split editorial** (columna de foto ~50 % del ancho) en lugar de fondo a sangre: a 736 px una imagen a sangre completa se vería suave en pantallas grandes.
- **Entrega**: `next/image` con `sizes` explícito en cada punto de uso; `priority` únicamente en la foto del hero.
- **`alt`**: descriptivo de lo que ocurre en la imagen, en español, sin handles ni nombres de marca.

## 6. Assets pendientes (bloquean producción)

| Falta | Para qué | Estado |
|---|---|---|
| Video de hero | Hero cinematográfico | **No existe material.** No se fabricó video sintético. El hero usa fotografía |
| Fotografía horizontal | Cualquier banda a sangre 16:9 | No existe. Todo el material es vertical o cuadrado |
| Fotografía propia de las 6 experiencias | Reemplazar A4–A10 en producción | Pendiente de sesión de Emmy |
| Logos de negocios aliados | Sección "Espacios que forman parte de Sunny" | No existe ninguno. La sección **no se renderiza** hasta que haya un `businesses.featured_as_partner = true` real |
| Reemplazo de A11 | Categoría movimiento | Marca `POUNCE PADEL` en la pala |
| Sustitutos de A13, A15, A16 | Categoría/sección de running | Marca de terceros legible |
