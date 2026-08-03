# Análisis de la llamada con Emmy — 31 jul 2026

Duración 1:22. Primera demo. Resultado: **aprobada en dirección.** «Sí está
alineado», «me pareció súper bien».

Este documento tiene tres partes: qué comprometiste, qué dijiste que todavía no
es verdad, y qué hay que construir y en qué orden.

---

# 1. Lo que comprometiste, con fecha

| Compromiso | Cuándo dijiste | Estado |
|---|---|---|
| **Video de cómo se ve en celular** | «en el día» (hoy, viernes) | Pendiente |
| **Link navegable para que ella entre sola** | «ya para esta semana» | **Bloqueado — ver §2.1** |
| **Cotización** | «para el día lunes» | Pendiente |
| Junta de grabación | lunes 10:00 | Agendada |

El video del celular es lo más barato de los cuatro y ya tienes la captura.
Mándalo hoy: cumple un compromiso sin costo y compra tiempo para el resto.

---

# 2. Tres cosas que dijiste y que el código todavía no sostiene

Esto es lo más importante del documento. No es para regañarte — es para que no
te agarre desprevenido el lunes.

## 2.1 «Puede invitar amigos, hasta tres pases» — NO EXISTE

Minuto 17:11. Se lo dijiste como si ya funcionara.

La realidad: el código de acompañantes **está escrito pero no activado**. La
migración `20260201000100_group_reservations` nunca se aplicó. Hoy cada persona
aparta **un solo lugar, para sí misma**.

Y no es un detalle: Emmy construyó encima de esa idea toda la conversación de
comunidad e invitaciones. Si entra al link y no puede invitar a nadie, lo va a
notar.

**Dos salidas, elige una:**
- **Activarlo** antes de mandarle el link. Requiere aplicar la migración en un
  entorno aislado y correr las pruebas de concurrencia. Es medio día de trabajo
  bien hecho.
- **Corregirlo el lunes** en una frase: *«Emmy, lo de invitar amigos está
  programado pero lo voy a encender la próxima semana, quiero probarlo aparte
  porque toca el cupo.»*

Lo que no puedes es dejarlo así y esperar que no se note.

## 2.2 «Un pase por semana» — es una regla de base de datos, no un texto

Tú propusiste 2–3 por semana. Emmy dijo ~4 al mes. Después dijiste «sin límite
durante el MVP». Los tres son razonables, pero **ninguno está implementado**: el
límite de 1 por semana vive en la base de datos, atado a la semana calendario
(lunes a domingo, `week_start`).

Cambiarlo no es editar un número en la pantalla. Es cambiar la restricción de la
base, la lógica de reclamo, y los textos de los diez estados del botón.

**Necesito que decidas el número antes de que lo construya.** Mi recomendación,
y te explico por qué: **sin límite durante el lanzamiento, con fecha de fin
visible en la página.** Es lo que tú mismo propusiste y es lo correcto — en un
MVP el problema no es que la gente reserve de más, es que nadie reserve. El
límite se pone cuando haya demanda, y para entonces ya sabrás cuál es el número.

## 2.3 El negocio NO recibe nada cuando alguien reserva

Minuto 28:53. Emmy: *«le va a poder salir al estudio también, un correo ya con
la base de datos de ese nuevo posible cliente, ¿verdad?»* Tú: *«Exacto.»*

No existe. Hoy hay cuatro correos y ninguno va al negocio:

| Correo | Va a |
|---|---|
| Pase confirmado | la persona |
| Pase cancelado | la persona |
| Experiencia cancelada | la persona |
| Nueva solicitud de negocio | Emmy |

**Falta el quinto: aviso al negocio con el folio y los datos de quien va.** Y no
es un extra decorativo — para el estudio, ese correo *es el producto*. Es lo que
convierte «di cupos gratis» en «conseguí prospectos».

Es de las cosas más baratas de construir que más valor entregan. Yo lo pondría
antes que cualquier función nueva.

---

# 3. Otras dos cosas que hay que corregir

## 3.1 La marca está mal escrita en 39 lugares

Emmy fue explícita: la marca es **The Sunny Project** (antes Feel Good Hub, que
no pudo registrar). El sitio dice «Sunny Project» en 39 sitios del código.

Es una corrección de diez minutos y es de las que más se notan.

## 3.2 La foto pixeleada — la dijiste tú en voz alta

Minuto 26:53: *«esta imagen se ve súper pixeleada, se ve mal».*

Ya lo sabíamos: **no hay ni una fotografía horizontal en el proyecto**, todas
son verticales de 736 px y el fondo las amplía 2,6 veces.

**Y en la misma llamada, Emmy te dio la solución sin que se lo pidieras:**
minuto 53:36, *«tengo fotos de clases que sí hemos dado y podemos poner algo de
eso… hice hasta un run en calzada».* Le dijiste «pásamelas» y la conversación
siguió.

**Pídeselas hoy, por escrito.** Es la mejora visual más grande disponible y no
cuesta una línea de código.

---

# 4. Lo nuevo que salió de la junta

Ordenado por lo que yo construiría primero.

### 4.1 «Lleva The Sunny Project a tu institución» — ALTO, y es fácil

Minuto 51:33. Empresas y escuelas ya le están preguntando si hace experiencias.
Emmy lo describió ella misma como *«algo muy sencillo… que haya ese espacio»*: un
apartado, un formulario, y fotos de clases pasadas.

Es **demanda que ya existe y que hoy no tiene dónde aterrizar.** De todo lo que
se habló, es lo que más rápido puede generar dinero real.

Reusa el formulario de «Para negocios» con otro destinatario y otro texto.

### 4.2 El periodo de lanzamiento gratuito con fecha visible — ALTO

Acordaron: 2–3 semanas gratis, mensaje explícito en la página, y después
suscripción. Emmy dijo sí.

Lo que hay que construir es pequeño y hay que hacerlo **antes** de abrir, no
después: una banda en el sitio que diga *«hasta el [fecha], pases sin costo. A
partir de esa fecha, suscripción»*. Si la gente entra creyendo que es gratis
para siempre, cobrar después se siente como un engaño.

### 4.3 El formulario que llena el negocio — MEDIO, alto valor para Emmy

Minuto 41:17. Cuando Emmy aprueba una solicitud, que el sistema le mande al
negocio un formulario donde **ellos** llenen título, categoría, descripción,
dirección, cupos, fecha, requisitos. Hoy todo eso lo teclea Emmy.

Emmy: *«sí, mejor»*. Es el tipo de función que hace que no te dejen de pagar el
mantenimiento.

### 4.4 Ebook como incentivo para crear cuenta — MEDIO

Tú lo propusiste, a Emmy le gustó. Ella tiene dos ebooks (*75 days to feel good*
y uno nuevo, *cómo divertirte mientras construyes*).

Ojo con una objeción que ella misma puso y que tiene razón: *«es que tiene que
iniciar sesión para tener las clases gratis»*. Durante el lanzamiento gratuito,
el incentivo ya es la clase. **El ebook sirve mejor cuando arranque la
suscripción**, como parte del paquete. No lo construyas todavía.

### 4.5 Suscripción, puntos y comunidad — FUTURO, no lo toques ahora

Es el modelo de negocio real y quedó bien conversado: suscripción mensual
($200–400), comunidad cerrada, dos experiencias al mes con Emmy, y puntos por
invitar y compartir — que según ella es lo que la diferencia de Wellhub
(*«esa aplicación está muy fría»*).

**No construyas nada de esto todavía.** Emmy misma lo dijo mejor que nadie:
*«siempre pasa en este tipo de proyectos que lo que menos te imaginas es lo que
empieza a funcionar»*. Cotízalo como fase 2 y decide con datos.

---

# 5. Plan de trabajo corto plazo

## Hoy, viernes

1. **Manda el video del celular.** Compromiso adquirido, cuesta cero.
2. **Pídele las fotos por escrito.** De clases pasadas y del run en calzada.
3. **Pregúntale el dominio.** Sin esto no hay correos y sin correos ella no
   puede entrar al link que le prometiste.

## Sábado y domingo — para que ella tenga el link

| Orden | Qué | Por qué primero |
|---|---|---|
| 1 | **Verificar dominio en Resend** | Sin esto ella no puede ni iniciar sesión |
| 2 | **Publicar el hero nuevo** | Lo que ella ya vio pixeleado |
| 3 | **Cambiar a «The Sunny Project»** | 39 lugares, diez minutos |
| 4 | **Meter sus fotos reales** | Si ya te las mandó |
| 5 | **Decidir y aplicar el límite de pases** | Ella va a probar reservar |
| 6 | **Correo al negocio con el folio** | Se lo prometiste explícitamente |

Con eso el link es defendible. Sin el punto 1, no mandes nada: un link donde no
puede entrar es peor que no mandarlo.

## Lunes, antes de la junta

7. **La cotización.** Comprometida.
8. **Corregir lo de acompañantes** si no alcanzaste a activarlo.

## Después

9. «Lleva The Sunny Project a tu institución»
10. Banda del periodo de lanzamiento con fecha
11. Formulario que llena el negocio
12. Fase 2: suscripción, comunidad, puntos, ebooks

---

# 6. Lo que necesitas de Emmy, en un solo mensaje

Mándaselo hoy tal cual:

> Emmy, quedé de mandarte el link esta semana. Para que puedas entrar y navegarlo
> bien necesito tres cosas de tu lado:
>
> 1. **El dominio** que vamos a usar para los correos (algo tipo
>    hola@thesunnyproject.mx). Sin dominio propio el sistema no puede mandarte
>    el enlace de acceso.
> 2. **Las fotos** de las clases que ya diste y la del run en calzada. Las de
>    ahorita son de referencia y se ven pixeleadas, con las tuyas cambia por
>    completo.
> 3. **Cuántos pases quieres por persona** durante el lanzamiento. Mi
>    recomendación es sin límite las primeras semanas y ya poner tope cuando
>    haya demanda.
>
> Con eso te lo dejo listo para que lo pruebes tú misma.

---

# 7. Dos cosas que hiciste bien y conviene repetir

**Enmarcaste la demo antes de enseñarla.** «Es un primer boceto, tiene muchas
cosas que mejorar». Eso hizo que cada defecto que apareció se leyera como
trabajo en curso y no como falla.

**Señalaste tú el problema de la foto antes que ella.** Eso es exactamente lo
correcto y hay que seguir haciéndolo. El problema que anuncias es un plan; el
que descubre el cliente es una falla.

Una sola cosa a corregir: **no describas como existente lo que está a medias.**
Lo de los tres pases fue eso. Cuando algo esté programado pero apagado, la
frase es «está listo para encenderse», no «se puede».
