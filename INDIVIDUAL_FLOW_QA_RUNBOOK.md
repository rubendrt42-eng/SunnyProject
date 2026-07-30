# Guía de prueba manual — flujo individual de Sunny Project

Esta guía es para probar el sitio ya publicado, sin tocar código. Sigue los pasos en orden — cada uno depende del anterior. Al final hay una tabla para anotar el resultado de cada paso.

No necesitas saber programar. Si algo no coincide con lo que describe esta guía, no es tu error — es justo lo que estamos buscando encontrar.

---

## Antes de empezar

**Qué URL abrir**: la URL de vista previa (preview) de Vercel para la rama `claude/sunny-mvp-1-1-implementation`, o el dominio de producción si así se decidió probarlo (`sunny-project-teal.vercel.app` era el dominio usado anteriormente — confirma con quien administra Vercel cuál es la URL correcta para esta rama antes de empezar, porque yo no desplegué nada desde aquí).

**Qué vas a ver que es normal, no un error**: las fotos y el video del hero probablemente muestren un aviso como "Falta pilates.webp" o "Falta hero-reel.mp4" en vez de una imagen. Eso es intencional en esta fase — las fotos reales todavía no se han subido. No lo reportes como error a menos que en vez de ese aviso veas una imagen rota sin texto o la página se vea rota.

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

Este flujo nunca se ha probado de esta forma antes — con un correo real, un enlace real, y un navegador real. Todo lo que describe esta guía está basado en la lectura cuidadosa del código, no en una prueba ya realizada. Es exactamente por eso que necesitamos que tú lo hagas: para confirmar (o descartar) que funciona como se espera.
