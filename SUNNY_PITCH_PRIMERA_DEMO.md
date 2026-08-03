# Sunny Project — Guion para la primera demo

Para leer antes de la junta. Lo urgente está arriba.

---

# 0. DECIDE ESTO PRIMERO (2 minutos)

**Producción está sirviendo el hero viejo**, el de la foto en columna. El hero
nuevo a pantalla completa está en la rama `claude/sunny-motion-choreography`,
sin publicar.

Tienes dos opciones:

| | Qué muestras | Riesgo |
|---|---|---|
| **A. Publicar el hero nuevo** | La portada que acabas de aprobar | Cambias producción 20 min antes de la junta |
| **B. Presentar lo que ya está** | El hero anterior, que funciona bien | Muestras algo que ya no te convence |

**Si eliges A**, en Vercel: *Settings → Environments → Production →* cambia la
rama a `claude/sunny-motion-choreography` → *Deployments* → *Redeploy*. Tarda
~2 minutos. Yo no lo hago porque me pediste no tocar producción, y esa
instrucción sigue en pie hasta que me digas otra cosa.

**Mi recomendación: A.** El cambio pasó lint, typecheck, 119 pruebas, build,
0 hallazgos de accesibilidad y 0 fallos de scroll horizontal en 30
combinaciones. Y la portada es literalmente lo primero que va a ver.

Sea cual sea, **abre la página en tu navegador antes de la junta** y déjala
cargada. No la abras por primera vez delante de ella.

---

# 1. El pitch de apertura (60 segundos)

> «Emmy, lo que te voy a enseñar es una primera versión funcional, no un
> diseño. Es un sitio real: tiene base de datos, la gente puede crear cuenta y
> apartar su lugar, y tú tienes un panel para administrarlo todo sin
> depender de mí.
>
> La idea completa de Sunny cabe en una frase: **cada semana tienes un pase
> gratuito para probar una experiencia local, y la vives acompañada.** Todo el
> sitio está construido alrededor de esa frase.
>
> El contenido que vas a ver es de demostración —nombres y fotos de ejemplo—
> porque quería que vieras cómo se siente lleno, no vacío. Cuando pongamos tus
> aliados reales, se reemplaza sin tocar el diseño.»

**Por qué funciona:** pones el marco («primera versión funcional»), das la
promesa en una frase, y desactivas de entrada la pregunta incómoda («¿estos
son mis negocios?») antes de que la haga.

---

# 2. Cómo entender el producto (esto es para ti)

Hay **tres personas** usando el mismo sitio. Si tienes esto claro, puedes
explicar cualquier pantalla.

### 2.1 La persona que quiere salir de la rutina

Entra, ve lo que hay esta semana, crea cuenta con su correo (sin contraseña) y
aparta un lugar. **Un pase por semana, gratis.**

Reglas del pase, que son las que te van a preguntar:
- Una semana = lunes a domingo.
- Se renueva solo cada lunes.
- **No se acumula.** Si no lo usas, se pierde.
- Se puede cancelar hasta 12 horas antes.

### 2.2 El negocio aliado

Llena un formulario en «Para negocios» y su solicitud le llega a Emmy a la
bandeja del panel. No se registra solo, no publica nada solo. Emmy decide.

### 2.3 Emmy

Tiene un panel aparte (`/admin`) donde crea experiencias, ve quién viene,
marca asistencia y gestiona aliados. **Nadie más puede entrar ahí**, ni
escribiendo la dirección a mano.

---

# 3. El recorrido de la demo (en orden, sin improvisar)

Sigue este orden. Está pensado para que cada pantalla prepare la siguiente.

### Paso 1 — La portada (30 s)

Déjala quieta unos segundos antes de hablar. Que vea la foto.

> «Lo primero que se ve es la promesa y una sola acción: explorar esta semana.
> Los números de abajo son reales, salen de la base de datos: hoy hay 6
> experiencias en 6 espacios distintos.»

### Paso 2 — Baja despacio por la portada (2 min)

**No la recorras entera.** Párate en tres sitios:

1. **«Esta semana en Sunny»** — «Esto es el corazón. Cambia solo cada semana
   según lo que publiques en tu panel.»
2. **«Cómo funciona»** — «Tres pasos. Es la sección que contesta la duda de
   quien nunca ha usado esto.»
3. **«Para negocios»** — «Aquí llegan los aliados nuevos. El formulario es
   real y te cae a ti.»

### Paso 3 — El catálogo (1 min)

Click en «Explorar esta semana».

> «Aquí está todo lo de la semana, con filtros por tipo. Fíjate que cada
> tarjeta dice cuántos lugares quedan — eso es real, baja conforme la gente
> aparta.»

Haz click en una tarjeta para abrir la **vista rápida** (el panel lateral).

> «Puedes ver el detalle sin perder tu lugar en la lista. Y si lo compartes
> por WhatsApp, se abre así directamente.»

### Paso 4 — El detalle y la reserva (1 min)

Entra a una experiencia completa. Muestra el botón de apartar lugar.

> «Aquí es donde se aparta. Si no tienes cuenta, te pide el correo primero.»

**No completes una reserva en vivo** salvo que hayas ensayado. Descríbelo.

### Paso 5 — EL PANEL (4 min, es lo más importante)

Este es el momento que decide la junta. Todo lo anterior lo puede hacer
cualquier página bonita; esto es lo que te separa.

> «Emmy, esto es tuyo. Aquí no me necesitas.»

Enséñale en este orden:

| Pantalla | Qué decir |
|---|---|
| **Resumen** | «Lo que pasa hoy, de un vistazo.» |
| **Experiencias** | «Aquí creas una experiencia nueva: nombre, foto, fecha, cupo. Y la publicas o la ocultas con un botón.» |
| **Reservaciones** | «Quién viene a cada cosa. El día del evento marcas quién asistió y quién no.» |
| **Negocios** | «Tus aliados. Puedes desactivar uno sin borrar su historial.» |
| **Solicitudes** | «Los negocios que quieren entrar. Te llega aquí.» |

Frase de cierre del panel:

> «Nada de esto pasa por mí. Tú publicas, tú cancelas, tú marcas asistencia.»

---

# 4. Por qué las secciones están en ese orden (el criterio)

Si te pregunta «¿y por qué está así acomodado?», la respuesta corta es:
**la portada responde cinco preguntas, en el orden en que la gente se las
hace.**

| # | Sección | La pregunta que contesta |
|---|---|---|
| 1 | Portada / foto grande | ¿Qué es esto? |
| 2 | Cinta de experiencias | ¿Hay cosas de verdad? |
| 3 | **Esta semana** | ¿Qué hay AHORA? ← lo más importante |
| 4 | ¿Qué buscas esta semana? | ¿Hay algo para mí? |
| 5 | Qué es Sunny | ¿Quién está detrás? |
| 6 | Cómo funciona | ¿Cómo le hago? |
| 7 | Comunidad | ¿Con quién voy a estar? |
| 8 | Originals | ¿Qué tiene esto que no tenga otro? |
| 9 | Categorías | ¿De qué tipo hay? |
| 10 | Espacios aliados | ¿Son lugares serios? |
| 11 | Pase semanal | ¿Cuánto cuesta? |
| 12 | Para negocios | (para el otro público) |
| 13 | Preguntas frecuentes | Las dudas que quedan |
| 14 | Cierre | Ya, decide |

Dos criterios más, por si profundiza:

- **Lo real va antes que lo explicativo.** Las experiencias de la semana están
  arriba, antes de «cómo funciona». Primero se ve que hay algo que vale la
  pena; después se explica el mecanismo.
- **Las secciones que no tienen contenido no aparecen.** Si no hay ninguna
  experiencia marcada como Original, esa sección no se dibuja. El sitio nunca
  enseña una caja vacía.

---

# 5. Lo que NO está listo, y cómo decirlo

**Dilo tú antes de que lo descubra ella.** Un problema que tú anuncias es un
plan; el mismo problema descubierto por el cliente es una falla.

### 5.1 Los correos todavía no salen — es lo único bloqueante

Hoy el sistema solo puede mandar correos a mi dirección de prueba. Para
mandarlos a nombre de Sunny hace falta **verificar un dominio** (algo como
`hola@sunnyproject.mx`).

> «Los correos de confirmación ya están escritos y funcionando, pero necesito
> que definamos el dominio del proyecto para poder mandarlos a tu nombre. Es
> un trámite de un día, y es lo único que separa esto de poder abrirlo a
> gente real.»

**Es lo más importante que necesitas de ella hoy.**

### 5.2 Reservar para acompañantes

Está diseñado y programado, pero **no activado**. Hoy cada persona aparta un
solo lugar.

> «Poder llevar a alguien está listo para activarse, pero quiero probarlo en
> un ambiente aparte antes de encenderlo, porque toca el cupo de las
> experiencias y no quiero arriesgar una sobreventa.»

### 5.3 Las fotos

Todas son de banco y ninguna es de Monterrey.

> «Las fotos son de referencia para que veas cómo se siente. Con fotos reales
> de tus espacios esto sube un escalón entero, y no hay que tocar nada del
> diseño — es cambiar los archivos.»

**Pídele fotos.** Es lo segundo más valioso que puedes salir pidiendo.

### 5.4 Si pregunta por pagos

No hay pagos. El pase es gratuito por diseño. Si algún día se cobra, es otra
conversación y otro desarrollo.

---

# 6. Preguntas que te va a hacer, con respuesta

**«¿Ya se puede usar?»**
> Técnicamente sí: el sitio está en línea y funciona. Falta el correo con
> dominio propio para poder abrirlo a gente real.

**«¿Cómo entro a mi panel?»**
> Pones tu correo, te llega un enlace, das click y entras. Sin contraseña que
> recordar ni que perder.

**«¿Y si alguien más entra al panel?»**
> No puede. El permiso se verifica en el servidor en cada carga, no
> escondiendo el botón. Aunque escriba la dirección exacta, lo saca.

**«¿Cuántos lugares puedo poner?»**
> Los que quieras, por experiencia. El sitio lleva la cuenta solo y cierra
> cuando se llena.

**«¿Puedo cambiar los textos?»**
> Los de las experiencias y los negocios, sí, desde tu panel. Los textos fijos
> del sitio los cambio yo — dime cuáles y los ajusto.

**«¿Funciona en celular?»**
> Sí, y está probado en seis anchos distintos. *(Enséñaselo en tu teléfono.
> Vale más que decirlo.)*

**«¿Cuándo está listo?»**
> Depende de tres cosas tuyas: el dominio, las fotos y los negocios reales.
> Con eso, es cuestión de días, no de meses.

---

# 7. Con qué tienes que salir de la junta

Escríbelo al final delante de ella:

1. **El dominio.** ¿Cuál va a ser? Sin esto no hay correos.
2. **Fotos reales.** De sus espacios aliados.
3. **Los primeros negocios de verdad.** Nombres y contactos.
4. **Qué hacer con el contenido de demostración.** ¿Se borra o se marca?
5. **Su visto bueno del panel.** ¿Le falta algo para operar sola?

---

# 8. Chuleta de un vistazo

- **La frase:** un pase gratis cada semana para probar algo local, acompañada.
- **Tres usuarios:** quien busca plan · el negocio aliado · Emmy.
- **El pase:** 1 por semana, lunes a domingo, gratis, no se acumula, se cancela
  hasta 12 h antes.
- **Sin contraseñas:** enlace por correo.
- **El panel:** 6 pantallas, Emmy opera sola.
- **Lo bloqueante:** el dominio para los correos.
- **Lo que pides:** dominio, fotos, negocios reales.

**Lo único que no debes prometer hoy:** fecha de lanzamiento, reservas para
acompañantes, y que los correos ya funcionan.
