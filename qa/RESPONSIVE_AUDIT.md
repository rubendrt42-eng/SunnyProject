# Auditoría responsive — MVP Lean

**Rama:** `mvp-lean` · **Commit:** `8b58d6e` · **Sitio:** https://sunny-mvp.vercel.app

Medido sobre el mismo commit desplegado, con datos reales de Sanity. Capturas de
página completa en `qa/screenshots/`.

---

## Medidas

| Ancho | Alto de la portada | Pantallas de scroll | Desborde horizontal | Imágenes rotas |
|-------|--------------------|---------------------|---------------------|----------------|
| 320   | 7.527 px | 8,9 | no | 0/4 |
| 375   | 7.298 px | 8,6 | no | 0/4 |
| 390   | 7.263 px | 8,6 | no | 0/4 |
| 430   | 7.306 px | 8,7 | no | 0/4 |
| **768** | **6.254 px** | 6,9 | **SÍ — 41 px** | 0/4 |
| 1024  | 5.457 px | 6,1 | no | 0/4 |
| 1280  | 5.660 px | 6,3 | no | 0/4 |
| 1440  | 5.775 px | 6,4 | no | 0/4 |

---

## RESP-01 · El único desborde real: 768 px

A 768 px el documento mide **809 px de ancho** contra una ventana de 768. Son
**41 px** que se pueden desplazar lateralmente.

Lo que hace este hallazgo incómodo: al recorrer todos los elementos del `<body>`
buscando cuál sobresale, **ninguno lo hace**. Ningún rectángulo de ningún elemento
cruza el borde derecho. El desborde viene de algo que no aparece en esa medición
—un pseudoelemento, un elemento transformado, o un `100vw` que cuenta la barra de
desplazamiento—.

No se persiguió más porque este paso es de diagnóstico, pero queda anotado como
lo que es: **reproducible, medible, y sin culpable identificado**. Merece una
sesión dedicada con las herramientas del navegador.

Nota: 768 es exactamente el ancho de un iPad en vertical.

---

## Revisión por breakpoint

### 320 px — el más estrecho

- **Logotipo:** legible, no se corta.
- **Header:** colapsa a botón de menú. Correcto.
- **Menú:** abre a pantalla completa con 20 enlaces visibles.
- **Títulos:** el titular del hero rompe en cuatro líneas («Descubre algo / nuevo.
  / Vívelo con / alguien.»). Se sostiene, pero está en el límite: una palabra más
  larga lo rompería mal.
- **Párrafos:** medida de línea corta pero legible.
- **Botones:** ocupan casi todo el ancho disponible, altura táctil correcta.
- **Tarjetas:** apiladas a una columna. El placeholder «Sin fotografía» ocupa una
  proporción enorme de la pantalla — el problema de las fotos se agrava aquí.
- **Fotografías de Comunidad:** quedan muy pequeñas y muy recortadas. Se pierden
  las caras, que es justo lo que la sección quiere mostrar.
- **Rejillas:** todas colapsan a una columna. Correcto.
- **Formularios:** campos a ancho completo, etiquetas encima. Correcto.
- **Padding lateral:** se mantiene y no se come el contenido.
- **Espacio vertical:** las separaciones entre secciones (`py-20`) son las mismas
  que en escritorio. A 320 px eso son casi dos tercios de pantalla en blanco entre
  cada sección — es la causa principal de que la página mida 8,9 pantallas.
- **Pie:** las tres columnas se apilan. Correcto.

### 375 y 390 px — los tamaños reales de la mayoría

Sin diferencias apreciables respecto a 320 más allá de más aire. Todo se comporta.
**Es la mejor experiencia móvil del sitio.**

Lo único: 8,6 pantallas de scroll para ocho secciones sigue siendo mucho para una
página cuyo contenido real son dos tarjetas.

### 430 px

Igual que 390. El titular del hero pasa a tres líneas y respira mejor.

### 768 px — tablet vertical

- **El desborde de 41 px** (RESP-01).
- **La rejilla de experiencias pasa a dos columnas** — y como solo hay dos
  experiencias, aquí es el único ancho donde la fila queda completa y se ve
  deliberada.
- El header **no** ha vuelto todavía a la navegación horizontal: sigue el botón de
  menú. Con 768 px de ancho hay espacio de sobra para los cuatro enlaces. Es un
  breakpoint desaprovechado.
- La sección de Comunidad todavía apila texto e imágenes.

### 1024 px

- Navegación horizontal completa.
- Rejilla de experiencias a tres columnas: **la fila queda con un hueco**, porque
  solo hay dos experiencias.
- La sección «Qué es Sunny» pasa a dos columnas y funciona.
- Es el ancho donde la página mide menos (5.457 px): el contenido se acomoda bien.

### 1280 px

- Prácticamente idéntico a 1440. El contenedor tiene ancho máximo, así que a
  partir de aquí lo que crece son los márgenes laterales.

### 1440 px

- **Las fotografías de Comunidad se salen por el borde derecho.** A este ancho es
  donde más se nota (ver `VISUAL_AUDIT.md`, sección 6).
- El hero deja el tercio derecho sin contenido encima de la fotografía.
- El resto se comporta.

---

## Patrones transversales

### RESP-02 · El espacio vertical no se adapta

Las secciones usan `py-20 sm:py-28` — 80 px en móvil, 112 px desde 640 px. Ese
valor no cambia entre 320 y 1440. En escritorio es correcto; en un teléfono de
320 px, 160 px de aire entre secciones (arriba y abajo) equivale a casi media
pantalla en blanco cada vez.

Es la razón por la que la portada pasa de 6,4 pantallas en escritorio a 8,9 en
móvil, **con el mismo contenido**.

### RESP-03 · El breakpoint de 768 no se usa para el header

El menú de hamburguesa se mantiene hasta 1024. Entre 768 y 1023 hay ancho de
sobra para la navegación horizontal y no se aprovecha.

### RESP-04 · La rejilla no se adapta al número de elementos

`ExperienceGrid` usa tres columnas fijas en escritorio. Con dos experiencias, la
fila queda con un hueco a la derecha en 1024, 1280 y 1440. Con una sola
experiencia quedarían dos huecos.

Esto no es un problema de contenido, es un problema de composición: la rejilla
debería reaccionar a cuántas experiencias hay, no al ancho de la ventana
únicamente.

### RESP-05 · Las fotografías de Comunidad no tienen tratamiento por breakpoint

A 1440 se desbordan por la derecha; a 320 quedan demasiado pequeñas para que se
vea lo que muestran. Es la misma composición escalada, sin recorte ni reencuadre
adaptado.

### Lo que está bien y conviene no romper

- **Cero desbordes** en siete de los ocho anchos medidos.
- **Cero imágenes rotas** en todos los anchos.
- Todos los formularios funcionan en todos los anchos, con etiquetas asociadas y
  alturas táctiles correctas.
- El pie y el header se comportan en todo el rango.
- El menú móvil abre y muestra los 20 enlaces sin recortes.
