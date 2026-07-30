# Sunny Project — Auditoría MVP 1.1

Documento de auditoría únicamente. No se modificó código, estilos, configuración ni base de datos para producir este documento — todo lo aquí descrito refleja el estado del repositorio en el commit `9ad56be` (rama `claude/sunny-project-mvp-i5f1ey`) al momento de escribirlo.

Regla seguida en todo el documento: si algo no fue probado de extremo a extremo con datos reales en este entorno, se marca explícitamente como **no probado**, nunca como "funciona".

---

## 1. Resumen del estado actual

Sunny Project hoy es, en código, una plataforma de **reservación de un pase semanal individual**: una persona se autentica por magic link, completa su perfil, reclama **un** lugar en **una** experiencia por semana, y presenta un folio. El modelo de datos, las funciones transaccionales de Postgres, el panel de Emmy y toda la copy visible ("El pase es individual, no transferible y no admite acompañantes") están construidos alrededor de esa premisa de una sola persona por reservación.

La nueva definición de producto — comunidad de descubrimiento con experiencias que admiten hasta 3 lugares por reservación y acompañantes registrados por el titular — es un cambio de modelo, no un ajuste visual. El sistema de reservación transaccional (la pieza más crítica y mejor probada del proyecto) asume implícitamente "1 reservación = 1 persona = 1 lugar" en al menos tres lugares distintos (índices únicos de base de datos, la función `claim_reservation()`, y el conteo de cupos), y los tres tendrían que cambiar juntos para soportar grupos sin arriesgar sobreventa.

El frontend público pasó por dos rondas de rediseño visual esta sesión (estructura + corrección visual) y está en buen estado de código (lint/typecheck/tests/build en verde de forma consistente), pero **ninguna imagen o video real existe todavía** — el sistema de "asset faltante" funciona y lo muestra honestamente, pero visualmente el sitio hoy se ve incompleto a propósito. El panel de Emmy es funcional para lo que cubre (experiencias, negocios, reservaciones, solicitudes) pero no tiene vista de usuarios ni de titulares/acompañantes (porque acompañantes no existen aún), y sus acciones de ciclo de vida de experiencia son más limitadas que lo que pide el nuevo alcance (no hay duplicar, ocultar ni archivar como acciones distintas).

Ningún flujo autenticado (magic link real, reclamar un pase, cancelar, ver Mi pase) fue probado de extremo a extremo con un correo real en ningún momento de este proyecto — el entorno de desarrollo donde se ha trabajado nunca tuvo acceso de red al proyecto de Supabase real (confirmado repetidamente, incluyendo hoy, con `curl` directo devolviendo "Host not in allowlist").

---

## 2. Funciones existentes y comprobables

Verificado realmente (no solo leído en el código):

- **Build de producción, typecheck, lint**: pasan de forma consistente en cada iteración de esta sesión (`pnpm build`, `pnpm typecheck`, `pnpm lint`).
- **Suite de tests unitarios** (`pnpm test`, Vitest): 40 pruebas pasan, cubren `experience-cta.ts`, `experience-status.ts`, `dates.ts`, `constants.ts`, `demo-content.ts`, `ics.ts`, `validations.ts` — lógica pura, sin red.
- **Render del servidor de desarrollo**: cada ruta pública tocada esta sesión (`/`, `/experiencias`, `/experiencias/[slug]`, `/como-funciona`, `/acceso`, `/mi-pase`) responde HTTP 200 (o el 404/redirect esperado, ver §9) contra el dev server local, confirmado con `curl` — esto prueba que el código compila y renderiza sin excepciones no controladas, **no** que la experiencia visual o interactiva sea correcta (curl no ejecuta JavaScript ni CSS).
- **Estados vacíos / degradación**: con Supabase inalcanzable, `getPublicExperiences` devuelve `{data: [], error: true}` en vez de lanzar, y las páginas muestran el estado vacío correcto en vez de un error 500. Esto está confirmado en vivo, repetidamente.
- **Redirects de servidor**: `/mi-pase` sin sesión redirige a `/acceso?next=/mi-pase` (confirmado vía el digest `NEXT_REDIRECT` en la respuesta). `/experiencias/[slug]` con un slug inexistente dispara `notFound()` (confirmado vía el digest `NEXT_NOT_FOUND`).
- **Sistema de "asset faltante"**: confirmado en vivo que cuando falta `pilates.webp` o `business-partner.webp`, el HTML renderizado contiene el texto exacto "Falta pilates.webp" / "Falta business-partner.webp" en vez de una imagen rota o una ilustración sustituta.

---

## 3. Funciones que existen pero no fueron probadas de extremo a extremo

Todo esto está implementado en código, revisado línea por línea, pero **nunca ejecutado con datos reales**:

- **Magic link completo**: enviar el correo, abrirlo, `exchangeCodeForSession`, cookie de sesión, creación automática de `profile`. Nunca se probó porque este entorno no puede alcanzar `supabase.co` ni recibir correo real.
- **`claim_reservation()`**: la función transaccional que descuenta cupo, genera folio y crea la reservación. Existe una prueba de integración (`tests/integration/reservations.test.ts`) diseñada exactamente para esto — pero está `describe.skipIf(!configured)` y se salta siempre en este entorno porque `TEST_SUPABASE_URL`/`TEST_SUPABASE_SERVICE_ROLE_KEY` nunca estuvieron configuradas. **Nunca se ejecutó, ni una sola vez, en ningún punto de este proyecto.**
- **`cancel_reservation()`** y la ventana de 12 horas.
- **Panel de Emmy contra datos reales**: crear/editar experiencia, crear/editar negocio, cancelar reservación, marcar asistencia/no-show, exportar CSV, cambiar estado de una solicitud — todo el código está ahí, nada se ejecutó contra una base de datos real.
- **Envío de correos transaccionales** (Resend): el código de degradación (log a consola si `RESEND_API_KEY` no está configurada) fue revisado, pero nunca se confirmó un correo real entregado.
- **Quick View** (drawer/sheet), categorías interactivas, pase semanal dinámico: renderizan y no truenan en el smoke test con `curl`, pero **nunca se probaron con un mouse o un dedo reales** — ni un solo click, tap, swipe o navegación de teclado se ejecutó en este proyecto. Todo lo "interactivo" está verificado solo por lectura de código + presencia de las clases/atributos esperados en el HTML.
- **Mobile real**: nunca se abrió en un dispositivo ni en un emulador con viewport táctil. Ver §7.
- **Playwright** (`tests/e2e/public-pages.spec.ts`): existe, nunca se ejecutó en esta sesión (requiere el entorno completamente sembrado, ver el comentario en `playwright.config.ts`).

---

## 4. Funciones faltantes

Contra el nuevo alcance funcional:

1. **Reservación grupal (1/2/3 lugares)** — no existe ningún campo para cuántos lugares consume una reservación. Hoy toda reservación consume exactamente 1.
2. **Acompañantes (nombres)** — no existe tabla ni columna para guardarlos. No hay formulario para capturarlos.
3. **Máximo configurable por experiencia (Emmy lo define)** — `experiences` no tiene columna `max_party_size` ni equivalente.
4. **Conteo de cupos por personas, no por reservaciones** — `reserved_counts_for_experiences()` y `claim_reservation()` cuentan filas, no personas. Sin corregir esto, un grupo de 3 solo restaría 1 del cupo (ver §13, riesgo crítico).
5. **Vista de "Titulares y acompañantes" en el panel de Emmy** — no existe (no puede existir sin el dato).
6. **Duplicar / Ocultar / Archivar experiencia** — el CRUD de experiencias tiene crear/editar y cancelar (vía `admin_cancel_experience`), pero no duplicar, no "ocultar" como estado distinto de `draft`, no archivar. El esquema `status` solo admite `draft | published | cancelled | completed`.
7. **Vista de "Usuarios" en el panel** — no existe ninguna pantalla de admin sobre `profiles`; solo es visible vía el Table Editor de Supabase.
8. **Secciones de Home: "Qué es Sunny Project", "Comunidad", "Espacios aliados"** — ninguna de las tres existe hoy. El Home actual es: Hero → Esta semana en Sunny → Cómo funciona → Categorías → Pase semanal → Para negocios → FAQ → Cierre editorial.
9. **Compartir / invitar experiencias** — no existe ningún mecanismo (ni link de compartir, ni invitación) en ninguna pantalla.
10. **Etiquetas sociales, Sunny Originals** — no existen como concepto en el modelo de datos ni en la UI (no hay columna `tags`, no hay bandera "Original" en `experiences`).
11. **Comunicación semanal** — no existe ningún mecanismo de envío recurrente (todo el envío de correo hoy es transaccional: confirmación, cancelación, nueva solicitud).
12. **Encuesta posterior** — no existe.
13. **Negocios aliados en Home ("Espacios aliados")** — la tabla `businesses` existe y el admin puede crear negocios, pero no hay ninguna sección pública que los liste; el brief pide que solo aparezca "cuando existan aliados reales", lo cual es coherente con no inventar contenido, pero la sección en sí no está construida.

---

## 5. Contradicciones con el nuevo producto

Estas son afirmaciones activas en el código/copy actual que **contradicen directamente** la nueva definición:

- **Copy explícita anti-acompañantes**: `/experiencias/[slug]`, `/mi-pase`, `/terminos`, `/como-funciona` y `/preguntas-frecuentes` dicen literalmente *"El pase es individual, no transferible y no admite acompañantes"*. Esto tendría que reescribirse en cinco archivos distintos el día que se implemente el nuevo alcance — no es solo un cambio de lógica, es un cambio de promesa pública ya publicada.
- **Índice único `reservations_one_active_per_experience`** asume una persona = una fila por experiencia; sigue siendo válido bajo el nuevo modelo (el titular sigue siendo una fila), pero el índice y la función no dicen nada sobre cuántos *lugares* representa esa fila.
- **El pase semanal como "todo el producto"**: la sección dinámica de Home (`PassShowcase`) y buena parte de la copy actual centran la propuesta de valor en el pase. La nueva definición es explícita: *"El pase semanal no es todo el producto"* — esto es una contradicción de énfasis/narrativa, no solo de datos, y afecta directamente la jerarquía de secciones de Home (§ Home deseada) y probablemente el copy de varias páginas (`/como-funciona`, FAQ).
- **`reserved_counts_for_experiences()` cuenta filas**: bajo el nuevo modelo esto subestimará la ocupación real de una experiencia en cuanto exista una sola reservación grupal — es una contradicción técnica silenciosa (no falla, simplemente da un número incorrecto) hasta que se corrija.
- **Capacidad total sin distinguir "cuántos por reservación"**: `experiences.capacity` sigue siendo válido como cupo total del evento, pero no hay ningún lugar donde Emmy configure "máximo 1/2/3 por reservación" — ese concepto simplemente no existe en el esquema hoy.

---

## 6. Páginas y componentes actuales

**Rutas públicas**: `/`, `/experiencias`, `/experiencias/[slug]`, `/acceso`, `/auth/callback` (route handler), `/como-funciona`, `/para-negocios`, `/preguntas-frecuentes`, `/privacidad`, `/terminos`.

**Rutas autenticadas (usuario)**: `/mi-pase`, `/mi-cuenta`, `/historial`.

**Rutas de administración** (bajo `/admin`, protegidas por `requireAdmin()`): `/admin` (dashboard), `/admin/experiencias`, `/admin/experiencias/nueva`, `/admin/experiencias/[id]`, `/admin/negocios`, `/admin/negocios/nuevo`, `/admin/negocios/[id]`, `/admin/reservaciones`, `/admin/solicitudes`.

**API routes**: `POST /api/reservations/claim`, `POST /api/reservations/[id]/cancel`, `GET /api/reservations/[id]/ics`, `POST /api/partner-leads`, `POST /api/admin/experiences/[id]/cancel`, `POST /api/admin/reservations/[id]/cancel`, `POST /api/admin/reservations/[id]/attendance`, `POST /api/admin/reservations/[id]/resend-email`, `GET /api/admin/reservations/export`.

**Componentes públicos clave**: `Hero` + `HeroExperienceRotator` + `HeroVideo`, `ThisWeekSection` (featured + secundarias), `QuickView` (drawer/sheet), `HowItWorksNarrative`, `CategoriesSection`, `PassShowcase`, `ForBusinessSection` + `PartnerLeadModal` + `PartnerLeadForm`, `ExperienceCard` / `FeaturedExperienceCard`, `DetailHero`, `ClaimPanel`, `ManagedPhoto` (sistema de imagen/estado-faltante), sistema de movimiento en `components/motion/*` (Lenis, reveals, modal, fullscreen menu).

**Componentes de admin**: `ReservationRowActions`, formularios de experiencia/negocio (no leídos línea por línea en esta auditoría pero confirmados existentes vía `lib/actions/admin.ts`).

---

## 7. Estado de mobile

No probado en un dispositivo real ni en un emulador táctil en ningún momento de este proyecto. Lo que existe es disciplina de código: clases responsivas de Tailwind (`sm:`/`lg:`) en cada componente tocado, un menú fullscreen dedicado para móvil (`FullscreenMenu`), el Quick View cambia de drawer (desktop) a bottom sheet (móvil) por CSS, y el hero-rotator soporta swipe vía gestos de `motion/react`. Todo esto está en el código y es razonable, pero **"razonable en el código" no es lo mismo que "probado en un teléfono"** — no se puede afirmar que el layout, el tamaño de toque de los botones, o el comportamiento del bottom sheet funcionen correctamente en un viewport real sin abrirlo en uno.

---

## 8. Estado de autenticación

Magic link vía Supabase Auth, sin contraseñas. Flujo en código: `/acceso` → `signInWithOtp` → correo → `/auth/callback` → `exchangeCodeForSession` → cookie de sesión → redirect con `?bienvenido=1` → toast "Sesión iniciada". Estados explícitos ya cubiertos en la UI: enviando, revisa tu correo, error genérico, enlace expirado (`/acceso?error=expired|generic`), sesión iniciada. Bootstrap de admin vía `ADMIN_EMAIL` (server-only, case-insensitive) en el propio callback.

Esto fue **auditado exhaustivamente por lectura de código** en una sesión anterior (incluyendo verificación contra la documentación oficial de Next.js de que `cookies().set()` en un Route Handler es válido) y la causa raíz histórica de "el login se sentía roto" (Site URL de Supabase apuntando a `localhost`) ya se corrigió operativamente desde el dashboard de Supabase. Pero **nunca se ha completado un login real de punta a punta** en este entorno — ni un correo se ha recibido, ni un enlace se ha abierto, ni una sesión real se ha establecido y verificado visualmente.

---

## 9. Estado de reservaciones

Transaccional, correcto en diseño para el modelo actual de "1 persona = 1 lugar": `claim_reservation()` bloquea la fila de la experiencia (`for update`) durante la transacción, así que dos reclamos concurrentes por el último lugar no pueden ambos tener éxito — esto es válido bajo el modelo actual. Reglas de negocio (perfil completo, ventana de reclamo abierta, experiencia no pasada, cupo disponible, un pase por semana, no duplicar reservación en la misma experiencia) están todas dentro de la función SQL, no en el cliente ni en el route handler — el route handler solo traduce el código de error.

Cancelación con ventana de 12 horas, también transaccional (`cancel_reservation()`), y libera el cupo correctamente (una reservación cancelada no cuenta en `reserved_counts_for_experiences`).

**Nada de esto se ha ejecutado contra una base de datos real.** La prueba de integración escrita específicamente para esto nunca corrió (§3). Y — crítico para el nuevo alcance — **este modelo transaccional no tiene ningún concepto de "grupo" hoy**; extenderlo a 1/2/3 lugares con acompañantes requiere tocar la función SQL misma, no solo la capa de presentación (ver §12 y §13).

---

## 10. Estado del panel administrativo

Existe y cubre: dashboard con capacidad total vs. reservada, CRUD de experiencias (crear/editar, sin duplicar/ocultar/archivar), CRUD de negocios, listado de reservaciones con filtros (nombre/correo/folio/experiencia, estado, fecha) + marcar asistencia/no-show + cancelar + reenviar correo + exportar CSV, listado de solicitudes de negocio con cambio de estado (nuevo/contactado/aceptado/rechazado).

No cubre (y el nuevo alcance lo pide explícitamente): vista de usuarios, vista de titulares y acompañantes (no puede existir sin el dato), duplicar experiencia, ocultar experiencia como estado distinto de borrador, archivar. "Emmy debe operar la plataforma sin editar código" ya se cumple para lo que el panel sí cubre — todo eso es CRUD real contra Supabase, no config en archivos.

---

## 11. Estado de imágenes y video

Sistema construido, contenido ausente por decisión explícita del usuario en la corrección visual anterior: se eliminaron las 6 ilustraciones generadas y el video/poster abstracto porque violaban la regla de "nada de assets sintéticos simulando negocios reales". Hoy `/public/demo-assets/` está vacío. `ManagedPhoto` (fotos) y `HeroVideo` (video del hero) muestran un estado neutro honesto — fondo plano + texto "Falta `<archivo>`" — en vez de una imagen rota o una ilustración sustituta, confirmado en vivo. En cuanto se coloquen los 10 archivos reales con los nombres exactos esperados (`hero-reel.mp4`, `hero-poster.webp`, `pilates.webp`, `recovery.webp`, `coffee.webp`, `paddle.webp`, `run-club.webp`, `yoga.webp`, `community.webp`, `business-partner.webp`), el sitio los toma automáticamente sin cambios de código.

---

## 12. Cambios necesarios en el modelo de datos para acompañantes y cantidad de lugares

Esto es una propuesta para revisión, no una implementación.

**En `experiences`**: agregar `max_party_size integer not null default 1 check (max_party_size between 1 and 3)` — lo que Emmy configura por experiencia.

**En `reservations`**: agregar `party_size integer not null default 1 check (party_size between 1 and 3)` — cuántos lugares consume *esta* reservación (titular + acompañantes), y debe ser `<= experiences.max_party_size` en el momento de reservar.

**Acompañantes**: dos formas razonables, a decidir:
- (a) Tabla nueva `reservation_companions (id, reservation_id, full_name, created_at)` — normalizada, más fácil de mostrar/editar individualmente en el panel de Emmy, más fácil de validar `count(companions) = party_size - 1`.
- (b) Columna `companion_names text[]` directamente en `reservations` — más simple, menos flexible si en el futuro se necesita más que el nombre por acompañante.
- Recomendación: (a), porque el panel de Emmy necesita listar titulares y acompañantes como su propia vista, y una tabla relacional lo hace directo con un `select`, mientras que un array requiere `unnest` en cada consulta administrativa.

**Cambios obligatorios en las funciones SQL** (no opcionales, son la parte que previene sobreventa):
- `claim_reservation(p_experience_id, p_party_size, p_companion_names[], p_source)` — debe recibir el tamaño del grupo, validar `p_party_size <= experience.max_party_size`, y el chequeo de cupo debe cambiar de `count(*) >= capacity` a `coalesce(sum(party_size), 0) + p_party_size > capacity`.
- `reserved_counts_for_experiences()` — cambiar de `count(*)` a `sum(party_size)`.
- Si se usa la tabla de acompañantes, insertarlos dentro de la misma transacción que la reservación (para que el "titular responde por su grupo" sea atómico: o se crea todo o no se crea nada).

**Validación de negocio nueva**: ¿puede el titular reclamar un pase individual (`party_size = 1`) en una experiencia con `max_party_size = 3` y luego no agregar acompañantes? Parece que sí, según el alcance ("hasta 2/3 lugares" implica que menos también es válido) — pero es una decisión de producto, no técnica, y debería confirmarse (ver §19).

---

## 13. Riesgos de seguridad o sobreventa

- **Riesgo crítico, ya identificado en §4/§5/§12**: si se agrega `party_size`/acompañantes solo en la capa de presentación (formulario, UI) sin corregir `claim_reservation()` y `reserved_counts_for_experiences()` para sumar personas en vez de contar filas, el sistema **venderá de más silenciosamente** — cada reservación grupal ocupará espacio físico real (2 o 3 personas) pero solo descontará 1 del cupo en la base de datos. Esto no truena, no da error: simplemente permite más gente de la que el negocio puede recibir. Es el riesgo número uno de esta migración.
- **Condición de carrera ya mitigada, debe seguir mitigada**: el `for update` sobre la fila de `experiences` dentro de `claim_reservation()` es lo que hoy previene que dos reclamos concurrentes exploten el último lugar. Cualquier reescritura de esa función para soportar `party_size` debe conservar ese bloqueo — es fácil de perder por accidente al refactorizar.
- **RLS de `reservations` no tiene política de INSERT para el cliente** (correcto, y debe seguir así): toda escritura pasa por las funciones `SECURITY DEFINER`. Si se agrega una tabla `reservation_companions`, debe replicarse el mismo patrón (sin política pública de INSERT, solo escribible desde dentro de la función transaccional) — de lo contrario alguien podría insertar acompañantes fantasma sin pasar por la validación de cupo.
- **Nombres de acompañantes como texto libre**: sin validación de longitud/formato, un titular podría en teoría llenar el campo con contenido no deseado (spam, texto ofensivo) que Emmy vería en el panel — se necesita al menos un límite de longitud y trim, igual que el resto de los campos de texto del proyecto (ya hay un patrón establecido con Zod para esto).
- **Nada de esto ha sido probado bajo carga ni con reclamos concurrentes reales** — la única evidencia de que el bloqueo funciona es la lectura del SQL, nunca se ejecutó un test de concurrencia real (ni siquiera con Supabase alcanzable, jamás se corrió `tests/integration/reservations.test.ts`).

---

## 14. Riesgos de UX

- **Contradicción de copy ya publicada**: cinco páginas dicen "no admite acompañantes" (§5) — si se lanza la función de acompañantes sin actualizar esa copy, el producto se contradice a sí mismo en la misma sesión de navegación.
- **Formulario de acompañantes durante el flujo de reclamo**: `ClaimPanel` hoy es un flujo de un solo paso (checkbox + botón). Agregar "cuántos lugares" + "nombre de cada acompañante" ahí mismo, sin cuidado, puede convertir un flujo de 5 segundos en un formulario largo justo en el momento de mayor fricción (decidir si reservar). Vale la pena decidir explícitamente si el ingreso de nombres es obligatorio *antes* de confirmar o si puede completarse después (ej. desde "Mi pase") — es una decisión de producto, no solo de UI (ver §19).
- **Quick View y el panel de detalle tendrían que mostrar el mismo formulario** — hoy ambos montan el mismo `ClaimPanel`, lo cual es bueno (una sola fuente de verdad), pero significa que cualquier cambio al flujo de reclamo debe funcionar igual de bien en un drawer angosto de escritorio, un bottom sheet móvil, y la página de detalle completa.
- **"Mi pase" y el correo de confirmación deben mostrar titular + acompañantes** (pedido explícito del alcance) — hoy ambos solo muestran los datos del titular; esto es un cambio de contenido en al menos 2 plantillas de correo (`PaseConfirmado`, posiblemente `PaseCancelado`) y la página `/mi-pase`.
- **Estados vacíos de "asset faltante" en producción real**: el sistema que muestra "Falta pilates.webp" es correcto para este momento del proyecto (honestidad sobre datos), pero si Sunny lanza al público antes de subir fotos reales, cada tarjeta se vería con ese aviso — vale la pena confirmar que nadie ve el sitio real hasta que las fotos existan.

---

## 15. Archivos probablemente afectados (por la migración a grupos/acompañantes)

**Base de datos** (nueva migración, no modificar las existentes): `supabase/migrations/2026...__party_size_and_companions.sql` (nueva tabla/columnas), reescritura de `claim_reservation()`, `reserved_counts_for_experiences()`, posiblemente `cancel_reservation()` si acompañantes deben limpiarse o conservarse en la fila cancelada.

**Validación**: `lib/validations.ts` (`claimReservationSchema` necesita `partySize` + `companionNames`).

**Tipos**: `lib/database.types.ts` (`Reservation`, nuevo tipo `ReservationCompanion`, `Experience.max_party_size`).

**API**: `app/api/reservations/claim/route.ts` (pasar los nuevos parámetros a la RPC).

**UI de reclamo**: `components/experience/ClaimPanel.tsx` (agregar selector de cantidad + campos de nombre), posiblemente `components/experience/ProfileCompletionForm.tsx` si se decide capturar acompañantes ahí.

**Mi pase / historial**: `app/mi-pase/page.tsx`, `app/historial/page.tsx` (mostrar grupo).

**Correos**: `emails/PaseConfirmado.tsx` y su llamada en `lib/email/notifications.ts`.

**Panel de Emmy**: `app/admin/experiencias/[id]/page.tsx` + `lib/actions/admin.ts` (campo `max_party_size`), nueva vista `app/admin/reservaciones` ampliada o una nueva ruta para titulares/acompañantes, y las acciones nuevas (duplicar/ocultar/archivar) tocarían `app/admin/experiencias/page.tsx`, `[id]/page.tsx` y `lib/actions/admin.ts`.

**Copy a corregir** (§5, §14): `app/experiencias/[slug]/page.tsx`, `app/mi-pase/page.tsx`, `app/terminos/page.tsx`, `app/como-funciona/page.tsx`, `app/preguntas-frecuentes/page.tsx`, `app/page.tsx` (FAQ preview).

**Home** (nuevas secciones): `app/page.tsx` + 3 componentes nuevos (`WhatIsSunnySection`, `CommunitySection`, `PartnerSpacesSection` o nombres equivalentes).

---

## 16. Dependencias y variables necesarias

**Ya presentes y suficientes para lo que existe hoy**: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL` (ver `lib/env.ts`).

**Para probar de verdad lo que nunca se ha probado**: acceso de red real desde el entorno de desarrollo al proyecto de Supabase (o ejecutar contra un entorno con esa conectividad), una bandeja de correo real para completar magic link, y — si se quiere que la prueba de integración de reservaciones corra — `TEST_SUPABASE_URL` + `TEST_SUPABASE_SERVICE_ROLE_KEY` (+ opcionalmente `TEST_SUPABASE_ANON_KEY`) apuntando a un **proyecto de Supabase desechable**, nunca a producción (la prueba crea y borra usuarios/filas reales).

**Nuevas dependencias de código**: ninguna previsible — acompañantes y `party_size` son campos de formulario y columnas SQL, no requieren librerías nuevas.

**No hay variables nuevas de entorno previstas** para la migración de grupos/acompañantes en sí.

---

## 17. Backlog dividido en P0, P1 y P2

**P0 — bloquea el cierre de MVP 1.1 tal como está definido:**
- Migración de esquema: `experiences.max_party_size`, `reservations.party_size`, tabla/columna de acompañantes.
- Reescritura de `claim_reservation()` y `reserved_counts_for_experiences()` para contar personas, no filas (previene sobreventa — ver §13).
- `ClaimPanel` capturando cantidad de lugares + nombres de acompañantes.
- "Mi pase" y el correo de confirmación mostrando titular + acompañantes.
- Panel de Emmy: campo `max_party_size` al crear/editar experiencia, vista de titulares y acompañantes por reservación.
- Corregir la copy "no admite acompañantes" en los 5-6 archivos identificados en §5/§15.
- Ejecutar por primera vez la prueba de integración de reservaciones contra un proyecto de prueba real, y correr al menos un ciclo completo de magic link real.
- Subir los 10 assets reales (foto/video) — sin esto el sitio no puede lanzarse públicamente.

**P1 — importante para la nueva definición de producto, no bloquea la mecánica de reservación:**
- Secciones de Home: "Qué es Sunny Project", "Comunidad", "Espacios aliados" (esta última solo cuando existan aliados reales).
- Acciones de admin: duplicar, ocultar, archivar experiencia.
- Vista de "Usuarios" en el panel de Emmy.
- Compartir/invitar una experiencia (mecanismo mínimo, no matching ni feed).
- Etiquetas sociales, bandera "Sunny Originals".
- Reequilibrar el énfasis narrativo para que el pase semanal no se sienta como "todo el producto" (ajuste de copy/jerarquía en Home y `/como-funciona`).
- Prueba real en al menos un dispositivo móvil físico o emulador táctil.

**P2 — explícitamente después:**
- Comunicación semanal recurrente.
- Encuesta posterior a la experiencia.
- Todo lo listado como "Fuera del MVP" (chat, feed, matching, perfiles públicos, puntos, streaks, leaderboard, pagos, suscripciones, confirmación individual compleja de invitados, app móvil, dashboard para negocios) permanece fuera — no se toca en esta fase.

---

## 18. Orden recomendado de implementación

1. Decidir las preguntas abiertas de §19 (especialmente el modelo de datos de acompañantes y si el nombre es obligatorio al reservar o puede completarse después) — todo lo demás depende de esto.
2. Migración de esquema + reescritura de las funciones SQL de reservación (con la prueba de integración corriendo contra un proyecto de prueba real como criterio de aceptación de este paso).
3. `ClaimPanel` + validaciones + API route.
4. Panel de Emmy: `max_party_size` en el formulario de experiencia, vista de titulares/acompañantes.
5. "Mi pase", historial, correo de confirmación mostrando el grupo.
6. Corrección de copy contradictoria (§5).
7. Ciclo completo de prueba manual: magic link real → completar perfil → reservar con acompañantes → ver Mi pase → cancelar → verificar que el cupo se liberó correctamente para el tamaño de grupo completo.
8. Subir assets reales.
9. Secciones nuevas de Home (Qué es Sunny, Comunidad, Espacios aliados) y acciones de admin adicionales (duplicar/ocultar/archivar, vista de usuarios) — en paralelo al resto, son las de menor riesgo técnico.
10. Prueba en móvil real.

---

## 19. Decisiones que todavía requieren aprobación humana

- **Modelo de datos de acompañantes**: ¿tabla relacional `reservation_companions` o columna `companion_names text[]`? (Recomendación en §12: tabla.)
- **¿El nombre de cada acompañante es obligatorio en el momento de reservar, o el titular puede reservar para el grupo y completar nombres después** (por ejemplo desde "Mi pase")? Afecta directamente la fricción del flujo de reclamo (§14).
- **¿Puede un titular reservar `party_size = 1` en una experiencia con `max_party_size = 3`** (es decir, ir solo a algo que admite grupo)? Parece que sí debería poder, pero es una confirmación de producto, no una suposición técnica.
- **¿Qué pasa si se cancela la reservación de un grupo?** ¿Se cancela para todos (titular + acompañantes) siempre, o existe algún escenario de cancelación parcial? El alcance dice "el titular responde por su grupo", lo que sugiere todo-o-nada, pero vale la pena confirmarlo explícitamente antes de escribir la función SQL.
- **¿Los acompañantes cuentan para el límite de "un pase por semana"?** Es decir, si Ana lleva a Luis como acompañante, ¿Luis (si también tiene cuenta) puede seguir reclamando su propio pase esa semana como titular en otra experiencia? El alcance dice que los acompañantes no necesitan cuenta, lo cual sugiere que esto ni siquiera aplica — pero debe confirmarse que no hay una forma de que la misma persona aparezca como titular y como acompañante en la misma semana de forma que rompa la regla de un pase semanal.
- **Contenido real de "Qué es Sunny Project" y "Comunidad"**: copy, tono, y si llevan fotografía real (dependen de los mismos assets pendientes en §11).
- **Umbral de "aliados reales" para "Espacios aliados"**: ¿un negocio activo en la tabla `businesses` ya cuenta como "aliado real", o se necesita una bandera adicional (ej. `businesses.featured_as_partner`) para decidir cuáles se muestran públicamente?
- **Alcance exacto de "duplicar" una experiencia**: ¿duplica también las fechas (y hay que ajustarlas manualmente), o solo el contenido (título, descripción, requisitos, imagen) dejando fechas en blanco?
- **Encuesta posterior**: ¿P1 o P2? El brief lo deja abierto explícitamente — se necesita una decisión antes de dimensionar el trabajo.
- **Acceso de red para pruebas reales**: quién ejecuta el ciclo de prueba end-to-end con correo real y un proyecto de Supabase alcanzable — este entorno de desarrollo no puede hacerlo por sí mismo.

---

## 20. Pruebas de aceptación necesarias

Antes de dar por cerrado el MVP 1.1, lo siguiente debe probarse con datos reales, no solo revisarse en código:

1. Magic link real de principio a fin: recibir el correo, abrirlo, sesión establecida, header refleja la sesión.
2. Completar perfil (nombre, confirmación de mayoría de edad, términos) y que el flujo de reclamo avance automáticamente.
3. Reservar una experiencia con `party_size = 1` (caso base, debe seguir funcionando exactamente igual que hoy).
4. Reservar una experiencia con `party_size = 2` y `party_size = 3`, con nombres de acompañantes, y confirmar que el cupo restante mostrado al público baja en la cantidad correcta de personas, no de reservaciones.
5. Intentar reservar más lugares de los que `max_party_size` permite y confirmar que se rechaza con un mensaje claro.
6. Dos reclamos concurrentes por el último lugar disponible (incluyendo un caso donde uno es un grupo) — confirmar que no hay sobreventa.
7. Cancelar una reservación grupal dentro de la ventana de 12 horas y confirmar que el cupo completo del grupo se libera.
8. Intentar cancelar fuera de la ventana de 12 horas y confirmar que se rechaza.
9. "Mi pase" y el correo de confirmación muestran correctamente titular + todos los acompañantes.
10. Panel de Emmy: crear, editar, duplicar, ocultar, archivar y cancelar una experiencia; ver la lista de titulares y acompañantes de una reservación; marcar asistencia y no-show; exportar CSV y confirmar que incluye el tamaño de grupo.
11. Solicitud de negocio real (`/para-negocios` → modal → envío) visible en `/admin/solicitudes` y con el correo de notificación a `ADMIN_EMAIL` entregado.
12. Recorrido completo en un dispositivo móvil real: hero con video, Quick View como bottom sheet, formulario de reclamo con acompañantes, menú fullscreen.
13. Confirmar que ninguna página sigue mostrando la copy "no admite acompañantes" después de la migración.
14. Confirmar visualmente (no solo por código) que las secciones nuevas de Home ("Qué es Sunny Project", "Comunidad", "Espacios aliados") aparecen en el orden pedido y que "Espacios aliados" no aparece si no hay aliados reales configurados.
