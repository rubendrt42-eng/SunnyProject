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
| `pnpm test` | ✅ **76 pruebas** en 9 archivos (9 omitidas: integración que requiere Supabase real) |
| `pnpm build` | ✅ Compila; 30 rutas |
| Scroll horizontal | ✅ 42/42 combinaciones sin scroll lateral |
| Rutas públicas | ✅ 200 en `/`, `/experiencias`, `/experiencias/[slug]`, `/acceso`, `/como-funciona`, `/para-negocios`, `/preguntas-frecuentes`, `/terminos` |
| Rutas de panel sin sesión | ✅ 307 a `/acceso?next=…`, cuerpo vacío |
| Rutas de panel con sesión admin | ✅ 200 en las 6 |

`pnpm test:e2e` no se ejecutó: las especificaciones de Playwright existentes esperan un Supabase alcanzable.
