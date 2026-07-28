# Sunny Project — Redesign Iteration Plan

Written before implementation, per the request that opened this iteration. Covers diagnosis, files touched, what's preserved, risks, and the asset/responsive/auth/data plans.

## 1. Diagnóstico actual

### Diseño
- El hero (Home y detalle) usa fotografía estática, no video — se ve estático comparado con la referencia.
- Newsreader itálica domina casi todos los `<h1>`/`<h2>` del sitio público — se siente "revista de wellness genérica" en vez de un producto con identidad propia.
- La paleta es ivory/warm-white en casi toda la página; no hay "capítulos" de atmósfera distintos entre secciones.
- `StatsStrip` aparece inmediatamente después del hero, antes de que la persona vea una sola experiencia — invierte la prioridad (credibilidad antes que contenido).
- Las tarjetas de experiencia son uniformes (misma cuadrícula 3 columnas) en Home y en `/experiencias`; no hay una composición editorial con jerarquía.
- Tocar una tarjeta manda de inmediato a otra página — no hay una vista intermedia rápida.
- La sección "Categorías" es una fila de chips de solo-texto sin fotografía ni contenido dinámico.
- `PassShowcase` (Home) es una maqueta **estática** con datos de ejemplo ("SUN-2026-XXXXXX", "Tu próxima experiencia") — no refleja la sesión real del visitante.
- "Para negocios" en Home ya tenía el formulario completo embebido, no en modal.

### Auth (auditoría de código, `/acceso → signInWithOtp → correo → /auth/callback → exchangeCodeForSession → cookie → profile → /mi-pase`)
- **Causa raíz ya resuelta operativamente en esta conversación**: el proyecto de Supabase tenía "Site URL" en `http://localhost:3000` y sin el dominio real en "Redirect URLs", así que el correo mandaba a `localhost` sin importar qué mandara el código. Ya se corrigió desde el dashboard de Supabase.
- **Bug real #1**: `app/acceso/page.tsx` ignora por completo el parámetro `?error=1` con el que `/auth/callback` redirige cuando `exchangeCodeForSession` falla. El usuario vuelve a `/acceso` y no ve ningún mensaje — parece una página en blanco sin explicación, exactamente la sensación de "no pasa nada" reportada.
- **Bug real #2**: no existe `loading.tsx` en ninguna ruta del proyecto. Después del redirect de `/auth/callback` a `/mi-pase` (que hace varias consultas a Supabase), no hay ningún feedback visual durante ese tramo — puede sentirse como que "no pasó nada" en conexiones lentas.
- El resto del flujo es correcto: `handle_new_user()` crea el `profile` automáticamente vía trigger en `auth.users`, el bootstrap de `ADMIN_EMAIL` es server-only y case-insensitive, `cookies().set()` dentro de un Route Handler sí está soportado y documentado por Next.js (se verificó contra `node_modules/next/dist/docs`) — no hay evidencia de que las cookies de sesión se estén perdiendo por código.
- **No hay estados intermedios** ("Enviando enlace", "Validando acceso", "Sesión iniciada", "El enlace expiró") — el pedido explícito de esta iteración.

## 2. Archivos que se modificarán

- `app/page.tsx` — reordenar secciones, nuevos capítulos de color.
- `app/acceso/page.tsx` — leer y mostrar `?error=`.
- `app/auth/callback/route.ts` — distinguir tipos de error (enlace expirado vs otro) para pasar un código específico.
- `app/loading.tsx`, `app/error.tsx` — nuevos, feedback global.
- `components/home/Hero.tsx` → video de fondo + poster + fallback.
- `components/home/HowItWorksNarrative.tsx` → ajuste tipográfico (sans en vez de italic dominante).
- `components/home/PassShowcase.tsx` → reemplazado por lógica real de sesión/reservación (renombrado conceptualmente a "pase dinámico").
- `components/home/CategoriesSection.tsx` — nuevo, tabs interactivos.
- `components/home/ThisWeekSection.tsx` — nuevo, reemplaza el carrusel como composición editorial principal post-hero (el carrusel se conserva como componente pero dentro de esta sección).
- `components/experience/QuickView.tsx`, `QuickViewDrawer.tsx`, `QuickViewSheet.tsx` — nuevos.
- `components/site/PartnerLeadModal.tsx` — nuevo, envuelve el formulario existente.
- `components/site/Header.tsx` / `HeaderInteractive.tsx` — asegurar que el estado de sesión sea inequívoco.
- `app/globals.css` — pequeños ajustes tipográficos (pesos sans para headings).
- `public/demo-assets/*` — nuevos recursos.
- `DEMO_ASSETS.md`, `DATA_FLOW.md` — nuevos/actualizados.

## 3. Componentes que se conservan sin cambios de lógica

- `ClaimPanel.tsx` — la vista rápida reutiliza este componente tal cual para el CTA de reservación; cero cambios a su lógica de red o estados.
- Toda la lógica de `lib/queries.ts`, `lib/experience-cta.ts`, `lib/experience-status.ts`.
- Todas las funciones transaccionales de Postgres, RLS, migraciones.
- Todo `/admin/**` (fuera de alcance explícito de esta fase).
- `/mi-cuenta`, `/historial` (sin cambios de diseño esta fase).
- `PartnerLeadForm.tsx` — se reutiliza dentro de un modal, sin tocar su lógica de envío.
- Todas las plantillas de correo y el envío vía Resend.

## 4. Riesgos funcionales y cómo se mitigan

| Riesgo | Mitigación |
|---|---|
| Video de fondo afecta rendimiento móvil | `prefers-reduced-motion`, `navigator.connection.saveData`, y un check de ancho de pantalla determinan si se monta `<video>` o solo el poster. El poster siempre se muestra primero (`poster` attribute), nunca hay layout shift. |
| Vista rápida (drawer/sheet) duplica lógica de reservación | No: monta el mismo `ClaimPanel` ya existente dentro del drawer/sheet. Un solo punto de verdad. |
| Cambiar el orden de la Home rompe anclas/links existentes | Ningún componente usa anclas internas (`#id`) hacia estas secciones; es seguro reordenar. |
| Nuevo `loading.tsx` global puede parpadear en navegaciones rápidas | Next solo lo muestra si la carga tarda lo suficiente (Suspense-based); no se fuerza un delay mínimo. |
| Cambios tipográficos rompen jerarquía visual en `/experiencias` y detalle | Se aplica el mismo criterio (sans para headings, serif solo como acento) de forma consistente en las tres superficies para que no se sientan inconsistentes entre sí. |
| No poder probar el magic link end-to-end desde este entorno (sin bandeja de correo) | Se audita el código exhaustivamente y se prueban todas las partes verificables sin correo (páginas, RPCs, redirects, admin); se documenta explícitamente qué queda pendiente de que el usuario confirme con un clic real. |

## 5. Plan de assets

Sin acceso a Pexels/Unsplash desde este entorno (confirmado, no supuesto — bloqueo de red repetido incluso tras cambiar a "Full" en un intento previo, y esta sesión ya arrancó con la política anterior). Se generan localmente con `ffmpeg` + los SVG/WebP ya usados como fuente:

- `hero-reel.mp4` — montaje de ~15s compuesto por 5 clips generados (Ken Burns/pan sobre las ilustraciones ya usadas por categoría), sin audio, H.264, optimizado.
- `hero-poster.webp` — primer frame extraído del video.
- Resto de imágenes de categoría/negocio ya existen en `/public/demo-assets/*.webp` (ronda anterior) y `/public/images/placeholder-*.svg`; se reutilizan donde aplique (para-negocios, comunidad).

Documentado con total honestidad en `DEMO_ASSETS.md` — son placeholders generados, no fotografía real, con instrucciones exactas de qué archivo reemplazar cuando haya acceso a Pexels/Unsplash o material real del negocio.

## 6. Plan responsive

- Hero: video solo si `!prefersReducedMotion && !saveData`; siempre hay poster como `<img>`/`background` de respaldo, nunca un hueco en blanco.
- Vista rápida: drawer lateral en `lg:` (≥1024px), bottom sheet en móvil — mismo componente de datos, distinto contenedor de presentación según viewport.
- Categorías: tabs horizontales con scroll en móvil, fila completa en desktop.
- Capítulos de color: los cambios de fondo son secciones completas (`<section>` full-width), no elementos flotantes — no generan scroll horizontal ni layout shift en ningún viewport.

## 7. Plan de auth (qué se corrige exactamente)

1. `/acceso` lee `?error=` y muestra uno de: "El enlace expiró o ya se usó. Pide uno nuevo." (código `expired`) o "No pudimos validar el enlace. Intenta de nuevo." (código genérico).
2. `/auth/callback` distingue el código de error de Supabase (`error_code=otp_expired` viene en la URL cuando el link expiró) y pasa el código correspondiente.
3. `MagicLinkForm` gana un estado `sending` ya existente (se mantiene) y texto más explícito.
4. Nuevo `app/loading.tsx` da feedback visual genérico durante cualquier transición de servidor, incluyendo el tramo `/auth/callback → /mi-pase`.
5. El header (ya server-rendered por request) se re-verifica: como `/auth/callback` hace un `redirect` real de servidor (no client-side), la siguiente página SIEMPRE re-renderiza `<Header>` desde cero con la sesión ya establecida — se confirma que esto es correcto por diseño, no se necesita cambiarlo, solo se documenta.

## 8. Plan de datos

Ver `DATA_FLOW.md` (documento separado, se crea en esta misma iteración) con el mapeo completo de `profiles`, `experiences`, `reservations`, `businesses`, `partner_leads`: qué endpoint recibe cada acción, qué valida, dónde se guarda, dónde lo ve la administradora, qué correo se dispara y qué pasa si falla.

## 9. Fuera de alcance en esta fase (confirmado con el brief)

- Rediseño de `/admin`.
- `/mi-cuenta`, `/historial`.
- Integración con Google Sheets/Airtable.
- Cambiar magic link por contraseñas.
- Cualquier cambio de esquema de base de datos (no se justifica ninguno en esta iteración; todo lo nuevo es de presentación o lectura de datos ya existentes).
