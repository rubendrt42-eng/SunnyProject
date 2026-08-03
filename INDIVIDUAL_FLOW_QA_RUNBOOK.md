# Guía de prueba manual — flujo individual de Sunny Project

Esta guía es para probar el sitio ya publicado, sin tocar código. Sigue los pasos en orden — cada uno depende del anterior. Al final hay una tabla para anotar el resultado de cada paso.

No necesitas saber programar. Si algo no coincide con lo que describe esta guía, no es tu error — es justo lo que estamos buscando encontrar.

---

## Antes de empezar

**Qué URL abrir**: la URL de vista previa (preview) de Vercel para la rama `claude/sunny-mvp-1-1-design-admin`. No uses el dominio de producción.

**Antes de empezar, corre el seed.** Abre el editor SQL de Supabase y ejecuta `supabase/demo_seed.sql`. Es lo único necesario para que el sitio se vea con contenido: crea las seis experiencias de demostración con sus fotografías. Sin eso verás estados vacíos por todas partes, y eso no es un error del sitio.

**Qué vas a ver que es normal, no un error**:

- **Ya hay fotografías reales.** Si alguna sección muestra un recuadro neutro que dice "Falta &lt;archivo&gt;" o "Sin fotografía", es intencional: significa que ese asset concreto no existe todavía. Las categorías *Outdoor* no tienen foto a propósito, y los negocios de demostración no tienen logotipo (la tarjeta de aliado muestra el nombre en letra).
- **No hay video en el hero.** El hero es una composición editorial con fotografía, no video: no llegó material de video. No lo reportes como falta.
- **La sección "Sunny Originals" puede no aparecer.** Solo existe si alguna experiencia está marcada como Original, y esa opción requiere una migración que todavía no se aplicó.
- **La sección "Espacios que forman parte de Sunny" puede no aparecer.** Solo existe si marcas algún negocio como aliado desde el panel.
- **Las etiquetas de modalidad social** (*Puedes venir solo*, *Permite acompañante*, …) y **el selector de lugares para acompañantes** aparecen solo después de la misma migración pendiente. Hasta entonces todas las experiencias funcionan como individuales.

**Nombres de las experiencias**: si conoces la versión anterior, tres cambiaron de nombre para que coincidan con la fotografía disponible — *Pilates Reformer Intro* → **Mat Pilates Intro**, *Sunrise Paddle* → **Pádel Mix-In** (pádel de raqueta, no paddle board), *Recovery Contrast Session* → **Recovery & Breathwork**. Está explicado en `SUNNY_ASSET_MANIFEST.md` §3.

**Correo a usar**: cualquier correo real al que tengas acceso ahora mismo (Gmail, Outlook, etc.). Vas a recibir un correo con un enlace — asegúrate de abrirlo desde el mismo navegador/dispositivo donde empezaste la prueba.

**Antes de reservar — revisa que haya una experiencia disponible**: abre `/experiencias` primero. Si ves el mensaje "Aún no hay experiencias publicadas" o todas dicen "Agotada"/"Finalizada", avísame antes de continuar — puede que los datos de ejemplo necesiten actualizarse desde el panel de Supabase (no es algo que puedas arreglar tú desde el sitio).

---

## Paso 1 — Iniciar sesión con magic link

1. Abre la URL del sitio.
2. Da clic en "Acceso" (arriba a la derecha) o en cualquier botón "Iniciar sesión".
3. Escribe tu correo y presiona "Enviar enlace de acceso".
4. **Resultado esperado**: la pantalla cambia a "Revisa tu correo" con tu correo mostrado.
5. Abre tu bandeja de entrada (revisa también spam/promociones) y busca un correo de Sunny Project / Supabase con un enlace de acceso.
6. Da clic en el enlace **desde el mismo navegador** donde hiciste el paso 1-3.
7. **Resultado esperado**: regresas al sitio, ves brevemente un mensaje "Sesión iniciada" en la parte de arriba, y el botón que antes decía "Acceso" ahora dice "Mi pase".

**Importante sobre el correo**: si al presionar "Enviar enlace de acceso" aparece *"No pudimos enviar el enlace"*, **no vuelvas a intentarlo**. Es el límite de envío del mailer de prueba de Supabase (`over_email_send_rate_limit`), no un error del sitio. Anótalo y avísanos.

**Si iniciaste sesión desde una experiencia específica** (por ejemplo, diste clic en "Obtener mi pase" en una experiencia sin haber iniciado sesión): después de abrir el enlace del correo, **deberías regresar a esa misma experiencia**, no a una página genérica. Anota si esto no ocurre — es uno de los puntos que no hemos podido confirmar sin probarlo de verdad.

---

## Paso 2 — Completar tu perfil

Si es tu primera vez, al intentar reservar te va a pedir completar tu perfil.

1. Llena tu nombre completo.
2. Marca la casilla "Confirmo que tengo 18 años o más".
3. Marca la casilla de aceptar términos y aviso de privacidad.
4. Presiona "Continuar".
5. **Resultado esperado**: sin recargar la página, pasas directo a la pantalla de confirmar tu reservación (ver Paso 3).

---

## Paso 3 — Reservar 1 lugar

1. Ve a `/experiencias` y elige cualquier experiencia que diga "Disponible" o muestre lugares.
2. Da clic en la tarjeta (esto puede abrir una vista rápida — un panel lateral en computadora o que sube desde abajo en el celular) o entra a la experiencia completa.
3. Marca la casilla "Entiendo que el pase es personal, no transferible…".
4. Presiona "Obtener mi pase".
5. **Resultado esperado**: el botón cambia a "Reservando…" muy brevemente, y luego aparece una pantalla de "¡Pase confirmado!" con un folio (algo como `SUN-2026-XXXXXX`).

**Cómo verificar que el cupo bajó**: antes de reservar, anota cuántos "lugares" mostraba la experiencia (por ejemplo "5 lugares"). Después de reservar, recarga la página de esa experiencia — el número debe haber bajado exactamente en 1.

---

## Paso 4 — Ver "Mi pase"

1. Da clic en "Mi pase" (arriba a la derecha).
2. **Resultado esperado**: ves la experiencia que acabas de reservar, tu folio, la fecha, el lugar, y un botón para cancelar.

---

## Paso 5 — Cancelar la reservación

1. En "Mi pase", presiona "Cancelar reservación".
2. Confirma cuando el navegador te pregunte "¿Seguro que quieres cancelar tu pase?".
3. **Resultado esperado**: la página se actualiza y ya no muestra tu pase activo — en su lugar debería invitarte a elegir otra experiencia esa misma semana.

Nota: solo puedes cancelar si faltan **más de 12 horas** para que empiece la experiencia. Si elegiste una experiencia muy próxima, el botón de cancelar puede no aparecer — eso es esperado, no un error.

**Cómo verificar que el cupo regresó**: vuelve a la página de esa experiencia y recarga. El número de "lugares" debe haber vuelto a subir en 1 (al valor que tenía antes del Paso 3).

---

## Paso 6 — Entrar al panel de administración (solo si tienes una cuenta de administrador)

Esto requiere que tu correo esté configurado como el correo de administrador del proyecto (`ADMIN_EMAIL`). Si no sabes si el tuyo lo es, pídele a quien configuró el proyecto que te confirme cuál correo usar, o prueba con el mismo correo que configuraste originalmente en Supabase/Vercel.

1. Ve a `/admin` (puedes escribirlo directamente en la barra de direcciones).
2. Si tu correo es administrador, entras directo al panel (si ya iniciaste sesión con ese correo antes).
3. Ve a "Reservaciones" en el menú lateral.
4. **Resultado esperado**: busca la reservación que hiciste en el Paso 3 — debe aparecer con tu nombre/correo, el folio, la experiencia, y el estado "Cancelada" (si ya completaste el Paso 5) o "Confirmada" (si no has cancelado).

---

## Qué capturas tomar si algo sale mal

Si cualquier paso no da el resultado esperado:

1. Toma una captura de pantalla completa (que se vea la URL en la barra de direcciones).
2. Si aparece algún mensaje de error en pantalla, cópialo tal cual (texto completo).
3. Anota la hora exacta en que ocurrió.
4. Anota qué correo usaste.
5. Si es algo intermitente (a veces pasa, a veces no), intenta repetir el paso una segunda vez y anota si se repite.

No necesitas revisar la consola del navegador ni nada técnico — con la captura y el texto del error es suficiente.

---

## Tabla de registro de resultados

Copia esta tabla y márcala mientras pruebas. Usa una de estas cuatro opciones en cada fila: **Funciona** / **No funciona** / **No se entiende** / **No se pudo probar**.

| # | Paso | Resultado |
|---|---|---|
| 1 | Enviar el enlace mágico | |
| 2 | Recibir el correo | |
| 3 | Abrir el enlace y volver a Sunny con sesión iniciada | |
| 4 | Si venías de una experiencia, regresar a esa misma experiencia | |
| 4b | Compartir una experiencia: "Compartir" abre la hoja nativa y "Copiar enlace" avisa "Enlace copiado." | |
| 5 | El header cambia de "Acceso" a "Mi pase" | |
| 6 | Completar el perfil | |
| 7 | Ver la pantalla de confirmar reservación | |
| 8 | Reservar 1 lugar y ver "¡Pase confirmado!" | |
| 9 | El folio se ve completo y correcto | |
| 10 | El cupo bajó exactamente en 1 | |
| 11 | Ver la reservación en "Mi pase" | |
| 12 | Cancelar la reservación | |
| 13 | El cupo regresó exactamente en 1 | |
| 14 | Entrar a `/admin` | |
| 15 | Ver la reservación en "Reservaciones" del panel | |
| 16 | El estado en el panel coincide con lo que hiciste (confirmada/cancelada) | |

---

## Nota importante

Este flujo **sigue sin probarse con un correo real, un enlace real y un navegador real.** El límite de envío de Supabase nunca se liberó durante el trabajo, y el brief prohíbe reintentar envíos de OTP, así que no se envió ninguno.

Lo que **sí** se verificó en esta fase, y no hace falta que repitas:

- Todas las páginas públicas y del panel renderizan sin errores de consola, con datos de forma real (24 capturas revisadas a 375, 390, 430, 768, 1024 y 1440 px).
- No hay scroll horizontal accidental en ninguna ruta ni viewport (42 combinaciones comprobadas).
- `/admin` responde 307 y **no envía nada** a quien no sea administradora — un defecto real que se encontró y se corrigió en esta fase.
- `lint`, `typecheck`, 76 pruebas unitarias y el build de producción pasan.

Lo que **solo tú puedes probar**: el correo llegando, la sesión estableciéndose, y una reservación real contra la base de datos. El detalle completo de qué se probó y qué no está en `SUNNY_DESIGN_QA_REPORT.md` §5.
