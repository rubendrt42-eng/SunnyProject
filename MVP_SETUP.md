# The Sunny Project — MVP Lean

Guía de la versión ligera del sitio: cómo está armada, cómo la usa Emmy, y qué
falta por configurar.

Rama: **`mvp-lean`**. La versión avanzada —cuentas, reservaciones, folios, panel
propio— sigue intacta en las ramas `claude/*` y no se toca desde aquí.

---

# 1. Cómo está armado

Cuatro piezas, cada una con un trabajo:

| Pieza | Para qué |
|---|---|
| **Sanity** | El contenido público: experiencias y textos del sitio. Lo edita Emmy |
| **Google Sheets** | Las solicitudes de personas y de negocios. Datos personales |
| **Resend** | Los correos de aviso cuando entra una solicitud |
| **Vercel** | Donde vive el sitio |

## Por qué el contenido y las solicitudes van en sitios distintos

El dataset de Sanity es **público**: cualquiera con el id del proyecto puede
leer lo que hay dentro. Está bien para las experiencias, que son información
que queremos que se vea.

**Nunca se guarda una solicitud en Sanity.** Un nombre, un teléfono o un correo
ahí serían datos personales publicados. Por eso las solicitudes van a Google
Sheets, con credenciales privadas que solo el servidor conoce.

---

# 2. Cómo usa Emmy Sanity

## Entrar

La dirección del panel es **`https://the-sunny-project.sanity.studio`**
*(pendiente de desplegar — ver §7)*.

Se entra con la cuenta de Google o el correo que se haya invitado al proyecto.

Al abrir hay solo dos cosas:

- **Experiencias** — la lista de todo lo publicado
- **Textos del sitio** — el titular, la descripción, el contacto y las
  preguntas frecuentes

## Crear una experiencia

1. Entra a **Experiencias**.
2. Pulsa **Create** arriba.
3. Llena los campos. Los que llevan asterisco son obligatorios:
   - **Nombre** — cómo se va a llamar en el sitio
   - **Dirección en el sitio** — se genera sola al pulsar «Generate»
   - **Fotografía** — súbela y escribe qué se ve en ella
   - **Descripción corta** — una o dos líneas, es lo que se lee en la tarjeta
   - **Disponibilidad** — déjala en «Disponible»
   - **Cuándo empieza** y **Cuándo termina**
   - **Nombre del lugar**
   - **Descripción completa**
4. Pulsa **Publish** abajo a la derecha.

En menos de un minuto aparece en el sitio. No hay que avisar a nadie.

> Si el botón de publicar no deja, es porque falta un campo obligatorio. Sanity
> marca en rojo cuál es.

## Marcar una experiencia como agotada

1. Ábrela en **Experiencias**.
2. En **Disponibilidad**, cambia a **Agotada**.
3. **Publish**.

Qué pasa en el sitio: la experiencia **sigue visible**, con una etiqueta que
dice «Agotada», y el formulario para solicitar lugar se reemplaza por un aviso.
Nadie puede mandar más solicitudes.

## Qué pasa cuando la fecha ya pasó

**Nada que hacer.** Cuando llega la hora de fin, la experiencia desaparece sola
del sitio.

**No se borra.** Sigue en Sanity, en la lista de Experiencias. Si quieres
repetirla, le cambias la fecha y vuelves a publicar — o la duplicas desde el
menú de los tres puntos.

## Cambiar los textos del sitio

En **Textos del sitio** puedes editar el titular de la portada, la descripción
de qué es Sunny, el Instagram, el WhatsApp, el correo y las preguntas
frecuentes.

Lo que **no** se puede cambiar desde ahí: colores, tipografías, el orden de las
secciones o crear páginas nuevas. El panel administra contenido, no diseño.

---

# 3. Dónde están las solicitudes

En una hoja de Google con dos pestañas:

**`Solicitudes`** — quien pide lugar en una experiencia:

| Columna | Qué trae |
|---|---|
| Timestamp | Cuándo llegó, en horario de Monterrey |
| Experience ID · Experience Name | Cuál experiencia |
| Name · WhatsApp · Email | Cómo contactarla |
| Number of People | Cuántas van |
| Comments | Lo que haya escrito |
| **Status** | Entra como `Nueva` |
| **Notes** | Vacía, para tus apuntes |

**`Negocios`** — quien quiere crear una experiencia con Sunny. Mismas dos
últimas columnas.

Las columnas **Status** y **Notes** las llevas tú a mano. Sugerencia de estados:
`Nueva` → `Contactada` → `Confirmada` · `Cancelada` · `Rechazada`.

El sitio nunca las modifica: solo añade filas nuevas al final.

## Qué pasa cuando alguien manda una solicitud

1. Se guarda la fila en la hoja.
2. Te llega un correo con los datos y un enlace directo a su WhatsApp.
3. A la persona le llega un acuse que dice que **recibimos su solicitud** y que
   la vas a contactar para confirmar.

**El correo automático nunca le dice que su lugar está confirmado.** Eso lo
dices tú cuando le escribes. Si el correo lo prometiera, alguien se
presentaría a una clase donde nadie lo espera.

---

# 4. Variables de entorno

Los nombres están en `.env.example`. Nunca hay valores reales ahí.

| Variable | Qué es | ¿Secreta? |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `gp6ztiei` | No |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | No |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2026-08-01` | No |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Cuenta de servicio de Google | **Sí** |
| `GOOGLE_PRIVATE_KEY` | Su llave privada | **Sí** |
| `GOOGLE_SHEET_ID` | Identificador de la hoja | **Sí** |
| `MVP_RESEND_API_KEY` | Llave de Resend | **Sí** |
| `MVP_EMAIL_FROM` | Desde qué dirección salen los correos | No |
| `MVP_NOTIFY_EMAIL` | La bandeja de Emmy | No |
| `NEXT_PUBLIC_SITE_URL` | La dirección pública del sitio | No |

Las de correo llevan prefijo `MVP_` a propósito: así este flujo **no puede
heredar por accidente** la configuración de la versión avanzada.

**El MVP no necesita ninguna variable de Supabase para funcionar.**

---

# 5. Despliegue

El MVP lean va en un **proyecto de Vercel aparte**, conectado solo a la rama
`mvp-lean`. No comparte nada con el proyecto de la versión avanzada: ni URL, ni
variables, ni base de datos.

Eso es a propósito. Mientras estén separados, un error en el lean no puede
tocar los datos ni la dirección del proyecto que ya está en línea.

Pasos exactos en §7.

---

# 6. Qué NO incluye este MVP

Confirmado que siguen fuera, y siguen recuperables en las ramas avanzadas:

- Cuentas de usuario y acceso
- Reservaciones automáticas
- Control automático de cupo
- Folios y códigos
- «Mi pase»
- Panel de administración propio
- Membresías y pagos
- Portal para negocios

En su lugar: Emmy revisa cada solicitud, confirma por WhatsApp y lleva la cuenta
de asistentes por su lado. Es trabajo manual **por diseño**, no por falta de
tiempo — automatizarlo antes de saber cuánta demanda hay sería construir a
ciegas.

---

# 7. ACCIÓN REQUERIDA DE RUBEN

Cinco cosas. Ninguna necesita saber programar.

## 7.1 Publicar el panel de Emmy (Sanity Studio)

Sin esto, Emmy no tiene dónde entrar.

1. Abre una terminal en la carpeta del proyecto.
2. Escribe `npx sanity login` y presiona Enter.
3. Elige **Google** y entra con la misma cuenta con la que creaste el proyecto.
4. Escribe `pnpm studio:deploy` y presiona Enter.
5. Cuando termine, te da una dirección. Anótala: **esa es la que le pasas a
   Emmy.**

> Si dice que el nombre `the-sunny-project` ya está tomado, abre el archivo
> `sanity.cli.ts`, cambia esa palabra por otra —por ejemplo `sunny-project-mx`—
> guarda, y repite el paso 4.

## 7.2 Crear la hoja de Google

1. Entra a **sheets.google.com** y crea una hoja nueva.
2. Nómbrala **The Sunny Project — Solicitudes**.
3. Abajo a la izquierda verás una pestaña que dice «Hoja 1». Haz doble clic y
   nómbrala exactamente **`Solicitudes`**.
4. Pulsa el **+** de al lado para crear otra pestaña, y nómbrala exactamente
   **`Negocios`**.
5. En la pestaña `Solicitudes`, escribe estos títulos en la primera fila, uno
   por columna: `Timestamp`, `Experience ID`, `Experience Name`, `Name`,
   `WhatsApp`, `Email`, `Number of People`, `Comments`, `Status`, `Notes`.
6. En la pestaña `Negocios`: `Timestamp`, `Business Name`, `Contact Name`,
   `WhatsApp`, `Email`, `Instagram`, `Location`, `Experience Type`, `Message`,
   `Status`, `Notes`.
7. Mira la dirección de la hoja en el navegador. Se ve así:
   `docs.google.com/spreadsheets/d/`**`1a2b3c4d5e6f...`**`/edit`
   Copia la parte marcada. **Ese es tu `GOOGLE_SHEET_ID`.**

## 7.3 Crear el permiso para que el sitio escriba en la hoja

1. Entra a **console.cloud.google.com**.
2. Arriba, crea un proyecto nuevo. Nómbralo `sunny-project`.
3. En el buscador de arriba escribe **Google Sheets API** y ábrela. Pulsa
   **Enable**.
4. En el buscador escribe **Service accounts** y ábrelo.
5. Pulsa **Create service account**. Nómbralo `sunny-sheets`. Pulsa
   **Create and continue** y luego **Done**.
6. Verás una lista con un correo largo que termina en
   `.iam.gserviceaccount.com`. **Cópialo: ese es tu
   `GOOGLE_SERVICE_ACCOUNT_EMAIL`.**
7. Haz clic en ese correo. Ve a la pestaña **Keys** → **Add key** →
   **Create new key** → **JSON** → **Create**.
8. Se descarga un archivo. Ábrelo con el Bloc de notas. Busca la línea que
   empieza con `"private_key":`. **Copia todo lo que está entre comillas,
   incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`. Ese
   es tu `GOOGLE_PRIVATE_KEY`.**
9. **Muy importante:** vuelve a tu hoja de Google, pulsa **Compartir** arriba a
   la derecha, pega el correo del paso 6, dale permiso de **Editor** y pulsa
   enviar. Sin esto, el sitio no puede escribir en la hoja.

> Guarda ese archivo JSON en un lugar seguro y **no lo subas a ningún lado**.
> Es la llave de acceso a la hoja.

## 7.4 Configurar el correo

1. Entra a **resend.com** con la cuenta del proyecto.
2. Ve a **API Keys** → **Create API Key**. Cópiala: es tu
   `MVP_RESEND_API_KEY`.
3. Ve a **Domains** y verifica el dominio de The Sunny Project.
   **Hasta que esto esté hecho, los correos solo llegan a tu propia dirección** —
   ni Emmy ni las personas que soliciten lugar reciben nada.
4. `MVP_EMAIL_FROM` será algo como `hola@tudominio.com`.
5. `MVP_NOTIFY_EMAIL` es el correo de Emmy.

## 7.5 Crear el proyecto de Vercel

1. Entra a **vercel.com** → **Add New** → **Project**.
2. Elige el repositorio **SunnyProject**.
3. En **Branch**, escoge **`mvp-lean`**. *(No `main` ni las `claude/*`.)*
4. Antes de pulsar Deploy, abre **Environment Variables** y pega todas las de
   la tabla de §4.
5. Pulsa **Deploy**.
6. Al terminar te da una dirección `.vercel.app`. **Esa es la del MVP.**

> **No cambies el dominio oficial todavía.** La idea es revisar el MVP en esa
> dirección primero.

---

# 8. Antes de enseñárselo a Emmy

- [ ] Borrar o despublicar las experiencias que empiezan con **`TEST —`**. Son
      de prueba y están en Sanity para verificar que todo funciona.
- [ ] Sustituir la fotografía del hero. La actual es de referencia y **no está
      autorizada para producción** (ver `SUNNY_ASSET_MANIFEST.md`).
- [ ] Hacer una solicitud de prueba de punta a punta y comprobar que aparece la
      fila en la hoja y llegan los dos correos.
- [ ] Crear una experiencia real desde el Studio, con foto propia.

---

# 9. Segunda etapa

Cuando haya demanda real y el modelo de negocio esté definido, la versión
avanzada ya está construida y esperando en `claude/sunny-motion-choreography`:
cuentas, reservaciones con control de cupo, folios, «Mi pase» y panel propio.

No hay que rehacerla. Hay que decidir cuándo encenderla.
