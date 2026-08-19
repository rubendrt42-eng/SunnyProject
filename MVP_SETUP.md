# The Sunny Project — MVP Lean

Guía de la versión ligera del sitio: cómo está armada, cómo la usa Emmy, y qué
falta por configurar.

Rama: **`mvp-lean`**. La versión avanzada —cuentas, reservaciones, folios, panel
propio— sigue intacta en las ramas `claude/*` y no se toca desde aquí.

---

# 1. Cómo está armado

Tres piezas, cada una con un trabajo:

| Pieza | Para qué |
|---|---|
| **Sanity** | El contenido público: experiencias y textos del sitio. Lo edita Emmy |
| **Google Sheets** | Las solicitudes de personas y de negocios. Datos personales |
| **Vercel** | Donde vive el sitio |

Tres servicios. **No hay correo automático en esta etapa**, y eso es una
decisión, no una carencia: quita un servicio que configurar, un dominio que
verificar y una forma más de que el flujo falle a medias.

La contrapartida hay que tenerla presente: **nadie recibe un aviso empujado.**
Emmy se entera de una solicitud abriendo la hoja de cálculo. Con el volumen de
esta etapa eso es suficiente; el día que llegue una solicitud cada hora, habrá
que revisarlo.

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

Aparece en el sitio en poco más de un minuto, y no hay que avisar a nadie.

> **Refresca dos veces.** El sitio guarda cada página durante un minuto para
> abrir rápido en un celular con mala señal. Pasado ese minuto, la **primera**
> visita todavía ve la versión anterior —y es la que dispara la actualización—;
> la **segunda** ya ve lo nuevo. Como normalmente la primera persona en abrir el
> sitio después de publicar eres tú, lo más probable es que veas tu propio
> cambio en el segundo refresco, no en el primero. No está roto.
>
> Medido en el sitio publicado: dentro del minuto, `HIT` con la versión
> guardada; pasado el minuto, la primera petición responde `STALE` con la
> versión vieja y la siguiente ya responde `HIT` con la nueva.

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

1. El sitio valida los datos.
2. Se guarda la fila en la hoja, con estado `Nueva`.
3. La persona ve en pantalla: **«¡Recibimos tu solicitud! The Sunny Project
   revisará la disponibilidad y se pondrá en contacto contigo para confirmar tu
   lugar.»**

Y ya. **No se manda ningún correo**, ni a ella ni a ti.

Si la hoja falla, la persona ve *«No pudimos enviar tu solicitud. Inténtalo
nuevamente en unos minutos»* y **nunca un mensaje de éxito**. Una solicitud que
no se guardó no puede decirle a nadie que se recibió: alguien se presentaría a
una clase donde nadie lo espera.

**Revisa la hoja a diario.** Es la única forma de enterarte de que entró algo.

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
| `NEXT_PUBLIC_SITE_URL` | La dirección pública del sitio | No |

Siete variables en total, y solo tres son secretas.

**El MVP no necesita variables de Supabase ni de ningún servicio de correo
para funcionar.** Si falta alguna de las tres de Google, el formulario devuelve
error y no registra nada — que es el comportamiento correcto.

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

Cuatro cosas. Ninguna necesita saber programar.

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

## 7.4 Crear el proyecto de Vercel

**Tiene que ser un proyecto nuevo, no el que ya existe.** No es manía de orden:
el proyecto `sunny-project` tiene enganchada una **integración de Supabase**, y
Vercel la conecta *antes* de compilar. Si esa base de datos está pausada —los
proyectos gratuitos de Supabase se duermen a los siete días sin uso— el
despliegue muere en un segundo con `Provisioning integrations failed`, sin
registro de build y sin decir por qué. El MVP lean no usa Supabase para nada,
así que en un proyecto limpio ese fallo no puede ocurrir.

1. Entra a **vercel.com** → **Add New** → **Project**.
2. Elige el repositorio **SunnyProject**.
3. Ponle un nombre propio. De ahí sale la dirección, así que conviene que se
   entienda: `sunny-mvp` da `sunny-mvp.vercel.app`.
4. **Application Preset** debe decir **Next.js** y **Root Directory** `./`.
5. Abre **Environment Variables**. Vercel precarga las que encuentra en el
   `.env.example` de la rama principal del repositorio, que es la de la versión
   avanzada: aparecerán unas diez, de Supabase y de correo. **Bórralas todas** y
   deja solo las de la tabla de §4.
6. Si en algún momento ofrece añadir integraciones, **dile que no a todas**.
7. Pulsa **Deploy**.

Ese primer despliegue construye la rama principal del repositorio, no
`mvp-lean`: la pantalla de importación de Vercel no deja elegir rama. Es
esperado, y se corrige a continuación.

8. **Settings → Environments → Production** → cambia la rama a **`mvp-lean`** →
   **Save**.
9. Empuja cualquier commit a `mvp-lean`. Eso es lo que dispara el despliegue de
   la rama nueva — **«Redeploy» no sirve aquí**, porque reconstruye el mismo
   commit de antes, que es de la rama vieja.
10. Al terminar te da una dirección `.vercel.app`. **Esa es la del MVP**, y es
    pública: se abre desde cualquier teléfono, sin cuenta de Vercel.

> **No cambies el dominio oficial todavía.** La idea es revisar el MVP en esa
> dirección primero.

---

# 8. Antes de enseñárselo a Emmy

- [ ] Borrar o despublicar las experiencias que empiezan con **`TEST —`**. Son
      de prueba y están en Sanity para verificar que todo funciona.
- [ ] Sustituir la fotografía del hero. La actual es de referencia y **no está
      autorizada para producción** (ver `SUNNY_ASSET_MANIFEST.md`).
- [ ] Hacer una solicitud de prueba y comprobar que aparece la fila en la hoja,
      con la experiencia correcta y estado `Nueva`.
- [ ] Crear una experiencia real desde el Studio, con foto propia.

---

# 9. Segunda etapa

Cuando haya demanda real y el modelo de negocio esté definido, la versión
avanzada ya está construida y esperando en `claude/sunny-motion-choreography`:
cuentas, reservaciones con control de cupo, folios, «Mi pase» y panel propio.

No hay que rehacerla. Hay que decidir cuándo encenderla.

Los avisos automáticos por correo también quedan para entonces. Cuando el
volumen haga incómodo revisar la hoja a diario, se añaden — y para eso hará
falta un dominio verificado, que es justo el trámite que esta versión evita.
