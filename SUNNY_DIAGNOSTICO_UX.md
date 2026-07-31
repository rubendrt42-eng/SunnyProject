# Sunny — Diagnóstico de experiencia: usuario y panel de Emmy

## Cómo se hizo, y qué no pude comprobar

La parte **pública** está auditada en ejecución: build de producción, datos
cargados, medidas con Playwright y `axe-core`.

La parte del **panel** está auditada sobre el **código y capturas previas**, no
sobre una sesión nueva. Lo intenté y no pude: Chromium no sale a internet desde
este entorno —solo `curl`—, así que no puedo abrir el panel en producción; y al
simular la sesión contra el mock, el middleware la rechazaba. Es una limitación
de mi entorno, no un fallo del producto: el panel real ya está verificado por
otra vía (`/admin`, `/admin/experiencias` y `/admin/reservaciones` responden 200
con sesión, comprobado con `curl` contra producción).

Lo señalo porque cambia la confianza de cada hallazgo: los del panel son
verificables leyendo el código, no «lo vi y se veía mal».

---

# Panel de Emmy

## 1. Cuatro de las seis páginas no paginan — ALTO a medio plazo

| Página | Paginación | Búsqueda | Exportar |
|---|---|---|---|
| Reservaciones | **sí** | sí | sí |
| Usuarios | no | sí | sí |
| Experiencias | **no** | **no** | no |
| Negocios | **no** | **no** | no |
| Solicitudes | **no** | **no** | no |

Hoy no molesta: hay 6 experiencias y 1 usuario. Pero esas páginas piden **todas
las filas** y las pintan de golpe. Con 200 experiencias acumuladas tras un año,
o 500 personas registradas, la página tarda y no hay forma de llegar a una fila
concreta salvo haciendo scroll.

`reservaciones` ya tiene el patrón resuelto (`ADMIN_PAGE_SIZE` + rango). Es
replicarlo.

## 2. Buscar es lo primero que Emmy va a querer — ALTO

Ligado a lo anterior pero peor: en `experiencias`, `negocios` y `solicitudes`
**no hay campo de búsqueda**. El caso real es «un negocio me escribió, ¿cuál era
su solicitud?» y hoy la única respuesta es recorrer la lista con la vista.

## 3. Cancelar una experiencia es grave y se confirma con un diálogo del navegador — ALTO

La acción cancela **todas** las reservaciones confirmadas y devuelve los pases.
La confirmación es un `window.confirm()` nativo con este texto:

> ¿Cancelar esta experiencia? Todas las reservaciones confirmadas se cancelarán
> y los usuarios recuperarán su pase.

Dos problemas. El diálogo nativo se descarta por costumbre sin leerlo, y **no
dice a cuánta gente afecta**. «Se cancelarán 8 reservaciones» pesa distinto que
una frase genérica.

Recomendación: diálogo propio, con el número real de personas afectadas, y el
botón destructivo separado del de cancelar el diálogo.

## 4. Tras una acción no hay confirmación visible — MEDIO

Las acciones llaman a `router.refresh()`: la fila cambia sola. Los botones se
deshabilitan mientras cargan, que está bien resuelto. Pero no hay ningún «listo»
ni «no se pudo». Con red lenta, Emmy no sabe si su clic hizo algo, y la respuesta
natural es volver a hacer clic.

## 5. Lo que está bien y conviene no tocar

- **12 estados vacíos** con `EmptyState`: icono, explicación y acción. Es más de
  lo que suele tener un panel a esta altura.
- **Móvil resuelto**: las dos páginas que usan `<table>` —resumen y usuarios—
  tienen su versión en tarjetas por debajo de `sm`. Las demás ya son listas.
- **La barrera de acceso es real**: vive en el middleware y devuelve 307 antes
  de renderizar nada. Verificado en producción.

---

# Sitio público

## 6. El ruido de «Demostración» ya está en producción — ALTO antes de abrir

El catálogo en vivo muestra badges de **Demostración**, y 6 componentes saben
pintarlos. Es correcto ahora mismo —los datos son de demostración y ocultarlo
sería mentir—, pero:

**no hay un interruptor**. Depende de que el título del registro contenga
`[Demostración]`. El día que Emmy cargue experiencias reales, el badge
desaparece porque el texto cambia, no porque alguien haya decidido nada.

Conviene una marca explícita en la base (`is_demo`) o, más simple, un repaso
antes de abrir para vaciar los datos de demostración.

## 7. Se pide completar el perfil en el peor momento — ALTO

El CTA contempla un estado `profile_incomplete`. En la práctica el recorrido de
alguien nuevo es:

> entra → encuentra una experiencia → pulsa reservar → **«completa tu perfil»**
> → llena nombre y consentimientos → vuelve → reserva

Se interrumpe justo en el momento de máxima intención, que es el peor sitio para
un formulario. Tú mismo lo viviste: entraste con rol admin y aun así no podías
reservar.

Alternativa: pedir el perfil **inmediatamente después del primer acceso**, con
el pase ya a la vista como recompensa. El mismo formulario, en el momento en que
la persona ya decidió entrar y todavía no ha elegido nada que perder.

## 8. Diez estados de CTA — bien pensado, conviene revisar los textos — MEDIO

`determineCta` distingue diez situaciones: `login`, `claimable`, `sold_out`,
`closed`, `cancelled`, `upcoming`, `completed`, `already_reserved`,
`pass_used_elsewhere`, `profile_incomplete`. Esa riqueza es un acierto: casi
ningún MVP distingue «agotada» de «cerrada» de «ya la reservaste».

Lo que hay que revisar es que cada etiqueta diga **qué hacer**, no solo qué pasa.
`pass_used_elsewhere` es el caso claro: la persona necesita saber que puede
cancelar la otra reservación para liberar el pase, y dónde.

## 9. El Home sigue midiendo 12.445 px — PENDIENTE, decisión tuya

Del diagnóstico de diseño anterior, sin resolver: 13 secciones y 14 `<h2>`
compitiendo, 3,7 veces el alto del catálogo. Requiere decidir qué secciones
sostienen la portada. Ahora que `/como-funciona` está a la altura, es el destino
natural de lo explicativo.

---

## Orden sugerido

**Antes de abrir a usuarios reales**
1. Decidir qué pasa con los datos de demostración (punto 6).
2. Mover la captura de perfil al primer acceso (punto 7).
3. Diálogo propio para cancelar experiencia, con el número de afectados (3).

**Cuando el volumen empiece a crecer**
4. Paginación y búsqueda en las cuatro páginas que no las tienen (1 y 2).
5. Confirmación visible tras cada acción del panel (4).

**Cuando quieras**
6. Repaso de los textos de CTA (8) y longitud del Home (9).

Los puntos 1, 2, 4, 5 y 8 son mecánicos. El 3 y el 7 cambian un flujo, y el 6 y
el 9 son decisiones de producto que no me corresponden.
