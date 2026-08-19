# Auditoría visual — MVP Lean

> **Nota de vigencia — 19 de agosto de 2026**
>
> Auditoría del 18 de agosto. Desde entonces hay 32 commits en `mvp-lean` y
> **cuatro de estos hallazgos están cerrados**. Se corrigen aquí las
> afirmaciones que ya no describen el sitio; el resto del juicio visual se deja
> como estaba, que es para lo que sirve el documento.
>
> | Lo que decía | Lo que se mide hoy |
> |---|---|
> | Hero con fotografía a sangre completa | **No hay fotografía.** La de referencia no estaba autorizada y se sustituyó por una composición de marca hecha solo con CSS. El hero vuelve a ser fotográfico en cuanto se suba una al campo del gestor de contenido |
> | Contador «2 experiencias disponibles» | **cerrado** (`dd36edd`): contaba también las agotadas. El del hero solo aparece a partir de tres y ya cuenta las solicitables; el del catálogo dejó de prometer disponibilidad |
> | `heading-order` en `/experiencias` | **cerrado**: axe-core da **0 violaciones** en las siete rutas públicas, a 390, 768 y 1280 |
> | MOTION-01, el contenido nace invisible | **cerrado**: 0 apariciones de `opacity:0` en el HTML del servidor de las siete rutas |


**Rama:** `mvp-lean` · **Commit:** `8b58d6e` · **Fecha:** 17 de agosto de 2026
**Sitio:** https://sunny-mvp.vercel.app

Diagnóstico. No se corrigió nada.

---

## Cómo se hicieron estas capturas, y por qué importa

Las capturas de `qa/screenshots/` se tomaron contra un **servidor local que corre
el mismo commit desplegado**, con los **datos reales de Sanity** (producción)
servidos a través de un proxy local.

> Estas capturas son del 18 de agosto y **no muestran el sitio actual**: llevan
> datos de contacto inventados, vocabulario retirado y el hero fotográfico que
> se quitó por licencia. El detalle de qué cambió, y capturas fechadas del sitio
> de hoy, están en `qa/screenshots/README.md`.


No se tomaron directamente contra la URL de Vercel, y la razón es un hallazgo en
sí misma:

Este contenedor no deja salir al navegador a internet —solo a `curl`— así que
para llegar al sitio publicado hubo que reenviar cada petición del navegador a
través de `curl`. Con ese reenvío, **algunos archivos de JavaScript no llegaron**,
y el resultado fue una página con los fondos de cada sección pintados y **todo el
contenido invisible**: solo se veía el hero y el pie.

Eso no es un defecto del sitio: los archivos se sirven con estado 200 y las
fuentes cargan correctamente (verificado: 14 archivos de fuente, 0 peticiones
fallidas). Pero sí demuestra algo real sobre cómo está construido el sitio, y está
recogido abajo como **MOTION-01**.

Las capturas se tomaron con `prefers-reduced-motion: reduce`. Con el ajuste
normal, la captura de página completa sale en blanco por otro motivo técnico
(Lenis transforma el contenedor de scroll y la captura larga se desincroniza).
Lo que se ve en las imágenes es la **composición y el layout finales**, no el
comportamiento de las animaciones.

---

## HOME — sección por sección

Referencia: `home-desktop-1440.png`, `home-mobile-390.png`, `home-mobile-320.png`.
Altura medida: **5.775 px** en escritorio (6,4 pantallas) · **7.263 px** en móvil
390 (8,6 pantallas).

### 1. Header

**Funciona:** el logotipo en serif itálica tiene carácter y se distingue. La
navegación de cuatro elementos cabe holgada. El botón amarillo destaca sin gritar.
En móvil colapsa a un botón de menú que abre 20 enlaces visibles.

**Qué revisar:**
- El botón **«Explorar experiencias»** lleva a `/experiencias`, que es también el
  primer elemento de la navegación. Dos controles al mismo destino, a 30 px uno
  del otro. El botón principal del header debería llevar a algo que la navegación
  no ofrezca ya.
- La navegación incluye **«Cómo funciona»**, que apunta a una página escrita para
  la plataforma con cuentas y reservaciones (ver `MVP_AUDIT_PACKAGE.md`, sección
  de restos). Es el segundo destino más accesible del sitio.
- **«Comunidad»** es un ancla a `/#comunidad`, no una página. Mezclada entre tres
  enlaces a páginas, sin ninguna señal de que es distinto.

### 2. Hero

**Funciona:** es lo mejor del sitio. Titular en dos colores con la segunda línea
en amarillo, sobre una capa oscura que sostiene el texto.

> Cuando se escribió esto el fondo era una fotografía a sangre completa. Esa
> imagen no estaba autorizada para producción —lo dice esta misma auditoría dos
> puntos más abajo— y se retiró. Hoy el fondo es una composición de marca hecha
> solo con CSS, y el hero vuelve a ser fotográfico en cuanto Emmy suba una imagen
> al campo del gestor de contenido, sin tocar código. Medido con una fotografía
> de prueba: el peor píxel del titular da 8.19:1 de contraste incluso sobre una
> imagen blanca pura.

La jerarquía es clara y la promesa se lee en tres segundos. El grano evita el
aspecto de banco de imágenes.

**Qué revisar:**
- ~~El contador **«2 experiencias disponibles»** junto al botón es honesto, pero
  con dos experiencias de prueba dice en voz alta que el sitio está vacío.~~
  ✅ **Cerrado.** Solo aparece a partir de tres experiencias, y desde `dd36edd`
  cuenta las que se pueden solicitar: no era honesto, contaba también las
  agotadas.
- La fotografía **no está autorizada para producción** (ver sección de assets).
- Composición: en escritorio el texto ocupa el tercio izquierdo y el derecho queda
  con la fotografía sin nada encima. Se sostiene, pero es el punto donde cabría
  algo más —una tarjeta de la próxima experiencia, por ejemplo—.

### 3. Experiencias («Esta semana»)

**Este es el problema visual más grave del sitio.**

- **Las tarjetas no tienen fotografía.** Las tres experiencias en Sanity tienen
  `mainImage` vacío, así que cada tarjeta muestra un rectángulo gris con el texto
  «Sin fotografía» ocupando **la mitad superior de la tarjeta**. En una página
  cuyo argumento es «mira qué planes hay», el elemento central son dos rectángulos
  grises.
- **Solo hay dos tarjetas en una rejilla de tres columnas.** El tercio derecho
  queda vacío y la fila se ve incompleta, no deliberada. La rejilla no se adapta
  al número de elementos.
- **Todo el contenido dice «TEST —»**: «TEST — Yoga & Coffee», «TEST — Espacio de
  prueba», «TEST — Ubicacion de prueba» (sin acento), y descripciones que dicen
  literalmente «Borrar antes de abrir al publico».
- Las insignias **«Disponible»** y **«Agotada»** sí funcionan y se distinguen bien.
- Proporción: las tarjetas usan `aspect-4/5` para la imagen. Con foto real
  funcionaría; con el placeholder gris la proporción vertical exagera el vacío.

**Tipografía y espaciado de la sección:** el antetítulo naranja «ESTA SEMANA» y el
titular a tres líneas están bien resueltos. El espacio entre el titular y la
rejilla (40 px) es correcto.

### 4. Qué es Sunny

**Funciona:** la mejor sección después del hero. Dos columnas, texto a la
izquierda con un remate en serif itálica naranja («Se trata de encontrar nuevas
formas de vivir»), retrato de Emmy a la derecha con su pie de foto. El contraste
entre sans y serif itálica aquí sí tiene función: separa la afirmación del
argumento.

**Qué revisar:**
- Las dos subcolumnas («Para quien busca» / «Para los espacios») tienen texto
  muy pequeño y quedan pegadas al párrafo superior. Se leen como una nota al pie.
- El enlace **«Cómo funciona el pase →»** usa la palabra **pase**, del modelo
  anterior, y lleva a la página heredada.
- La fotografía de Emmy es el único asset plausiblemente propio del proyecto.

### 5. Cómo funciona (3 pasos)

**Funciona:** tres pasos numerados en naranja, en cajas blancas sobre marfil. La
redacción es correcta y en el lenguaje nuevo («Solicita tu lugar», «Confirmamos
contigo»). Accesible: la lista es una `<ul>` real.

**Qué revisar:**
- **Es la sección más plana del sitio.** Tres rectángulos blancos idénticos, sin
  imagen, sin icono, sin variación de tamaño. Ocupa 300 px de alto y no aporta
  ninguna textura visual. En un sitio que va de experiencias físicas, el paso
  «Descubre una experiencia» no muestra ninguna.
- El número (1, 2, 3) es pequeño y del mismo peso que el resto: no ancla la
  lectura.

### 6. Comunidad

**Funciona:** la frase en serif itálica amarilla sobre marfil («Eso no significa
que te vas a ir igual») es memorable y rompe el ritmo tipográfico.

**Qué revisar:**
- **Las dos fotografías se salen del borde derecho** en escritorio. La segunda
  queda cortada por el límite de la ventana. Puede ser intencional (composición
  desbordada) pero a 1440 px se lee como un error de layout, no como una decisión.
- El botón **«Ver esta semana»** queda solo abajo a la izquierda, muy separado del
  texto y muy pequeño respecto al bloque de imágenes.
- El desequilibrio izquierda/derecha es fuerte: texto pequeño a la izquierda,
  masa fotográfica grande a la derecha, y mucho aire sin usar entre ambos.

### 7. Para negocios

**Funciona:** el cambio de fondo a durazno (`bg-orange/8`) marca claramente que
esto va dirigido a otro público. Centrado, corto, con un solo botón. Correcto.

**Qué revisar:**
- Es un bloque de texto centrado sin ningún elemento visual. Comparado con la
  sección equivalente de la versión avanzada, es un cartel.

### 8. Preguntas frecuentes

**Funciona:** acordeón limpio, cinco preguntas, buena densidad.

**Qué revisar:**
- Las preguntas vienen de `DEFAULT_SETTINGS` porque el documento de Sanity tiene
  las suyas, pero incluyen **«¿Necesito crear una cuenta?»** y **«¿Solicitar un
  lugar es lo mismo que reservarlo?»**. Ambas están bien respondidas para el
  modelo nuevo, pero introducen los conceptos «cuenta» y «reservar» en la mente de
  quien lee, justo lo que este MVP quiere evitar mencionar.

### 9. Contacto

**Esta sección está rota en el sitio publicado.**

Muestra el titular «¿Nos escribes?» y el subtítulo, y **debajo no hay nada**:
ni WhatsApp, ni Instagram, ni correo. La causa es concreta: en Sanity los campos
`whatsapp`, `instagramUrl` y `contactEmail` están **vacíos**, y `DEFAULT_SETTINGS`
no define valores de reserva para ellos —solo para el titular, el subtítulo y las
preguntas—. Cada enlace se renderiza condicionalmente, así que los tres
desaparecen y queda un encabezado invitando a escribir sin decir a dónde.

Visualmente: 100 px de alto de sección con dos líneas centradas y aire vacío
debajo.

### 10. Pie de página

**Funciona:** tres columnas, jerarquía clara, contraste correcto sobre carbón.

**Qué revisar:**
- Muestra **`@sunnyproject.mx`** y **`hola@sunnyproject.mx`**, que están escritos
  en el propio componente del pie y **no corresponden a cuentas reales**. Son
  datos de contacto falsos publicados.
- El texto descriptivo dice **«Un pase gratuito por semana»** — vocabulario del
  modelo anterior, en todas las páginas del sitio.
- El copyright dice **«Proyecto de demostración — Monterrey»**.
- Enlaza a **Privacidad** y **Términos**, dos páginas escritas para la plataforma
  con cuentas y reservaciones.

---

## Ritmo general de la portada

Los fondos, en orden: marfil → carbón (hero) → marfil → blanco cálido → marfil →
blanco cálido → durazno → marfil → blanco cálido → carbón (pie).

Después del hero, **todo el cuerpo de la página vive entre marfil y blanco
cálido**, dos tonos separados por muy poco. La única variación real es el bloque
durazno de negocios. No hay ninguna sección oscura entre el hero y el pie, y no
hay ninguna sección a sangre completa.

El efecto es una página que empieza fuerte y luego se aplana: nueve secciones
casi del mismo color, del mismo ancho de contenedor y de la misma altura
aproximada. Nada indica «esto es más importante que aquello».

---

## `/experiencias`

`experiences-desktop.png` · `experiences-mobile.png`

- Encabezado correcto: antetítulo «Monterrey», titular «Todo lo que puedes hacer
  estos días», y una línea que hoy dice «2 experiencias, de la más próxima a la
  más lejana». Decía «2 experiencias **disponibles**» contando también la
  agotada, que se anunciaba como tal en la tarjeta de al lado (`dd36edd`).
- Mismo problema de tarjetas sin fotografía, agravado: aquí las tarjetas **son**
  la página. Dos rectángulos grises en 1.387 px de alto.
- ~~**Violación de accesibilidad detectada** (axe): salto en el orden de
  encabezados (`heading-order`, impacto moderado).~~ ✅ **Cerrado**: se añadió el
  encabezado de la lista, visualmente oculto y presente para la tecnología
  asistiva. axe-core da hoy **0 violaciones** en las siete rutas públicas.
- No hay filtros, búsqueda ni ordenación. Con dos experiencias no hace falta;
  conviene anotarlo para cuando haya quince.

## Detalle de experiencia

`experience-detail-desktop.png` · `experience-detail-mobile.png`

- **Funciona bien.** Es la página mejor resuelta después del hero: datos en dos
  columnas con iconos (cuándo, termina, dónde, con quién), descripción, requisitos
  con viñetas naranjas, y el formulario al final.
- Sin fotografía de cabecera, porque la experiencia no tiene imagen. En la versión
  con foto real esta página gana mucho.
- El formulario tiene etiquetas reales asociadas a cada campo, pista bajo el
  WhatsApp, y campo trampa oculto. Correcto.
- axe: **0 violaciones**.

## Experiencia agotada

`experience-sold-out-desktop.png` · `experience-sold-out-mobile.png`

- Insignia **«Agotada»** en gris neutro y **el formulario desaparece**. La
  decisión es correcta: no se puede solicitar lugar donde no lo hay.
- Falta un mensaje que diga qué hacer en su lugar («avísame si se libera», «ver
  otras experiencias»). Ahora mismo la página simplemente termina.

## `/para-negocios`

`business-desktop.png` · `business-mobile.png`

- Formulario largo y correcto, con campos opcionales bien marcados.
- Sin ninguna fotografía ni prueba social. Para convencer a un estudio de ceder
  lugares gratis, la página no muestra ningún espacio que ya participe.

## `/como-funciona` — heredada

`how-it-works-desktop.png` · `how-it-works-mobile.png`

Visualmente correcta y **conceptualmente incorrecta para este MVP**. Habla de
«pase semanal gratuito», «presenta tu nombre y folio al llegar», «solo puedes
tener una reservación activa a la vez por semana». Enlazada desde el header.

## `/preguntas-frecuentes`, `/privacidad`, `/terminos` — heredadas

`faq-desktop.png` · `privacy-desktop.png` · `terms-desktop.png`

Las tres están publicadas y enlazadas desde el pie. Describen un producto con
cuentas de usuario, folios, cancelación con 12 horas de antelación y renovación
semanal del pase. Ninguna de esas cosas existe en el MVP.

---

## MOTION ISSUES

### MOTION-01 · CRÍTICO — el contenido nace invisible y depende del JavaScript

> ✅ **CERRADO.** Medido en las siete rutas públicas de producción: **0**
> apariciones de `opacity:0` en el HTML del servidor, y la portada llega con 3838
> caracteres de texto sin ejecutar nada. El revelado pasó a animación ligada al
> scroll, que arranca visible. Lo de abajo queda como registro de lo que se
> encontró.

El HTML que enviaba el servidor traía `opacity:0; transform:translateY(16px)` **en
línea** sobre los envoltorios de revelado. El contenido solo se hace visible
cuando el JavaScript hidrata y el observador de intersección dispara la
animación.

Consecuencia: si el JavaScript tarda, falla o se bloquea, el visitante ve **los
fondos de las secciones y nada más**. No es hipotético — es exactamente lo que
ocurrió al capturar el sitio a través de un reenvío que perdió algunos archivos, y
está documentado en `qa/screenshots/` en la primera tanda descartada.

Afecta a: portada completa por debajo del hero, `/experiencias`,
`/para-negocios`. El hero se salva porque no usa revelado por scroll.

Nota: el contenido **sí está en el HTML**, así que los buscadores lo indexan. El
riesgo es de personas, no de SEO.

### MOTION-02 · MEDIO — error de hidratación de React en la portada

Con el ajuste de movimiento normal, la portada del sitio publicado lanza:

```
Error: Minified React error #418  (hydration mismatch)
```

Reproducido en carga limpia. Causa probable: `HeaderInteractive` decide si el
header flota leyendo el scroll con `useSyncExternalStore`, y el valor del
servidor no coincide con el del cliente. No rompe la página visiblemente, pero
React descarta y rehace ese árbol, lo que puede producir un parpadeo del header
en la primera carga.

### MOTION-03 · MEDIO — la captura larga se desincroniza por el scroll suave

Con movimiento normal, Lenis aplica una transformación al contenedor de scroll.
Cualquier herramienta que redimensione la ventana para capturar la página entera
—o cualquier extensión que haga lo mismo— obtiene una imagen desplazada. Es un
síntoma de que el scroll de la página no es el scroll del navegador.

### MOTION-04 · MENOR — `InViewReveal` sin escalonar en la rejilla

Las tarjetas de experiencia entran todas a la vez. Con dos tarjetas no se nota;
con seis, la entrada simultánea se lee como un salto en vez de como una
secuencia. El sistema ya tiene el valor de escalonado definido
(`STAGGER.item = 0.06`) y no se usa aquí.

### MOTION-05 · MENOR — el menú móvil no tiene estado de foco visible al abrir

`FullscreenMenu` abre con 20 enlaces. No se verificó que el foco del teclado
entre al panel ni que quede atrapado dentro mientras está abierto.

---

## Resumen de la auditoría visual

**Lo que está bien y no hay que tocar:** el hero, la página de detalle, el sistema
tipográfico, el formulario de solicitud, las insignias de estado, el pie.

**Lo que hunde la percepción del sitio, por orden:**

1. Las tarjetas sin fotografía (`Sin fotografía` en gris) en la sección que es el
   argumento central de la página.
2. Contenido de prueba visible: «TEST —» en todas partes, incluido «Borrar antes
   de abrir al publico».
3. La sección de contacto vacía.
4. Datos de contacto falsos en el pie.
5. Cuatro páginas publicadas que describen un producto distinto al real.
6. El aplanamiento del ritmo: nueve secciones casi del mismo color y peso.
