# Capturas de QA — qué es cada tanda

Aquí conviven dos tandas de imágenes que muestran **sitios distintos**. Antes de
usar cualquiera como referencia, mira de cuál es.

---

## Tanda del 18 de agosto de 2026 — histórica, NO es el sitio actual

Las 27 imágenes sin fecha en el nombre (`home-desktop-1280.png`,
`experiences-mobile.png`, `request-form-error.png`…). Son la evidencia de la
auditoría de ese día y por eso se conservan: `qa/VISUAL_AUDIT.md` y
`qa/RESPONSIVE_AUDIT.md` las citan por nombre para sostener sus hallazgos.

**Muestran cosas que después se quitaron a propósito, y varias están hoy
expresamente prohibidas en el proyecto.** Listado, para que nadie las lea como
el estado actual:

| Lo que se ve en esas capturas | Por qué ya no está |
|---|---|
| Pie con **`@sunnyproject.mx`** y **`hola@sunnyproject.mx`** | Datos de contacto **inventados**. El sitio de hoy no publica ningún canal, y no lo hará hasta que haya uno real |
| **«Un pase gratuito por semana»** en el pie | Vocabulario del producto anterior —«pase»—, retirado |
| **«sin comprometerte con una membresía»** | Igual: «membresía» es vocabulario retirado |
| **Hero fotográfico** (dos personas jugando pádel) | Esa imagen es de referencia y **no está autorizada**. Hoy el hero es una composición hecha solo con CSS |
| **«2 experiencias disponibles»** junto al botón | Contaba también las agotadas. Corregido en `dd36edd` |
| Sección de Comunidad con **dos fotografías** | Reescrita como pieza tipográfica; no usa fotografía |
| Enlace **«Términos»** en el pie | Esa página no existe |
| Marca **«Sunny Project»** | Hoy es «The Sunny Project» |
| **«Proyecto de demostración»** en el aviso legal | Ya no lo dice |

> Si necesitas una imagen para enseñarle el sitio a alguien, **no uses estas**.

---

## Tanda del 19 de agosto de 2026 — el sitio actual

Las que llevan la fecha delante:

- `2026-08-19-home-desktop-1280.png`
- `2026-08-19-home-mobile-390.png`

Tomadas del build de producción contra el contenido real de Sanity, recorriendo
la página entera antes de capturar para que el revelado ligado al scroll quede
asentado.

Ojo con una cosa al mirarlas: las experiencias que aparecen siguen siendo las de
prueba, las que empiezan con **`TEST —`**. Están en Sanity a propósito para
verificar que el sitio funciona, y hay que borrarlas antes de enseñárselo a
Emmy — es el primer punto de la lista de `MVP_SETUP.md` §8.

---

## Cómo volver a generarlas

No hay script fijo: se levanta el sitio con `pnpm build && pnpm start` y se
captura con Playwright a página completa. Lo importante al hacerlo es recorrer
la página hasta abajo y volver arriba antes de disparar, porque casi todo el
movimiento del sitio está ligado a la posición del scroll: capturar sin
recorrerla deja secciones a medio revelar y la imagen miente sobre cómo se ve.
