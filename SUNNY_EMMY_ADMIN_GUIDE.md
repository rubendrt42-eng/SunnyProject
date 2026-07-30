# Guía del panel de Sunny — para Emmy

Esta guía es para operar Sunny sin tocar código y sin pedirle nada al desarrollador. No hace falta saber programar.

Si algo no coincide con lo que dice aquí, no es tu error: avísanos.

---

## Cómo entrar

1. Abre el sitio y da clic en **Acceso** (arriba a la derecha).
2. Escribe **tu correo de administradora** (el mismo que se configuró al crear el proyecto) y presiona *Enviar enlace de acceso*.
3. Abre el correo que te llega y da clic en el enlace **desde el mismo navegador**.
4. Ya dentro, en el menú de arriba aparece **Panel**. Ese es tu panel.

También puedes escribir `/admin` directamente en la barra de direcciones.

> Si escribes `/admin` sin haber entrado, el sitio te manda a la pantalla de acceso. Es lo correcto: nadie más puede ver el panel.

Para salir del panel y volver al sitio público: **Salir al sitio**, abajo del menú lateral.

---

## Lo primero que ves: el Dashboard

Está pensado para responder de un golpe:

- **Cuál es la siguiente experiencia** y cuándo empieza (primer renglón, en texto).
- **Necesita atención** — el recuadro amarillo. Solo aparece cuando hay algo que atender: una experiencia agotada, una que empieza en menos de 48 horas sin ninguna reservación, una a la que le quedan uno o dos lugares, o una que sigue en borrador. Si no hay nada, el recuadro no aparece.
- **Próximos 7 días** — la tabla con cupo, cuántos lugares están reservados, cuántos quedan libres, y cuántas reservaciones son de grupo.
- **Totales** — los números generales.
- Si hay **solicitudes nuevas** de negocios, aparece un aviso al final y un número junto a *Solicitudes* en el menú.

Todos los números vienen de la base de datos. Si algo se ve raro, es que el dato está raro, no el cálculo.

---

## Negocios

### Crear un negocio

1. Menú → **Negocios** → botón **Nuevo negocio**.
2. Llena **nombre** y **dirección web corta** (el "slug": minúsculas y guiones, por ejemplo `casa-clara`).
3. Categoría, contacto, correo, teléfono e Instagram son opcionales pero ayudan.
4. Guarda.

Un negocio se necesita **antes** de poder crear una experiencia suya.

### Activar o desactivar

En la lista, el botón **Activo / Inactivo**. Desactivar no borra nada: solo evita asignarle experiencias nuevas. Sus experiencias y reservaciones se conservan.

### Mostrarlo como aliado en la página principal

El botón **Mostrar como aliado**. Es una decisión aparte de "activo": un negocio con el que trabajas **no** aparece en público hasta que tú lo marques aquí.

La sección *"Espacios que forman parte de Sunny"* de la página principal **solo existe si hay al menos un negocio marcado así**. Si no marcas ninguno, esa sección simplemente no se muestra.

> Los negocios de demostración no tienen logotipo, así que la tarjeta muestra el nombre en letra en lugar de una imagen.

---

## Experiencias

### Crear una experiencia

Menú → **Experiencias** → **Nueva experiencia**. Los campos que importan:

- **Negocio** — de la lista de negocios que ya creaste.
- **Título** y **dirección web corta**.
- **Frase breve** — es la que se lee en las tarjetas. Corta y concreta.
- **Descripción** — el texto largo de la página.
- **Categoría**.
- **Fotografía** — ver abajo.
- **Lugar, dirección y enlace de mapa**.
- **Fecha y hora de inicio y de fin**.
- **Cuándo abren y cierran las reservaciones**.
- **Cupo** — cuántas personas caben en total.
- **Beneficio posterior** (opcional) — por ejemplo *"20 % en su primera mensualidad"*.
- **Lugares por reservación** — ver "Acompañantes".
- **Modalidad social** — ver abajo.
- **Estado**, **destacada**, **Sunny Original**.

### Cómo subir una fotografía

En el formulario, el campo de fotografía tiene un botón para **elegir un archivo** de tu computadora. Al elegirlo se sube y queda ligado a la experiencia. Usa fotos **verticales** cuando puedas: el sitio está diseñado para vertical.

Si una experiencia no tiene foto, el sitio muestra un recuadro neutro que dice que falta la foto. **No inventa una imagen.** Eso es a propósito.

### Modalidad social

Son las etiquetas que la gente ve en la tarjeta: *Puedes venir solo*, *Ideal para ir con amigos*, *Conoce gente nueva*, *Permite acompañante*, *Grupo pequeño*, *Apto para principiantes*.

**Marca solo lo que sea cierto.** Una etiqueta que no corresponde es peor que ninguna etiqueta. Si no marcas nada, no se muestra ninguna: eso está bien.

### Publicar y ocultar

- Una experiencia nueva nace en **Borrador**: nadie la ve.
- **Publicar** la pone en el sitio.
- **Ocultar** la regresa a borrador. Sale del sitio público y **sus reservaciones se conservan**.

### Duplicar

El botón **Duplicar** crea una copia en borrador con la misma información: negocio, título, descripción, categoría, foto, requisitos, instrucciones, cupo, lugares por reservación, modalidad y beneficio.

**No copia** reservaciones, folios, asistencias ni estadísticas.

⚠️ **Revisa la fecha.** La copia queda una semana después de la fecha original, porque el sistema necesita una fecha para guardar. Cámbiala antes de publicar.

### Cancelar

Cancelar una experiencia la marca como cancelada **y cancela todas sus reservaciones**, de modo que cada persona recupera su pase de esa semana. Úsalo cuando la experiencia realmente no va a ocurrir.

### Archivar

**Archivar** la saca del sitio y del dashboard, pero **no borra nada**: sus reservaciones, folios y asistencias siguen ahí, y puedes **Restaurar** cuando quieras. Úsalo para ordenar tu lista sin perder historia.

> Nada en el panel borra registros. No hay botón de eliminar, a propósito.

### Los filtros de la lista

Arriba de la lista: *Activas* (lo que estás operando, es lo que ves por defecto), *Borradores*, *Publicadas*, *Agotadas*, *Finalizadas*, *Canceladas*, *Archivadas*, *Todas*. El número al lado dice cuántas hay en cada uno.

### Revisar cupos

Cada experiencia de la lista muestra **reservados / cupo**, una barra de ocupación, y cuántos lugares quedan libres. Si no quedan, el número se pone naranja y dice *Sin lugares*.

Los lugares se cuentan **por personas**, no por reservaciones: una reservación de tres personas descuenta tres.

---

## Reservaciones

Menú → **Reservaciones**.

Cada reservación muestra el **titular**, su **correo**, la **experiencia**, la **fecha**, el **folio**, el **estado**, cuándo reservó, de dónde vino, y —si es de grupo— la **lista de acompañantes** con su nombre y su correo si lo dieron.

### Buscar y filtrar

- **Buscar** por nombre, correo, folio, nombre de la experiencia o nombre de un acompañante.
- **Experiencia** — para ver la lista de una sola.
- **Estado** — confirmada, asistió, no-show, cancelada.
- **Tipo** — solo individuales o solo grupos.
- **Fecha**.

Un atajo útil: desde **Experiencias**, el enlace *Ver reservaciones* te lleva ya filtrada a esa experiencia.

### Marcar asistencia y no-show

En cada reservación confirmada: **Asistió** y **No-show**. En una reservación de grupo, marcar al titular marca también a sus acompañantes.

Solo aparecen en reservaciones confirmadas. Una reservación cancelada no se puede marcar como asistida — el panel no ofrece esa acción a propósito.

### Cancelar una reservación

El botón **Cancelar**. Tú puedes cancelar sin el límite de 12 horas que aplica a las personas. Si era de grupo, se cancelan **todos** los lugares y el cupo se libera completo.

### Exportar

**Exportar CSV** descarga las reservaciones para abrirlas en Excel o Google Sheets.

---

## Solicitudes de negocios

Menú → **Solicitudes**. Aquí llega todo lo que alguien envía desde *Para negocios* en el sitio público, con todos los datos del formulario: negocio, contacto, correo, WhatsApp, Instagram, categoría, ciudad, cupos que ofrece y su mensaje.

- **Cambiar el estado**: Nueva → Contactada → Reunión agendada → Aceptada, o Rechazada.
- **Notas internas**: para lo que hablaste y lo que quedó pendiente. **Solo tú las ves**; nunca salen en el sitio público.
- **Convertir en negocio**: crea el negocio con los datos que ya mandaron, para que no los vuelvas a escribir, y te lleva a editarlo. Queda **inactivo** hasta que tú lo actives, porque una conversación no es todavía un aliado. La solicitud **no se borra**: queda marcada como *Convertida* para que se sepa de dónde salió ese negocio.

---

## Usuarios

Menú → **Usuarios**. Una vista de **solo consulta** con nombre, ciudad, fecha de registro, cuántas reservaciones tiene, cuántas veces asistió, cuántos no-shows, su última actividad y si su perfil está completo. Puedes buscar por nombre.

Desde aquí **no** se editan permisos ni contraseñas, y no se envían correos masivos. Es a propósito. Para ver el detalle de las reservaciones de alguien, búscalo por nombre en **Reservaciones**.

---

## Acompañantes

Algunas experiencias permiten que una persona reserve para más de una.

**Cómo se configura**: en el formulario de la experiencia, el campo **Lugares por reservación**: 1 (individual), 2 (permite un acompañante) o 3 (permite dos). **El valor por defecto es 1**: si no lo cambias, la experiencia es individual.

**Cómo funciona para quien reserva**: elige cuántos lugares quiere y escribe el **nombre completo** de cada acompañante (el correo es opcional). Los lugares se descuentan del cupo de verdad.

**Cómo lo revisas tú**: en **Reservaciones** cada grupo muestra a sus acompañantes, y el filtro *Tipo* te deja ver solo los grupos.

**Reglas**: los acompañantes no necesitan cuenta y no gastan su propio pase semanal. El pase es del titular, y el titular responde por su grupo. Si cancela, **se cancelan todos los lugares del grupo**. Los nombres se capturan al reservar y no se pueden cambiar después.

> ⚠️ **Esta función todavía no está encendida.** Requiere un cambio en la base de datos que aún no se ha aplicado. Mientras eso no pase, el campo *Lugares por reservación* se guarda pero todas las experiencias funcionan como individuales, y las acciones *Sunny Original* y *Archivar* no aparecen en el panel. En cuanto se aplique, todo lo de esta sección funciona sin que tengas que hacer nada más.

---

## Preguntas rápidas

**¿Puedo borrar una experiencia?** No, y es a propósito. Usa **Archivar**: desaparece de la vista y no pierdes su historia.

**Cambié algo y no lo veo en el sitio.** El panel refresca la información al guardar. Si el sitio público sigue igual, recarga la página.

**¿Por qué no aparece la sección de aliados?** Porque ningún negocio está marcado como *Mostrar como aliado*. Marca uno.

**¿Por qué no aparece la sección de Sunny Originals?** Porque ninguna experiencia está marcada como Original — y esa opción aparece solo después del cambio de base de datos pendiente.

**Una experiencia dice "Agotada" pero sé que hay lugar.** El sistema cuenta personas, no reservaciones. Revisa en **Reservaciones**, filtrando por esa experiencia, si hay grupos ocupando más lugares de los que parece.
