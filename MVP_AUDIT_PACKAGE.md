# Paquete de auditoría — The Sunny Project, MVP Lean

**Fecha:** 17–18 de agosto de 2026
**Rama:** `mvp-lean`
**Commit auditado:** `8b58d6e`
**URL:** https://sunny-mvp.vercel.app

Fotografía del estado actual. **No se modificó producto, diseño ni funcionalidad
en esta pasada.** Los únicos archivos añadidos son los de esta auditoría.

Documentos que acompañan:
- `qa/VISUAL_AUDIT.md` — diagnóstico visual sección por sección + MOTION ISSUES
- `qa/RESPONSIVE_AUDIT.md` — ocho anchos, medidos
- `qa/screenshots/` — 27 capturas de página completa

---

# ESTADO ACTUAL

El MVP está **publicado y funcionando**. Carga, se ve, navega, y el circuito
Sanity → web está verificado de punta a punta con datos reales.

Lo que **no** está listo es el contenido y el vocabulario:

- Las tres experiencias del CMS son de prueba, se llaman «TEST — …» y **ninguna
  tiene fotografía**. La sección central de la portada muestra dos rectángulos
  grises que dicen «Sin fotografía».
- **Cuatro páginas publicadas y enlazadas desde el header y el pie** (`/como-funciona`,
  `/preguntas-frecuentes`, `/privacidad`, `/terminos`) describen un producto que no
  existe: cuentas de usuario, pase semanal, folios, reservaciones y cancelación con
  12 horas de antelación.
- La sección de contacto de la portada **está vacía**: dice «¿Nos escribes?» y no
  muestra ningún medio de contacto.
- El pie publica **datos de contacto que no son reales** (`@sunnyproject.mx`,
  `hola@sunnyproject.mx`).
- **El formulario no puede recibir solicitudes**: Google Sheets no está configurado,
  así que responde error. Correctamente —nunca finge éxito— pero no registra nada.
- Las fotografías del sitio **no están autorizadas para producción** (documentado
  desde antes en `SUNNY_ASSET_MANIFEST.md`).

En una frase: **la maquinaria está sana, la vitrina no está lista.**

---

# DEPLOYMENT

| Dato | Valor |
|---|---|
| Proyecto de Vercel | **`sunny-mvp`** (`prj_sQhOBSKdt4vm5Z9E1r7wv9rr3pRe`) |
| Equipo | The Best (`team_QlNHL2TfckldloUp9ALzKQqN`), plan Hobby |
| Rama desplegada | **`mvp-lean`** |
| Commit desplegado | **`8b58d6e117981b00814953ac14653adb8c1b8227`** |
| Mensaje del commit | «Quitar del layout raíz la dependencia de Supabase» |
| Entorno | **Production** (`target: production`) |
| Estado | READY |
| Fecha del despliegue | 17 ago 2026, 18:58 (Monterrey) / 18 ago 00:58 UTC |
| Framework | Next.js 16, bundler Turbopack, Node 24.x |
| URL pública | **https://sunny-mvp.vercel.app** |
| Alias de rama | `sunny-mvp-git-mvp-lean-the-best8.vercel.app` (requiere sesión de Vercel) |

**No es el proyecto de la versión avanzada.** Ese es `sunny-project`
(`prj_bslqMtN7a9IS6ECpPviC99oUfZCt`), sirve `sunny-project-teal.vercel.app` y sigue
intacto.

## Variables de entorno — solo nombres

Configuradas en `sunny-mvp`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID
NEXT_PUBLIC_SANITY_DATASET
NEXT_PUBLIC_SANITY_API_VERSION
NEXT_PUBLIC_SITE_URL
```

| Grupo | ¿Sigue habiendo variables? | Evidencia |
|---|---|---|
| **Supabase** | **NO** | Ninguna. Se eliminaron las diez que Vercel precargó del `.env.example` de la rama principal |
| **Sanity** | **SÍ** — las tres | El sitio muestra contenido real del dataset de producción |
| **Google Sheets** | **NO** — faltan las tres | `POST /api/solicitudes` responde 502 con `SheetsNotConfiguredError` |

Las tres de Sanity llevan prefijo `NEXT_PUBLIC_` y no son secretas: viajan en cada
petición que el navegador hace a Sanity. Las tres de Google que faltan
(`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) sí son
secretas y nunca deben llevar ese prefijo.

**Ninguna clave, token ni valor secreto aparece en este documento ni en ningún
archivo de `qa/`.**

## Nota sobre por qué costó llegar aquí

El proyecto anterior (`sunny-project`) tiene enganchada una **integración de
Supabase** que Vercel conecta *antes* de compilar. Con esa base de datos pausada
—los proyectos gratuitos de Supabase se duermen a los siete días sin uso— cualquier
despliegue muere en un segundo con `Provisioning integrations failed`, sin registro
de build. Tres intentos fallaron por eso antes de identificarlo. El proyecto nuevo
no lleva esa integración y por eso construye sin problema.

---

# RUTAS

| Ruta | Estado HTTP | Función | Veredicto |
|---|---|---|---|
| `/` | 200 | Portada: hero, experiencias, qué es Sunny, cómo funciona, comunidad, negocios, FAQ, contacto | **ACTIVA Y CORRECTA** |
| `/experiencias` | 200 | Catálogo completo, ordenado por fecha | **ACTIVA PERO NECESITA REVISIÓN** — violación de accesibilidad `heading-order`; sin filtros |
| `/experiencias/[slug]` | 200 | Detalle + formulario de solicitud | **ACTIVA Y CORRECTA** |
| `/para-negocios` | 200 | Formulario para espacios que quieren participar | **ACTIVA Y CORRECTA** |
| `/como-funciona` | 200 | Explica el «pase semanal», folios y reservaciones | **HEREDADA — DEBERÍA REESCRIBIRSE U OCULTARSE.** Enlazada desde el header |
| `/preguntas-frecuentes` | 200 | FAQ del modelo con cuentas y pase | **HEREDADA — DEBERÍA REESCRIBIRSE U OCULTARSE.** Enlazada desde el pie |
| `/privacidad` | 200 | Aviso de privacidad que habla de cuentas y perfiles | **HEREDADA — DEBERÍA REESCRIBIRSE.** Es un documento legal describiendo un tratamiento de datos que ya no ocurre |
| `/terminos` | 200 | Términos con reglas de pase, cancelación y acompañantes | **HEREDADA — DEBERÍA REESCRIBIRSE.** Mismo problema |
| `/acceso` | 307 → `/` | Login por enlace mágico | **OCULTA CORRECTAMENTE** |
| `/mi-pase` | 307 → `/` | Pase semanal del usuario | **OCULTA CORRECTAMENTE** |
| `/mi-cuenta` | 307 → `/` | Perfil | **OCULTA CORRECTAMENTE** |
| `/historial` | 307 → `/` | Historial de reservaciones | **OCULTA CORRECTAMENTE** |
| `/admin`, `/admin/*` | 307 → `/` | Panel de Emmy (11 pantallas) | **OCULTA CORRECTAMENTE** |
| `/auth/*` | 307 → `/` | Callback de autenticación | **OCULTA CORRECTAMENTE** |
| `/api/solicitudes` | POST | Recibe solicitudes de lugar → Google Sheets | **ACTIVA, DEVUELVE ERROR** hasta configurar Sheets |
| `/api/negocios-lean` | POST | Recibe solicitudes de negocios → Google Sheets | **ACTIVA, DEVUELVE ERROR** hasta configurar Sheets |
| `/api/partner-leads`, `/api/reservations/*`, `/api/admin/*` | POST/GET | Endpoints de la versión avanzada | **HEREDADOS** — siguen desplegados y no están cubiertos por las redirecciones, que solo aplican a páginas |

Las redirecciones se definen en `next.config.ts` (`RUTAS_FUERA_DEL_MVP`) y son
`307` (temporales), no `301`. Correcto: la versión avanzada volverá.

---

# PROBLEMAS CRÍTICOS

### C1 · Cuatro páginas públicas describen un producto que no existe

`/como-funciona` está **en el header**. `/preguntas-frecuentes`, `/privacidad` y
`/terminos` están **en el pie**. Las cuatro hablan de pase semanal, folios,
reservaciones, cuentas de usuario y cancelación con 12 horas de antelación.

Alguien que llegue al sitio, lea «solicita tu lugar y te confirmamos por WhatsApp»
en la portada y luego entre a «Cómo funciona» va a leer que necesita presentar un
folio y que solo puede reservar una vez por semana. **Son dos productos distintos
en el mismo sitio.**

Agravante: `/privacidad` y `/terminos` son documentos legales. Describen un
tratamiento de datos personales (cuentas, perfiles, compartir folios con negocios)
que **ya no ocurre**, y no describen el que sí ocurre (una hoja de cálculo con
nombres, teléfonos y correos).

### C2 · El formulario no puede recibir ninguna solicitud

Google Sheets no está configurado. `POST /api/solicitudes` responde **502**.
Verificado en la URL publicada con un envío real.

El comportamiento del código es correcto —nunca muestra éxito falso, y los datos
del formulario se conservan para reintentar— pero el resultado operativo es que
**el sitio no puede convertir todavía**.

### C3 · Datos de contacto falsos publicados

El pie muestra `@sunnyproject.mx` y `hola@sunnyproject.mx`, escritos directamente
en `components/site/Footer.tsx`. No corresponden a cuentas reales.

### C4 · Las fotografías no están autorizadas

`SUNNY_ASSET_MANIFEST.md` ya lo documenta: son imágenes de referencia descargadas
de contenido publicado por otras marcas, varias ni siquiera de Monterrey. El propio
manifiesto marca el uso en producción como **bloqueado**.

Ahora mismo están publicadas en una URL pública e indexable.

### C5 · Contenido de prueba visible al público

Las tres experiencias se llaman «TEST — …», el lugar es «TEST — Ubicacion de
prueba» (sin acento) y las descripciones dicen literalmente **«Borrar antes de
abrir al publico»**.

---

# PROBLEMAS VISUALES

Detalle completo en `qa/VISUAL_AUDIT.md`. Resumen:

| # | Problema | Dónde |
|---|---|---|
| V1 | **Tarjetas sin fotografía** — placeholder gris «Sin fotografía» ocupando media tarjeta, en la sección que es el argumento central | Portada, `/experiencias` |
| V2 | **Sección de contacto vacía** — «¿Nos escribes?» sin ningún medio de contacto, porque los campos están vacíos en Sanity y no hay valor de reserva | Portada |
| V3 | **Fotos de Comunidad desbordadas** por el borde derecho a 1440 px | Portada |
| V4 | **Rejilla con hueco** — tres columnas fijas con dos experiencias | Portada, `/experiencias` |
| V5 | **Ritmo plano** — nueve secciones entre marfil y blanco cálido, sin ninguna sección oscura entre el hero y el pie | Portada |
| V6 | **«Cómo funciona» sin textura** — tres cajas blancas idénticas, sin imagen ni icono | Portada |
| V7 | **Doble camino al mismo destino** — el botón del header y el primer enlace de la navegación llevan ambos a `/experiencias` | Todo el sitio |
| V8 | **Sin salida en «Agotada»** — la página termina sin ofrecer alternativa | Detalle agotado |

---

# PROBLEMAS FUNCIONALES

| # | Problema | Severidad |
|---|---|---|
| F1 | Google Sheets sin configurar: no se registra ninguna solicitud | **Crítica** |
| F2 | Error de hidratación de React (#418) en la portada, reproducible en carga limpia | Media |
| F3 | `heading-order` en `/experiencias`: salto en la jerarquía de encabezados | Media (accesibilidad) |
| F4 | Los endpoints de API de la versión avanzada siguen desplegados y accesibles; las redirecciones solo cubren páginas | Media |
| F5 | Nadie recibe aviso cuando entra una solicitud — decisión consciente de esta etapa, pero Emmy tiene que abrir la hoja para enterarse | Baja (por diseño) |

---

# RESPONSIVE

Detalle en `qa/RESPONSIVE_AUDIT.md`. Ocho anchos medidos: 320, 375, 390, 430, 768,
1024, 1280, 1440.

- **Cero desbordes horizontales en siete de los ocho.**
- **Cero imágenes rotas en todos.**
- **Excepción: 768 px** — el documento mide 809 px contra una ventana de 768.
  Reproducible, **sin culpable identificado**: ningún elemento del `<body>` cruza
  el borde. 768 es el ancho de un iPad en vertical.
- El espacio vertical no se adapta: `py-20` fijo hace que la portada pase de 6,4
  pantallas en escritorio a **8,9 en un teléfono de 320 px** con el mismo contenido.
- El header mantiene el menú de hamburguesa hasta 1024 px, desaprovechando el rango
  768–1023.

---

# MOTION

Cinco hallazgos en `qa/VISUAL_AUDIT.md`. El importante:

**MOTION-01 · CRÍTICO — el contenido nace invisible.** El HTML del servidor trae
`opacity:0` en línea sobre los envoltorios de revelado. Todo lo que está por debajo
del hero solo se vuelve visible cuando el JavaScript hidrata. Si el JavaScript
tarda, falla o se bloquea, el visitante ve los fondos de las secciones y nada más.

No es una hipótesis: ocurrió durante esta auditoría al capturar el sitio a través
de un reenvío de red que perdió algunos archivos, y el resultado fue exactamente
esa página fantasma.

El contenido **sí está en el HTML**, así que los buscadores lo leen. El riesgo es
para personas con conexiones malas, no para el SEO.

---

# SANITY

## SANITY STATUS

| Dato | Valor |
|---|---|
| Project ID | **`gp6ztiei`** |
| Dataset | **`production`** |
| Versión de API | `2026-08-01` |
| Perspectiva del sitio | `published` — los borradores no se publican |
| Revalidación | 60 segundos |
| **Studio desplegado** | **NO.** La API de Sanity no reporta ninguna aplicación de Studio para este proyecto |
| Studio previsto | `the-sunny-project.sanity.studio` (configurado en `sanity.cli.ts`, sin desplegar) |
| Cómo se edita hoy | Solo con `pnpm studio` en una máquina local, o por API |

**Esquemas:** dos — `experience` y `siteSettings`.

**Campos de `experience`** (agrupados en tres pestañas):

| Grupo | Campo | Etiqueta en el Studio |
|---|---|---|
| Lo principal | `title` | Nombre de la experiencia |
| Lo principal | `slug` | Dirección en el sitio |
| Lo principal | `mainImage` + `alt` | Fotografía + Descripción de la imagen |
| Lo principal | `shortDescription` | Descripción corta |
| Lo principal | `status` | Disponibilidad (Disponible / Agotada) |
| Lo principal | `featured` | Destacar en la portada |
| Cuándo y dónde | `startDateTime` | Cuándo empieza |
| Cuándo y dónde | `endDateTime` | Cuándo termina |
| Cuándo y dónde | `locationName` | Nombre del lugar |
| Cuándo y dónde | `address` | Dirección |
| Detalles | `hostName` | Quién la imparte |
| Detalles | `fullDescription` | Descripción completa |
| Detalles | `requirements` | Qué necesita llevar |

**Campos de `siteSettings`:** `heroTitle`, `heroSubtitle`, `aboutShortText`,
`instagramUrl`, `whatsapp`, `contactEmail`, `faq[]` (pregunta + respuesta).

## Contenido real

| Métrica | Valor |
|---|---|
| Experiencias totales | **3** |
| Publicadas | 3 |
| Borradores pendientes | 0 |
| Que empiezan con «TEST —» | **3 de 3** |
| **Con fotografía** | **0 de 3** |
| Vigentes (visibles en el sitio) | 2 |
| Caducadas (ocultas, aún en el CMS) | 1 |
| Documento de ajustes | 1 |

`siteSettings` está **parcialmente lleno**: tiene `heroTitle`, `heroSubtitle`,
`aboutShortText` y 5 preguntas frecuentes. Tiene **vacíos** `instagramUrl`,
`whatsapp` y `contactEmail` — y esa es la causa exacta de que la sección de
contacto de la portada aparezca sin contenido.

## Capturas del Studio

**No se pudieron tomar.** El Studio no está desplegado (la API de Sanity no
reporta ninguna aplicación para este proyecto) y el navegador de este contenedor no
tiene salida a internet, así que tampoco se puede abrir `sanity.io/manage`. Los
archivos `qa/screenshots/sanity-*.png` no existen por ese motivo.

Lo que sí se pudo verificar por API queda arriba: esquemas, campos, etiquetas y
conteos reales.

## Campos que Emmy puede no entender

Evaluado sobre las etiquetas en español que ya tiene el esquema:

| Campo | Problema | Gravedad |
|---|---|---|
| **`slug` — «Dirección en el sitio»** | Es el concepto más técnico del formulario. Emmy tiene que entender que cambiarlo rompe los enlaces que ya haya compartido por WhatsApp | **Alta** |
| **`alt` — «Descripción de la imagen»** | No es evidente para qué sirve. Es obligatorio, así que si no lo entiende, no puede publicar | **Alta** |
| **`endDateTime` — «Cuándo termina»** | Aquí se decide **cuándo desaparece la experiencia del sitio**, y el campo no lo dice. Si pone la hora de inicio en los dos campos, la experiencia se esfuma en cuanto empieza | **Alta** |
| **`featured` — «Destacar en la portada»** | En el MVP **no hace nada**: la portada muestra las 6 más próximas, sin dar prioridad a las destacadas. Un interruptor que no tiene efecto | **Media** |
| **`shortDescription` vs `fullDescription`** | Nada dice dónde aparece cada una ni cuánto debe medir | **Media** |
| **`status` — «Disponibilidad»** | Claro. Pero no dice que marcar «Agotada» **oculta el formulario** | **Media** |
| **`requirements` — «Qué necesita llevar»** | Claro | Baja |

## SANITY → WEB: **OK**

Verificado en la URL publicada, con datos reales, en este orden:

| Prueba | Resultado |
|---|---|
| Crear experiencia y publicar → aparece en la web | **OK** — las 3 experiencias del dataset se muestran |
| Editar sin publicar (borrador) → **no** debe aparecer | **OK** — el sitio siguió mostrando el texto anterior |
| Publicar el cambio → aparece en la web | **OK** — visible a los **126 segundos** (60 s de revalidación + caché de CDN) |
| Marcar «Agotada» → la web cambia | **OK** — insignia «Agotada» visible y **formulario oculto** |
| Fecha pasada → desaparece del listado | **OK** — 1 de 3 experiencias está caducada y no aparece |
| …y sigue existiendo en Sanity | **OK** — sigue en el CMS, reutilizable cambiándole la fecha |

El texto de prueba usado para verificar la propagación **se restauró a su valor
original** al terminar. No se borró ni se modificó ningún contenido real.

---

# GOOGLE SHEETS

**Estado: NO CONFIGURADO.**

| Dato | Valor |
|---|---|
| ¿Configurado? | **No** |
| Spreadsheet ID | No existe |
| Nombre del archivo | No existe |
| Pestañas | No existen |
| ¿La aplicación puede escribir? | **No** |
| ¿Variables en Vercel? | **No** — las tres faltan |

## Lo que el código espera encontrar

Dos pestañas con estos nombres exactos (`lib/sheets.ts`, `SHEET_TABS`):

**Pestaña `Solicitudes`** — 10 columnas, en este orden:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Fecha y hora | ID experiencia | Nombre experiencia | Nombre | WhatsApp | Correo | Personas | Comentarios | Estado | Notas |

**Pestaña `Negocios`** — 11 columnas:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Fecha y hora | Negocio | Contacto | WhatsApp | Correo | Instagram | Zona | Tipo | Mensaje | Estado | Notas |

Toda fila entra con estado **`Nueva`**. La columna «Notas» queda vacía para que
Emmy escriba.

**El orden es un contrato.** Google Sheets escribe por posición, no por nombre: si
alguien reordena los campos del código sin cambiar la hoja, nada falla —el sitio
sigue respondiendo «ok»— y los teléfonos empiezan a caer en la columna del correo.
Hay una prueba automática (`tests/unit/sheets-columns.test.ts`, 7 casos) que fija
ese orden precisamente por eso.

## Qué falta exactamente

1. Crear la hoja de cálculo con las dos pestañas y esos encabezados.
2. Crear una cuenta de servicio en Google Cloud y habilitar la API de Sheets.
3. Compartir la hoja con el correo de la cuenta de servicio, como **editor**.
4. Cargar en Vercel: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`,
   `GOOGLE_SHEET_ID`. Las tres **sin** prefijo `NEXT_PUBLIC_`.
5. Redesplegar.

Paso a paso en `MVP_SETUP.md`.

---

# SUPABASE

## SUPABASE REQUIRED FOR MVP: **NO**

Verificado archivo por archivo:

| Punto revisado | Resultado |
|---|---|
| Layout raíz (`app/layout.tsx`) | **Limpio.** Tenía una condición que sustituía el sitio entero por una pantalla de «Falta configurar Supabase»; se eliminó en el commit `8b58d6e` |
| Providers | Ninguno toca Supabase |
| Middleware / proxy | `proxy.ts` **eliminado** en esta rama. `lib/supabase/middleware.ts` sigue en el repositorio pero **nada lo importa** |
| Validación de entorno | `lib/env.ts` sigue exportando `isSupabaseConfigured()`, pero **ninguna ruta viva la llama** |
| Páginas públicas (`/`, `/experiencias`, detalle, `/para-negocios`) | **Cero importaciones de Supabase** |
| API del MVP (`/api/solicitudes`, `/api/negocios-lean`) | **Cero importaciones de Supabase** |
| Header, Footer, AppChrome, SessionWelcomeToast | Solo mencionan Supabase en comentarios |

**Comprobado en ejecución, no solo leyendo:** se retiró el `.env.local` del
proyecto (`env | grep SUPABASE` en cero) y con ello lint, tipos, **155 pruebas** y
build de producción pasaron, y las cuatro rutas públicas respondieron 200 sin
rastro de la pantalla de configuración.

Existe una prueba que lo mantiene así: `tests/unit/no-supabase-in-public.test.ts`
falla si alguna ruta pública vuelve a importar Supabase o si el layout raíz vuelve
a condicionar el sitio a una configuración.

**Archivos históricos que permanecen** (no participan en el runtime del MVP):
`lib/supabase/*`, `supabase/migrations/*`, `supabase/demo_seed.sql`, y las páginas
de `/admin`, `/mi-pase`, `/acceso`, `/historial`, `/mi-cuenta` — todas redirigidas.

**Nota operativa:** el proyecto de Supabase está **pausado** (los gratuitos se
duermen a los siete días). No afecta al MVP. Sí impide que la versión avanzada
pueda volver a desplegarse hasta que se reactive.

---

# RESTOS DE LA PLATAFORMA AVANZADA

| Archivo | Texto / función encontrada | Visible al público | Debe corregirse |
|---|---|---|---|
| `app/como-funciona/page.tsx` | «pase semanal gratuito», «presenta tu nombre y folio al llegar», «solo puedes tener una reservación activa a la vez por semana», «Reglas del pase semanal» | **SÍ** — enlazada desde el **header** | **SÍ, P0** |
| `app/preguntas-frecuentes/page.tsx` | «¿Cómo funciona el pase semanal?», «una reservación activa por semana», «cancelar desde "Mi pase" hasta 12 horas antes», «folio de reservación», «membresías» | **SÍ** — enlazada desde el pie | **SÍ, P0** |
| `app/terminos/page.tsx` | «El pase semanal», «Reservaciones y cancelaciones», «hasta tres lugares por reservación», «recuperarás tu pase semanal automáticamente» | **SÍ** — enlazada desde el pie | **SÍ, P0** (documento legal) |
| `app/privacidad/page.tsx` | «cuando creas una cuenta y completas tu perfil», «gestionar tu pase semanal, confirmar reservaciones», «compartimos tu nombre y folio con el negocio», «eliminación de tu cuenta» | **SÍ** — enlazada desde el pie | **SÍ, P0** (documento legal, y **no** describe la hoja de cálculo, que es donde los datos van de verdad) |
| `components/site/Footer.tsx` | «Un pase gratuito por semana» | **SÍ** — en todas las páginas | **SÍ, P1** |
| `components/site/Header.tsx` | Enlace «Cómo funciona» → `/como-funciona` | **SÍ** | **SÍ, P0** |
| `components/home/WhatIsSunny.tsx` | Enlace «Cómo funciona el pase →»; «sin comprometerte con una membresía» | **SÍ** — portada | **SÍ, P1** |
| `lib/lean-content.ts` | Preguntas «¿Necesito crear una cuenta?» y «¿Solicitar un lugar es lo mismo que reservarlo?» | **SÍ** — portada | **Revisar, P2** — están bien respondidas, pero introducen los conceptos |
| `components/home/PassShowcase.tsx` | «Crea tu cuenta», «folio», «Ver mi pase», «Inicia sesión para activar tu pase semanal» | **NO** — ninguna ruta lo importa | No urgente |
| `components/home/HowItWorksNarrative.tsx` | «Presenta tu folio», «lugares por reservación» | **NO** | No urgente |
| `components/home/IntentSelector.tsx` | «lugares disponibles» | **NO** | No urgente |
| `components/home/StatsStrip.tsx` | — | **NO** | No urgente |
| `app/api/partner-leads`, `/api/reservations/*`, `/api/admin/*` | Endpoints de reservaciones y panel | **Accesibles** — las redirecciones solo cubren páginas | **Revisar, P1** |
| `lib/env.ts` | `isSupabaseConfigured()`, `isEmailConfigured()` | No | No urgente |
| `lib/supabase/middleware.ts` | Cliente de sesión | No — nada lo importa | No urgente |

---

# FORMS

## Formulario de solicitud de lugar — probado en la URL publicada

| Prueba | Resultado |
|---|---|
| Estado por defecto | **OK** — `qa/screenshots/request-form-default.png` |
| Validación en cliente y servidor | **OK** — correo inválido → 400; campos vacíos → 400 |
| Campo trampa anti-robots relleno | **OK** → 400 |
| Estado de carga | **OK** — el botón se bloquea desde el primer clic |
| Doble clic | **OK** — `sending` impide la segunda petición |
| Envío válido con Sheets sin configurar | **502**, mensaje de error correcto, **los datos escritos se conservan** — `qa/screenshots/request-form-error.png` |
| Mensaje de éxito | `qa/screenshots/request-form-success.png` |
| Límite de frecuencia | 5 envíos por minuto y por IP |

**Sobre la captura de éxito:** no se puede alcanzar en el sitio publicado, porque
sin Google Sheets el servidor siempre responde 502. Para capturarla se simuló
**únicamente la respuesta del servidor**; el componente que aparece en la imagen es
el del sitio publicado, con su texto real:

> **¡Recibimos tu solicitud!**
> The Sunny Project revisará la disponibilidad y se pondrá en contacto contigo para
> confirmar tu lugar.

**Lo que NO se pudo probar** y queda pendiente para cuando Sheets exista:
que aparezca **exactamente una fila**, y que las columnas ID experiencia, Nombre
experiencia, Nombre, WhatsApp, Correo, Personas, Comentarios y Estado = `Nueva`
caigan en su sitio. Hay una prueba unitaria que fija ese orden, pero **no sustituye
a verlo en la hoja real**.

## Formulario de negocios

Mismo estado: la ruta responde, valida, y devuelve **502** al intentar escribir.
**No se pudo verificar que llegue a la pestaña `Negocios`** porque la hoja no
existe.

---

# PERFORMANCE

**Lighthouse no se pudo ejecutar.** No está instalado en este entorno y necesita
que el navegador tenga salida a internet, cosa que este contenedor no permite. En
su lugar se midieron métricas reales del navegador sobre el sitio publicado.

Las latencias **no son representativas**: cada petición del navegador se reenvió a
través de `curl`, lo que añade tiempo artificial. Los pesos y conteos sí son
válidos.

| Ruta | FCP | Nodos DOM | Peso total | Peso JS | Recursos |
|---|---|---|---|---|---|
| Home (1440) | 1.560 ms | 283 | 1.331 KB | **735 KB** | — |
| `/experiencias` | 660 ms | 120 | 1.043 KB | 724 KB | — |
| Detalle | 672 ms | 176 | 1.052 KB | 754 KB | — |
| `/como-funciona` | 924 ms | 122 | 1.166 KB | 735 KB | — |
| `/para-negocios` | 968 ms | 120 | 1.032 KB | 735 KB | — |

**Lo que sí se puede concluir:** entre **720 y 755 KB de JavaScript** en todas las
rutas, incluidas las que son texto estático (`/como-funciona`, `/para-negocios`).
Para un sitio de ocho páginas cuyo contenido es texto, fotos y un formulario, es
mucho. Los sospechosos son la librería de animación y el scroll suave, que se
cargan en todas las rutas públicas.

Es también lo que hace grave a **MOTION-01**: 735 KB de JavaScript son la condición
para que el contenido se vuelva visible.

**Pendiente:** ejecutar Lighthouse desde una máquina con red, en las tres vistas
pedidas (Home escritorio, Home móvil, Detalle móvil).

---

# ACCESSIBILITY

Ejecutado **axe-core 4.12.1** sobre el sitio publicado, a 1440 px.

| Ruta | Violaciones |
|---|---|
| Home | **0** |
| `/experiencias` | **1** — `heading-order` (moderado): los niveles de encabezado saltan más de uno |
| Detalle de experiencia | **0** |
| `/como-funciona` | **0** |
| `/para-negocios` | **0** |

Un solo hallazgo en cinco páginas es un resultado bueno. Lo que axe **no** detecta y
conviene revisar a mano:

- **Contraste de texto sobre fotografía.** axe no evalúa texto sobre imágenes, y el
  hero tiene texto blanco sobre foto. En una revisión anterior de este proyecto ya
  apareció un fallo de contraste ahí que axe no vio.
- **Foco del teclado en el menú móvil** (MOTION-05): no se verificó que el foco
  entre al panel abierto y quede atrapado dentro.
- **Movimiento reducido:** el sitio respeta `prefers-reduced-motion` en CSS, pero
  conviene confirmar que las animaciones movidas por JavaScript también.

---

# ASSETS

Imágenes que el sitio publica hoy:

| Archivo | Dónde aparece | Origen | Autorizada | ¿Reemplazar? |
|---|---|---|---|---|
| `hero/hero-together-01.webp` | **Hero de la portada** | Imagen de referencia descargada de contenido publicado por otra marca | **NO** | **SÍ — P0** |
| `community/community-gathering-01.webp` | Sección Comunidad | Ídem | **NO** | **SÍ — P0** |
| `community/community-workshop-01.webp` | Sección Comunidad | Ídem | **NO** | **SÍ — P0** |
| `emmy/emmy-founder-01.webp` | Sección «Qué es Sunny» | **Único asset plausiblemente propio** del proyecto | Probable, **confirmar con Emmy** | Confirmar |
| `originals/original-run-and-coffee-01.webp` | — | Referencia | **NO** | No urgente (no se usa en rutas vivas) |
| `experiences/*.webp` (5 archivos) | — | Referencia | **NO** | No urgente (no se usan: las experiencias vienen de Sanity) |
| **Fotos de experiencias** | Tarjetas y detalle | **NO EXISTEN** — 0 de 3 experiencias tiene imagen | — | **SÍ — P0** |

`SUNNY_ASSET_MANIFEST.md` ya documentaba que estas imágenes son de mood board, que
varias no son de Monterrey (una muestra un local de **Bangkok**, otra un club de
running de **Madrid**), y marcaba el uso en producción como **bloqueado**.

Ese bloqueo sigue vigente y **el sitio ya está publicado en una URL pública**.

---

# RUNTIME ERRORS

| Ruta | Error | Severidad | Causa probable |
|---|---|---|---|
| `/` | `Minified React error #418` — desajuste de hidratación | **Media** | `HeaderInteractive` lee el scroll con `useSyncExternalStore`; el valor del servidor no coincide con el del cliente. React descarta y rehace ese árbol |
| `/` (a través del reenvío de red) | `ChunkLoadError: Failed to load chunk` | **Artefacto del entorno de auditoría** | El reenvío por `curl` perdió archivos. Los chunks se sirven con **200** en HTTP directo. **No es un fallo del sitio** — pero ver MOTION-01 |
| Todas | Sin errores 4xx/5xx | — | — |
| Todas | Sin imágenes fallidas (0 de 4 rotas en los ocho anchos) | — | — |
| Sanity | Sin errores de consulta en producción | — | El sitio muestra datos reales |
| `/api/solicitudes` | **502** en cada envío | **Crítica** (C2) | Google Sheets sin configurar |

---

# ARCHIVOS CLAVE

| Área | Archivo |
|---|---|
| **Home** | `app/page.tsx` |
| **Header** | `components/site/Header.tsx` (enlaces) · `components/site/HeaderInteractive.tsx` (comportamiento al hacer scroll) · `components/motion/FullscreenMenu.tsx` (menú móvil) |
| **Hero** | `components/lean/LeanHero.tsx` |
| **Experience card** | `components/lean/ExperienceCard.tsx` |
| **Experience grid** | `components/lean/ExperienceGrid.tsx` (incluye el estado vacío) |
| **Experience detail** | `app/experiencias/[slug]/page.tsx` |
| **Catálogo** | `app/experiencias/page.tsx` |
| **How it works** | `components/lean/HowItWorks.tsx` (el del MVP) · `app/como-funciona/page.tsx` (la página heredada) |
| **Community** | `components/home/CommunitySection.tsx` |
| **Qué es Sunny** | `components/home/WhatIsSunny.tsx` |
| **Business** | `app/para-negocios/page.tsx` · `components/lean/BusinessForm.tsx` |
| **Form (solicitud)** | `components/lean/SpotRequestForm.tsx` · `app/api/solicitudes/route.ts` · `lib/mvp-validation.ts` |
| **Sanity** | `sanity/schemas/experience.ts` · `sanity/schemas/siteSettings.ts` · `sanity/structure.ts` · `sanity.config.ts` · `sanity.cli.ts` · `lib/sanity/client.ts` · `lib/sanity/queries.ts` · `lib/sanity/image.ts` |
| **Sheets** | `lib/sheets.ts` |
| **Textos por defecto** | `lib/lean-content.ts` |
| **Global CSS / tokens** | `app/globals.css` |
| **Motion** | `lib/motion.ts` (escala de duraciones y curva) · `components/motion/InViewReveal.tsx` · `WordReveal.tsx` · `LineReveal.tsx` · `HoverLift.tsx` · `AppChrome.tsx` · `SmoothScrollProvider.tsx` |
| **Layout raíz** | `app/layout.tsx` |
| **Rutas ocultas** | `next.config.ts` (`RUTAS_FUERA_DEL_MVP`) |
| **Assets** | `lib/media.ts` · `SUNNY_ASSET_MANIFEST.md` |

---

# TOP 15 CAMBIOS RECOMENDADOS

**No implementados en esta pasada.**

| # | Cambio | Prioridad |
|---|---|---|
| 1 | **Configurar Google Sheets.** Sin esto el sitio no puede recibir una sola solicitud. Es lo único que separa al MVP de ser funcional | **P0** |
| 2 | **Reescribir u ocultar `/como-funciona`, `/preguntas-frecuentes`, `/privacidad` y `/terminos`.** Cuatro páginas públicas describen un producto con cuentas, folios y reservaciones que no existe. Las dos últimas son documentos legales que describen un tratamiento de datos que ya no ocurre | **P0** |
| 3 | **Sustituir todas las fotografías por material propio o con licencia.** Las actuales son de mood board, están bloqueadas para producción por el propio manifiesto del proyecto, y ya están publicadas | **P0** |
| 4 | **Cargar experiencias reales con fotografía en Sanity y borrar las «TEST —».** Hoy la sección central de la portada son dos rectángulos grises que dicen «Sin fotografía», y una descripción dice «Borrar antes de abrir al publico» | **P0** |
| 5 | **Llenar `whatsapp`, `instagramUrl` y `contactEmail` en Sanity**, o dar valores de reserva. Ahora la sección de contacto de la portada aparece vacía | **P0** |
| 6 | **Corregir los datos de contacto del pie.** `@sunnyproject.mx` y `hola@sunnyproject.mx` no son reales y están publicados | **P0** |
| 7 | **Desplegar el Sanity Studio** (`pnpm studio:deploy`). Hoy Emmy no tiene ninguna forma de editar el contenido sin una máquina de desarrollo | **P1** |
| 8 | **Quitar «pase» del vocabulario visible**: pie («Un pase gratuito por semana»), enlace de `WhatIsSunny` («Cómo funciona el pase») | **P1** |
| 9 | **Hacer que la rejilla se adapte al número de experiencias.** Con dos, la fila de tres columnas queda con un hueco que se lee como error | **P1** |
| 10 | **Resolver el desborde de 41 px a 768 px** — el ancho exacto de un iPad en vertical | **P1** |
| 11 | **Revisar la dependencia del JavaScript para mostrar contenido** (MOTION-01). Que el contenido nazca con `opacity:0` significa que una carga fallida deja la página en blanco | **P1** |
| 12 | **Dar salida a la experiencia agotada.** Hoy la página simplemente termina, sin ofrecer alternativa | **P1** |
| 13 | **Corregir el error de hidratación (#418)** en la portada y la violación `heading-order` en `/experiencias` | **P1** |
| 14 | **Devolver contraste al ritmo de la portada.** Nueve secciones entre marfil y blanco cálido, sin ninguna sección oscura entre el hero y el pie. Es lo que más se perdió al simplificar | **P2** |
| 15 | **Adaptar el espacio vertical por breakpoint.** `py-20` fijo hace que la portada mida 8,9 pantallas en un teléfono de 320 px y 6,4 en escritorio, con el mismo contenido | **P2** |

---

# COMPARACIÓN CON LA VERSIÓN AVANZADA

## Advertencia sobre esta comparación

La rama `claude/sunny-motion-choreography` **no se pudo capturar visualmente**: sus
despliegues en Vercel son de vista previa y exigen sesión de Vercel para abrirse, y
el navegador de este contenedor no tiene salida a internet.

Lo que sí se hizo:
- Capturar `sunny-project-teal.vercel.app`, que es público y sirve la versión
  avanzada — pero de la rama `claude/sunny-mvp-1-1-design-admin`, no la pedida
  (`advanced-home-desktop.png`, `advanced-home-mobile.png`). Además, su contenido
  depende de Supabase, que está pausado, así que aparece vacío.
- **Comparar el código de ambas ramas**, que sí es exacto.

## Lo medible

| | `mvp-lean` | `claude/sunny-motion-choreography` |
|---|---|---|
| Secciones en la portada | **7** | **12** |
| Alto de la portada (escritorio) | 5.775 px | 8.844 px |
| Componentes de sección distintos | 6 | **13** |
| Primitivas de movimiento usadas | InViewReveal, WordReveal, LineReveal, HoverLift | InViewReveal (y las demás dentro de cada sección) |
| Secciones oscuras entre hero y pie | **0** | **2** |
| Tratamiento de fotografía | Hero a sangre + 2 fotos de comunidad + retrato | Hero, marquesina de experiencias, categorías, originals, partners |

Secciones que la versión avanzada tiene y el MVP no: `ThisWeekSection`,
`ExperienceMarquee`, `CategoriesSection`, `OriginalsSection`, `PartnersSection`,
`PassShowcase`, `IntentSelector`, `HowItWorksNarrative`, `ForBusinessSection`.

## QUÉ CALIDAD VISUAL SE PERDIÓ AL SIMPLIFICAR

Ejemplos concretos, todos de composición y ritmo — ninguno implica reintroducir
usuarios, reservaciones ni funciones avanzadas:

1. **Los capítulos de color desaparecieron.** La versión avanzada alterna marfil,
   blanco cálido, **carbón** y durazno, con dos bloques oscuros a página completa
   que funcionan como respiraciones. El MVP tiene un solo cambio de fondo real (el
   durazno de negocios) y ninguna sección oscura entre el hero y el pie. Es la
   pérdida más visible.

2. **«Cómo funciona» pasó de narrativa a tres cajas.** La versión avanzada tenía
   cinco pasos numerados en grande (01…05) con jerarquía tipográfica y una sección
   oscura de apoyo. El MVP tiene tres rectángulos blancos idénticos, sin imagen ni
   icono, en 300 px de alto.

3. **La marquesina de experiencias se fue.** Era movimiento continuo con
   fotografía real, y daba sensación de catálogo vivo. Ahora una rejilla estática
   de dos tarjetas grises.

4. **Las categorías interactivas se fueron.** Chips seleccionables («Movimiento»,
   «Recovery», «Food & Coffee», «Outdoor», «Comunidad») que daban al visitante algo
   que hacer en la portada además de bajar. No requieren cuentas ni reservaciones.

5. **La variedad de composición se aplanó.** En la avanzada las secciones alternan
   ancho completo, dos columnas, rejilla y carrusel. En el MVP casi todas son el
   mismo contenedor centrado con el mismo ancho máximo y la misma separación
   vertical: nueve bloques del mismo peso.

6. **El hero perdió elementos flotantes.** La versión avanzada superponía chips con
   datos reales sobre la fotografía. El MVP deja el tercio derecho del hero sin
   nada encima.

7. **Las tarjetas perdieron su fotografía.** No es un cambio de diseño sino de
   contenido, pero el efecto visual es el mayor de todos: la tarjeta está diseñada
   con la imagen ocupando la mitad superior, y sin ella queda un placeholder gris
   donde debería estar el gancho.

8. **La sección de negocios pasó de sección a cartel.** Antes tenía composición
   propia; ahora es un titular centrado, un párrafo y un botón.

**Lo que no se perdió y conviene proteger:** el hero a sangre completa, el sistema
tipográfico (sans para estructura, serif itálica para los remates), la paleta, el
sistema de movimiento con una sola curva, la página de detalle y el pie.
