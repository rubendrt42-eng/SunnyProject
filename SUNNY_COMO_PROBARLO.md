# Sunny — Por qué el enlace te lleva a la página vieja, y cómo probarlo

## El diagnóstico, con la evidencia

No es un fallo del login. **El login funciona.** El problema es que el sitio
nuevo no está publicado en ningún sitio al que puedas entrar.

Comprobado en vivo:

| Qué | Resultado |
|---|---|
| `sunny-project-teal.vercel.app` (producción) | Responde 200, pero sirve el **build viejo** |
| `the-best8.vercel.app` (el preview de tu captura) | **404 — ya no existe** |
| Ramas en GitHub | Tres ramas `claude/*`. **No hay `main`.** |

Producción sirve el build viejo, y se demuestra mirando su HTML: contiene
`hero-reel` (el componente de video que borré) y el titular
`DESCUBRE ALGO NUEVO ESTA SEMANA.`, y **no** contiene ninguna marca del diseño
actual (`Vívelo con alguien`, `Más filtros`, `orange-ink`).

### Por qué acabas ahí

El enlace mágico vuelve al dominio desde el que lo pediste. Ese dominio tiene
que estar en la lista de **Redirect URLs** de Supabase. Cuando no lo está,
Supabase **no da error**: redirige en silencio al **Site URL** del proyecto,
que es producción.

Así que pase lo que pase acabas en producción — y producción tiene el diseño
viejo. De ahí «me mete a una página vieja».

Antes «sí te metía» porque entonces navegabas directamente en producción: el
origen y el Site URL coincidían y no había nada que redirigir.

---

## Qué hay que hacer — 3 pasos

### Paso 1 · Publicar el código nuevo en producción (lo hace el dueño de Vercel)

En **Vercel → proyecto → Settings → Git → Production Branch**, cambiar la rama
de producción a:

```
claude/sunny-mvp-1-1-design-admin
```

y lanzar un despliegue (**Deployments → Redeploy**, o cualquier push a esa rama).

Por qué esta vía y no otra:

- `sunny-project-teal.vercel.app` **ya está** en la lista de Supabase. Al
  servir el código nuevo desde ahí, el login funciona **sin tocar nada más**.
- No requiere merge, así que no altera el historial de ninguna rama.
- Es un desplegable, no una decisión irreversible: se vuelve atrás cambiando
  el mismo campo.

**No hace falta aplicar ninguna migración para esto.** Lo verifiqué: las
columnas de la migración de grupos no existen todavía en la base
(`max_party_size`, `social_modes`, `is_original`, `archived_at` → HTTP 400), y
la función `claim_reservation` de 4 argumentos tampoco. El código lo soporta a
propósito: todas las consultas usan `select("*")` y `lib/experience-flags.ts`
devuelve el valor previo a la migración cuando la columna no está. El sitio es
correcto antes y después.

### Paso 1 bis · La plantilla del correo — ESTO ES LO QUE FALTABA

Éste es el paso que faltaba para poder iniciar sesión, y sin él el resto no
sirve.

**Supabase → Authentication → Emails → Magic Link**, reemplazar el contenido
por esto:

```html
<h2>Entra a Sunny</h2>
<p>
  <a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink&next=%2Fmi-pase">
    Iniciar sesión
  </a>
</p>
<p>Si no pediste este acceso, ignora este correo.</p>
```

(Si hay una plantilla **Confirm signup**, ponle lo mismo cambiando
`type=magiclink` por `type=signup`.)

#### Por qué

La plantilla actual usa `{{ .ConfirmationURL }}`, que devuelve un `?code=`.
Ese código es del flujo **PKCE**: al enviar el formulario, el navegador guarda
un `code_verifier` en una cookie **suya**, y el código solo se puede canjear
con él.

El problema es que los enlaces de correo casi nunca se abren en ese navegador.
Gmail —y WhatsApp, e Instagram— los abren en su **navegador integrado**, que
tiene su propio almacén de cookies. Ahí no está el verificador, el canje falla,
y la persona vuelve a `/acceso` sin sesión. Exactamente el fallo reportado.

`token_hash` no usa verificador: el servidor valida el token contra Supabase y
escribe las cookies de sesión. Funciona se abra donde se abra.

Comprobado en producción antes de arreglarlo: `/auth/callback?token_hash=…`
redirigía a `/acceso` sin intentar nada, porque la ruta solo miraba `?code=`.
Ya no.

### Paso 2 · Autorizar los previews en Supabase (una vez, para siempre)

**Supabase → Authentication → URL Configuration → Redirect URLs**, añadir:

```
https://sunny-project-teal.vercel.app/**
https://*.vercel.app/**
```

El comodín cubre cualquier preview futuro, así que este problema no vuelve a
aparecer cada vez que se crea una rama.

Y comprobar que **Site URL** siga siendo:

```
https://sunny-project-teal.vercel.app
```

### Paso 3 · Variables de entorno en Vercel

Que el despliegue de producción tenga las mismas claves que hay en local:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Conexión a la base |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexión desde el navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | Rol admin al iniciar sesión. **Solo servidor.** |
| `ADMIN_EMAIL` | A quién promover a admin |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Correos de confirmación |
| `NEXT_PUBLIC_SITE_URL` | URL canónica |

---

## Cómo probarlo, paso a paso

### A · Que estás en la versión nueva (10 segundos, antes de nada)

Abre `https://sunny-project-teal.vercel.app`. Debes ver:

- El titular en dos líneas: **«Descubre algo nuevo. Vívelo con alguien.»**, la
  segunda en naranja oscuro.
- La fotografía **sin** ninguna tarjeta blanca encima.
- En `/experiencias`, **una sola fila** de filtros y un botón **«Más filtros»**.

Si ves «DESCUBRE ALGO NUEVO ESTA SEMANA» en fondo oscuro, el despliegue del
paso 1 no se ha hecho todavía. **No sigas** — nada de lo de abajo va a
funcionar.

### B · Iniciar sesión

1. Entra a `/acceso`.
2. Abajo del formulario ahora dice **«El enlace te devolverá a …»**. Comprueba
   que coincide con la barra de direcciones. Si no coincide, falta el paso 2.
3. Escribe tu correo y envía.
4. Abre el enlace del correo **en el mismo dispositivo y el mismo navegador**.
   La sesión se guarda en una cookie de ese navegador.
5. Deberías volver al sitio con la sesión iniciada. En la cabecera aparecen
   **Mi pase · Mi cuenta · Panel**.

Si algo falla, la pantalla ahora te dice **qué** falló y te da un código corto:
no vuelve a mostrar el mismo mensaje genérico para todo.

**Un aviso sobre el límite de envíos:** Supabase corta los correos si se piden
muchos seguidos, y cada reintento alarga la espera. Si sale «Demasiados envíos
seguidos», espera lo que indique el mensaje. El botón se deshabilita solo para
evitar que empeores la espera.

### C · El panel de Emmy

Ya está listo en la base de datos: **verifiqué que tu perfil existe con
`role = admin`**, así que en cuanto inicies sesión el panel es accesible.

Entra a **`/admin`** o pulsa **«Panel»** en la cabecera. Verás:

| Ruta | Qué hace |
|---|---|
| `/admin` | Resumen: reservaciones de la semana y cupos |
| `/admin/experiencias` | Crear, editar, cancelar y archivar experiencias |
| `/admin/negocios` | Alta y edición de espacios aliados |
| `/admin/reservaciones` | Lista, asistencia, cancelación, exportar CSV |
| `/admin/solicitudes` | Negocios que se postularon desde `/para-negocios` |
| `/admin/usuarios` | Personas registradas y sus faltas |

Nadie sin sesión llega ahí: la comprobación vive en el middleware y devuelve
un 307 antes de renderizar nada.

### D · Reservar una experiencia

Aquí hay un paso previo que conviene saber, porque si no parece un fallo:

Tu perfil tiene `role = admin` pero **`full_name`, `adult_confirmed_at` y
`terms_accepted_at` están vacíos**. Los dejé vacíos a propósito: son tu
consentimiento y no me corresponde rellenarlos. Hasta que los completes, el
panel funciona pero **reservar no**.

Así que: entra a **`/mi-cuenta`**, completa nombre y las dos casillas, y ya
puedes reservar desde `/experiencias`. Hay 6 experiencias publicadas con fechas
del 1 al 6 de agosto de 2026.

---

## Lo que yo no puedo hacer, y por qué

- **Desplegar en Vercel.** El conector de Vercel de esta sesión sigue sin
  autorizar. Necesita hacerlo alguien con acceso a la cuenta.
- **Cambiar la configuración de Auth de Supabase.** Requiere un token de la
  Management API que esta sesión no tiene. Sí puedo leer y escribir datos con
  la clave de servicio — por eso pude verificar el perfil y las migraciones.
- **Enviar un enlace mágico para probarlo yo.** Iría a tu correo y gastaría tu
  límite de envíos. El único que puede completar la prueba de punta a punta
  eres tú.

## Lo que sigue pendiente en la base (no bloquea nada de lo anterior)

Las dos migraciones de MVP 1.1 siguen sin aplicar. El sitio funciona sin ellas
—reservación individual, un lugar por pase— pero mientras no se apliquen:

- No hay reservaciones con acompañantes.
- La garantía de no-sobreventa por concurrencia **no está demostrada**, porque
  requiere las 20 pruebas de `SUNNY_COMPANIONS_MIGRATION_PLAN.md` §6 en un
  entorno aislado.

Cuando quieras avanzar con eso, dímelo y lo preparamos con una rama de Supabase
o un proyecto de staging, no contra la base que estás usando para probar.
