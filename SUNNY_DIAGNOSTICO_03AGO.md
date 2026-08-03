# Sunny — Diagnóstico completo

3 de agosto de 2026. Rama `claude/sunny-motion-choreography`.

Todo lo de aquí se midió hoy. Donde no pude comprobar algo, lo digo.

---

# 1. Estado general

| Capa | Resultado |
|---|---|
| Rutas públicas en producción | **10 de 10 responden**, la más lenta 3.2 s (la portada, en frío) |
| `/admin` sin sesión | **307** a `/acceso` — la barrera está en el servidor |
| lint · typecheck · pruebas · build | **Todo verde** · 119 pruebas pasan |
| Accesibilidad (axe-core, WCAG 2.1 AA) | **0 hallazgos** en 6 rutas × 2 anchos |
| Scroll horizontal | **0 fallos** en 30 combinaciones (5 rutas × 6 anchos) |
| Peso de la portada | 1.52 MB · 50 peticiones · carga completa 1.4 s |

**No hay nada roto.** El producto está en pie, es usable y es sólido en lo
básico. Lo que sigue son cosas por decidir, por publicar y por terminar.

---

# 2. Lo primero: producción está atrasada

**La rama tiene 8 commits que producción no está sirviendo.**

Lo comprobé pidiendo el HTML de producción: sigue devolviendo el hero anterior
(el de la foto en columna). Todo esto está hecho y no se ve:

| Commit | Qué trae |
|---|---|
| `869a470` | Hero a sangre completa — el que aprobaste |
| `c618e7b` | Coreografía del panel: señal al pulsar, sin saltos de fila |
| `fd5e359` | Sistema de movimiento unificado |
| `cffc92c` | QA de movimiento |
| +4 | Documentos |

**Es lo más barato y lo más visible que puedes hacer hoy.** Vercel → Settings →
Environments → Production → cambiar rama → Redeploy.

---

# 3. El problema de diseño más grande: la portada es larguísima

Medido hoy:

| | Alto | Equivale a |
|---|---|---|
| Portada, escritorio | **12,496 px** | **13.9 pantallas** |
| Portada, móvil | **15,052 px** | **17.8 pantallas** |
| Catálogo, escritorio | 3,310 px | 3.7 pantallas |

**La portada mide 3.8 veces el catálogo.** Tiene 13 secciones y 14 encabezados
`<h2>` compitiendo entre sí.

Nadie hace scroll 18 pantallas en un teléfono. En la práctica, todo lo que está
después de la sexta sección **no existe** para la mayoría de la gente — y ahí
viven el pase semanal, los aliados y el formulario de negocios.

No es un defecto técnico, es una decisión pendiente: **hay que elegir qué tres
o cuatro secciones sostienen la portada** y mover el resto a sus páginas. Es la
mejora de experiencia con más retorno que queda disponible.

---

# 4. Lo que está construido y funcionando

| Módulo | Estado |
|---|---|
| Autenticación sin contraseña | Doble flujo (PKCE + token_hash) — funciona desde el navegador de Gmail |
| Roles y permisos | Verificación en servidor en cada carga, más seguridad por fila en la base |
| Reservaciones | Pase semanal, control de cupo, folio, cancelación con ventana de 12 h |
| Catálogo | Filtros y búsqueda sincronizados a la URL, vista rápida, enlaces compartibles |
| Panel de administración | 6 pantallas, con búsqueda y paginación, y ahora con señal visible al pulsar |
| Correo | 4 plantillas transaccionales |
| Sistema de diseño | Tokens de color, tipografía, radio y movimiento, con pruebas que impiden que se deshaga |

---

# 5. Lo que falta, por gravedad

## 5.1 Bloqueantes para abrir a gente real

**Los correos no llegan a nadie más que a ti.** Sin dominio verificado, el
remitente solo entrega a la cuenta dueña. **Emmy no recibiría su enlace de
acceso, y ningún usuario recibiría su folio.** Es lo único que impide abrir.

> No pude verificar hoy el estado del dominio en Resend — la conexión con ese
> servicio no está disponible en esta sesión. Si ya lo verificaste, este punto
> se cae.

**Todo el contenido es de demostración.** 6 experiencias y 6 negocios
inventados. Hay que decidir si se vacía o se marca antes de abrir.

**Las fotografías no están autorizadas para producción.** Son imágenes de
referencia guardadas de contenido publicado por otras marcas. Riesgo legal real
si se lanza así.

## 5.2 Prometido a la clienta y todavía sin existir

**El negocio no recibe nada cuando alguien reserva.** Emmy lo pidió explícito y
se le dijo que sí. Hoy los 4 correos van a la persona o a Emmy; ninguno al
estudio. Para el aliado, ese correo *es* el producto.

**Reservar con acompañantes.** Se le dijo que se puede invitar hasta 3 personas.
Está programado pero **la migración nunca se aplicó**. Hoy cada quien aparta un
solo lugar.

**El límite de pases.** Se habló de 2, de 4 al mes y de sin límite. Sigue siendo
1 por semana, y es una regla de base de datos: cambiarlo toca la restricción, la
lógica de reclamo y los 10 estados del botón.

## 5.3 Huecos de marca

**El sitio dice «Sunny Project», la marca es «The Sunny Project».** 39 lugares.
Diez minutos de trabajo.

**Los puntos físicos de bienestar no aparecen en ninguna parte.** Lo verifiqué:
cero menciones en todo el código. Emmy explicó que son parte del ecosistema y su
plan de enlaces los va a incluir como destino. Quien llegue desde su Instagram
buscándolos, no encuentra nada.

## 5.4 Deuda técnica

**4 de 14 migraciones sin aplicar.** El sitio funciona igual porque los lectores
son defensivos, pero implica tres cosas:

1. No hay reservaciones con acompañantes.
2. **La garantía de no-sobreventa bajo concurrencia no está demostrada.** Si dos
   personas toman el último lugar en el mismo instante, no está probado que el
   sistema lo impida.
3. El interruptor para marcar contenido de demostración no existe; depende del
   sufijo del título.

Cuanto más se tarde, más difícil aplicarlas juntas. Necesita una rama de base de
datos o un proyecto de prueba — **no contra la base que estás usando.**

**La rama por defecto de GitHub y la de producción de Vercel apuntan a sitios
distintos.** Es una trampa para el siguiente que llegue al proyecto.

---

# 6. Rendimiento

| Métrica | Escritorio | Móvil |
|---|---|---|
| Peso total | 1.52 MB | 1.46 MB |
| Peticiones | 50 | 38 |
| DOM listo | 220 ms | 263 ms |
| Carga completa | 1.4 s | 1.2 s |
| Bundle de cliente | 1.5 MB | — |

**Está bien.** No es lo que hay que arreglar. Si algún día se optimiza, el
camino es acortar la portada (§3), no comprimir imágenes.

---

# 7. Qué haría, en orden

## Hoy
1. **Publicar la rama.** 8 commits hechos y sin ver.

## Esta semana
2. **Verificar el dominio** y cambiar el remitente. Sin esto no hay lanzamiento.
3. **Correo al negocio** con folio y datos del asistente.
4. **Renombrar a The Sunny Project.**
5. **Decidir el límite de pases** y aplicarlo.

## Antes de abrir al público
6. **Acortar la portada.** De 13 secciones a 5 o 6.
7. **Acompañantes** — aplicar la migración en entorno aislado, con las pruebas
   de concurrencia.
8. **Contenido y fotografía reales.**
9. **Puntos físicos de bienestar** en el sitio.

## Cuando haya volumen
10. Revocar permisos de ejecución a usuarios anónimos en las funciones de
    administración (defensa en profundidad, no es una puerta abierta).
11. Límite de frecuencia en el formulario de negocios.
12. Optimizar las políticas de seguridad por fila.

---

## Sobre el método

**Comprobado hoy en ejecución:** las 10 rutas de producción, qué versión sirve
producción, las cuatro compuertas del repositorio, accesibilidad con axe-core,
scroll horizontal en 30 combinaciones, altura y peso de las páginas, y el estado
de las migraciones en el repositorio.

**No comprobado hoy:** el estado del dominio en Resend y los avisos de seguridad
de la base de datos — las conexiones con esos dos servicios no están disponibles
en esta sesión. Tampoco el panel con una sesión real en pantalla: el navegador
de este entorno no sale a internet.
