# HANDOFF — The Sunny Project

Documento de traspaso. Escrito para que alguien que nunca ha visto este proyecto
entienda qué es, en qué estado está y qué falta, **sin necesidad de abrir el
código**.

Última actualización: 3 de agosto de 2026.

> Este documento **no contiene contraseñas, llaves ni valores de variables de
> entorno.** Solo nombra dónde viven. Quien reciba el proyecto necesita que se
> le den los accesos por separado.

---

# 1. Qué es y para quién

**Cliente:** Emmy Elizondo. Fundadora de **The Sunny Project** (Monterrey, N.L.).

**El negocio.** The Sunny Project es un ecosistema de bienestar con tres patas:

1. **Puntos físicos de bienestar** — espacios donde vende snacks funcionales e
   hidratación. Es el negocio original (antes se llamaba *Feel Good Hub*; el
   nombre cambió porque no se pudo registrar).
2. **Esta plataforma** — experiencias locales con pase gratuito.
3. **La marca personal de Emmy** — contenido y comunidad, que es el motor que
   alimenta a las otras dos.

**Qué hace esta plataforma.** Negocios locales de Monterrey —estudios de yoga,
pilates, hyrox, cafeterías, clubes de running— ceden cupos gratuitos en sus
clases. Los usuarios reclaman esos cupos con un pase semanal. Emmy administra
todo desde un panel propio.

La promesa comercial en una frase: **cada semana tienes un pase gratuito para
probar algo local, y lo vives acompañado.**

**Referentes que la clienta menciona:** ClassPass y Wellhub. Su diferenciador
declarado es la comunidad — dice que esas plataformas «están muy frías».

**Público:** general, pero la clienta lo enfoca sobre todo a **estudiantes** y
gente joven que quiere conocer gente y crecer.

---

# 2. Objetivo de la página

**No es una página de leads ni de ventas directas.** Tiene tres objetivos, en
este orden:

### 2.1 Objetivo principal — Registro y activación

Que una persona entre, cree cuenta y **reclame un pase**. La conversión que
importa es la reservación completada, no el formulario enviado.

El embudo es: *ver una experiencia → crear cuenta con su correo → apartar lugar
→ recibir folio → asistir*.

### 2.2 Objetivo secundario — Captación de negocios aliados

Que un estudio interesado deje sus datos desde el sitio. Esas solicitudes caen
en la bandeja del panel de Emmy, que decide a quién aprobar.

Es un objetivo de leads clásico, y es **la oferta la que hace el trabajo**: el
negocio recibe prospectos nuevos a cambio de ceder cupos.

### 2.3 Objetivo terciario — Experiencias corporativas *(pendiente de construir)*

Empresas y escuelas ya le preguntan a Emmy si organiza experiencias de bienestar
para sus equipos. Hoy **no hay dónde aterrizar esa demanda** en el sitio. Es la
sección pendiente con más potencial de ingreso directo.

### 2.4 Monetización

**Hoy no hay cobro.** El pase es gratuito por diseño.

El plan acordado con la clienta: arrancar gratis unas semanas para conseguir
usuarios y después pasar a **suscripción mensual** (rango que ella maneja:
$200–400 MXN), donde el suscriptor obtiene más pases, comunidad privada y
experiencias directas con Emmy. **Nada de esto está construido.**

---

# 3. Stack y dónde vive

| | |
|---|---|
| **Framework** | Next.js 16 (App Router, componentes de servidor, Turbopack) |
| **Lenguaje** | TypeScript, modo estricto |
| **Estilos** | Tailwind CSS v4, con sistema de tokens propio |
| **Base de datos / cuentas / archivos** | Supabase (PostgreSQL, Auth, Storage) |
| **Correo** | Resend, con plantillas en React Email |
| **Animación** | Motion (antes Framer Motion) + Lenis para el scroll suave |
| **Pruebas** | Vitest, Playwright y axe-core |
| **Alojamiento** | Vercel |

**Repositorio:** `github.com/rubendrt42-eng/SunnyProject`

**Producción:** `sunny-project-teal.vercel.app`
Es un dominio temporal de Vercel. **No hay dominio propio todavía** — ver §6.

## 3.1 Advertencia sobre las ramas

El repositorio tiene **tres ramas activas y desalineadas**. Es la primera trampa
para quien llegue:

| Rama | Qué es |
|---|---|
| `claude/sunny-project-mvp-i5f1ey` | Rama **por defecto** en GitHub |
| `claude/sunny-mvp-1-1-design-admin` | Rama que **Vercel usa para producción** |
| `claude/sunny-motion-choreography` | Rama de trabajo **más reciente** |

Consecuencia práctica: **mergear un pull request a la rama por defecto no
publica nada**, porque Vercel despliega desde otra. Hay un pull request abierto
(#1) con el trabajo más reciente sin publicar.

**Lo primero que debería hacer quien reciba esto es unificar las tres ramas.**

---

# 4. Lo que ya está construido

## 4.1 Sitio público — 13 páginas

| Ruta | Qué hace |
|---|---|
| `/` | Portada. 13 secciones (ver §4.2) |
| `/experiencias` | Catálogo con filtros por categoría y buscador, sincronizados a la URL |
| `/experiencias/[slug]` | Ficha completa: fotos, requisitos, restricciones, mapa, botón de reservar |
| `/como-funciona` | Explicación del pase semanal en tres pasos |
| `/para-negocios` | Página de captación de aliados, con formulario |
| `/preguntas-frecuentes` | Acordeón de dudas |
| `/acceso` | Entrada por correo, sin contraseña |
| `/mi-pase` | El pase activo con su folio, datos del lugar y enlace a mapas |
| `/mi-cuenta` | Perfil y consentimientos |
| `/historial` | Experiencias pasadas |
| `/privacidad`, `/terminos` | Legales |

## 4.2 Secciones de la portada, en orden

1. Hero — fotografía a pantalla completa con la promesa y datos reales
2. Cinta de experiencias en movimiento
3. **Esta semana en Sunny** — las experiencias disponibles *(el corazón)*
4. Selector por intención — «¿qué buscas esta semana?»
5. Qué es Sunny Project — presentación de Emmy
6. Cómo funciona — narrativa de tres pasos
7. Comunidad
8. Sunny Originals — experiencias propias *(solo aparece si existe alguna)*
9. Categorías
10. Espacios aliados *(solo aparece si hay negocios marcados como visibles)*
11. Pase semanal — cambia según si tienes sesión y si ya reservaste
12. Para negocios — abre el formulario en ventana
13. Preguntas frecuentes + cierre

Las secciones sin contenido **no se dibujan**: el sitio nunca muestra una caja
vacía.

## 4.3 Funcionalidades

**Cuentas de usuario.** Acceso por enlace enviado al correo, sin contraseñas.
Implementado con doble mecanismo para que el enlace funcione también cuando se
abre desde el navegador integrado de Gmail o WhatsApp — un fallo real que costó
tiempo diagnosticar y que ya está resuelto.

**Reservaciones.** Un pase por semana calendario (lunes a domingo, horario de
Monterrey), que se renueva solo y no se acumula. El cupo baja en tiempo real y
se cierra al llenarse. Se genera un folio. Se puede cancelar hasta 12 horas
antes. El botón de reservar tiene **diez estados distintos** según sesión,
disponibilidad, perfil completo y si ya se usó el pase.

**Panel de administración** (`/admin`, 6 pantallas):

| Pantalla | Qué permite |
|---|---|
| Resumen | Lo que pasa hoy, de un vistazo |
| Experiencias | Crear, editar, publicar, ocultar, duplicar, archivar, destacar. Con subida de imagen |
| Reservaciones | Ver quién asiste, marcar asistencia o no-show, cancelar, reenviar correo, exportar a CSV |
| Negocios | Alta y edición, activar/desactivar, mostrar como aliado público |
| Solicitudes | Bandeja de negocios que quieren entrar |
| Usuarios | Consulta de registrados |

Todas con búsqueda y paginación.

**Seguridad.** El acceso al panel se verifica **en el servidor en cada carga**,
no escondiendo botones. Además la base de datos tiene seguridad a nivel de fila:
aunque alguien forjara una petición, la base rechaza la lectura.

**Correos automáticos.** Cuatro plantillas: pase confirmado, pase cancelado,
experiencia cancelada, y aviso a Emmy de nueva solicitud de negocio.

**Base de datos.** 6 tablas: perfiles, negocios, experiencias, reservaciones,
acompañantes de reservación, y solicitudes de negocio. 14 migraciones
versionadas.

## 4.4 Calidad verificada

| Comprobación | Resultado |
|---|---|
| Pruebas automatizadas | **119 pasan** |
| Accesibilidad (axe-core, WCAG 2.1 AA) | **0 hallazgos** en 6 rutas × 2 anchos |
| Scroll horizontal | **0 fallos** en 30 combinaciones (5 rutas × 6 anchos) |
| Peso de la portada | 1.5 MB, carga completa en 1.4 s |
| Compuertas | lint, typecheck y build en verde |

---

# 5. Lo que falta

## 5.1 Bloqueante para abrir al público

**Los correos no llegan a nadie.** El remitente no tiene dominio verificado, así
que Resend solo entrega a la cuenta dueña. **Ni Emmy ni ningún usuario
recibirían nada.** Es lo único que impide lanzar.

**Todo el contenido es de demostración.** 6 experiencias y 6 negocios
inventados. Hay que decidir si se vacía o se marca.

**Las fotografías no están autorizadas para producción.** Son imágenes de banco
guardadas de contenido publicado por otras marcas — 13 de ellas de 736 px de
ancho, el ancho canónico de Pinterest. Está documentado en
`SUNNY_ASSET_MANIFEST.md`. **Riesgo legal real si se publica así.** El contrato
debe fijar que la clienta entrega fotografía propia.

## 5.2 Prometido a la clienta y todavía sin existir

- **Aviso automático al negocio** con el folio y los datos de quién asiste. Se
  le dijo que sí en la revisión. Para el aliado, ese correo *es* el producto.
- **Reservar con acompañantes.** Está programado pero la migración nunca se
  aplicó. Hoy cada persona aparta un solo lugar.
- **Definir el límite de pases.** Sigue en 1 por semana. Cambiarlo toca la
  restricción de base de datos, la lógica de reclamo y los diez estados del
  botón.
- **Sección de comunidad.**
- **Canal de experiencias corporativas** (§2.3).

## 5.3 Huecos de marca

- El sitio dice **«Sunny Project»**; la marca es **«The Sunny Project»**.
  39 ocurrencias en el código.
- **Los puntos físicos de bienestar no aparecen en ninguna parte del sitio**,
  aunque son parte central del ecosistema y del plan de enlaces de la clienta.

## 5.4 Deuda técnica

**4 de 14 migraciones sin aplicar.** El sitio funciona porque las consultas son
defensivas, pero implica que:

1. No hay reservaciones con acompañantes.
2. **La garantía de no-sobreventa bajo concurrencia no está demostrada.** Si dos
   personas toman el último lugar en el mismo instante, no está probado que el
   sistema lo impida. Requiere un entorno de prueba aislado — **no la base que
   se está usando**.
3. El interruptor para marcar contenido de demostración no existe; depende del
   sufijo del título.

**La portada mide 13.9 pantallas en escritorio y 17.8 en móvil**, con 13
secciones y 14 encabezados compitiendo. Casi cuatro veces el catálogo. En la
práctica, todo lo que va después de la sexta sección no lo ve quien entra desde
el teléfono.

**Las tres ramas desalineadas** (§3.1).

---

# 6. Integraciones

| Servicio | Para qué | Estado |
|---|---|---|
| **Vercel** | Alojamiento y despliegue | Activo. Dominio temporal `.vercel.app` |
| **Supabase** | Base de datos, cuentas, archivos | Activo |
| **Resend** | Correos transaccionales | Conectado por SMTP. **Sin dominio verificado** |
| **Dominio propio** | — | **No existe.** Es la decisión pendiente más urgente |
| **Analítica / pixel** | — | **NO HAY NINGUNA.** Ver abajo |
| **CRM** | — | No hay. Las solicitudes de negocio viven en la base de datos y se ven en el panel |

## 6.1 No hay analítica instalada — conviene saberlo

Lo verifiqué: **no hay Google Analytics, ni Tag Manager, ni pixel de Meta, ni
Vercel Analytics, ni nada.**

Para un producto cuyo objetivo es registro y activación, eso significa que hoy
**no se puede medir nada**: ni cuánta gente entra, ni dónde abandona el embudo,
ni qué experiencias se ven más. Y la clienta planea mandar tráfico desde
Instagram.

Instalar analítica antes del lanzamiento es barato y, sin ello, el lanzamiento
no va a enseñar nada.

## 6.2 Formularios

Dos formularios públicos, ambos escriben directo a la base de datos —**no pasan
por ningún servicio externo**:

- **Solicitud de negocio** (`/para-negocios` y ventana en la portada) → tabla de
  solicitudes → bandeja del panel + correo a Emmy.
- **Acceso** (`/acceso`) → dispara el enlace de entrada por correo.

Nota: el formulario de negocios **no tiene límite de frecuencia ni captcha**. Es
intencional para no poner fricción, pero a escala alguien podría llenar la tabla
con un script.

## 6.3 Variables de entorno

El proyecto espera siete. **Aquí solo van los nombres; los valores se entregan
por separado:**

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
ADMIN_EMAIL
```

`ADMIN_EMAIL` define quién obtiene rol de administrador automáticamente al
entrar. Las que empiezan con `NEXT_PUBLIC_` son visibles en el navegador por
diseño; las otras tres **nunca deben salir del servidor**.

---

# 7. Esfuerzo invertido

**Calendario:** 26 de julio – 3 de agosto de 2026 (9 días), 36 commits.

**Estimación de horas.** Esto es una reconstrucción a partir del alcance
entregado, **no un registro de tiempo llevado durante el trabajo**. Tómese como
orden de magnitud:

| Área | Horas aprox. |
|---|---|
| Sistema de diseño y componentes base | 20 |
| Sitio público (13 páginas, 13 secciones de portada) | 45 |
| Cuentas y autenticación | 20 |
| Base de datos, migraciones y seguridad por fila | 30 |
| Reservaciones (cupo, folio, cancelación, estados) | 25 |
| Panel de administración (6 pantallas) | 40 |
| Correos transaccionales | 10 |
| Pruebas, accesibilidad y responsive | 20 |
| **Total construido** | **≈ 210 h** |
| Pendiente para abrir al público (§5) | ≈ 75 h |

**Tamaño del código:** 16,701 líneas propias · 21 pantallas · 65 componentes ·
9 endpoints de API · 6 tablas · 119 pruebas.

---

# 8. Si recibes este proyecto, haz esto primero

1. **Unifica las tres ramas** (§3.1). Todo lo demás es más difícil hasta que
   esto esté resuelto.
2. **Verifica un dominio** y cambia el remitente. Sin esto no hay producto.
3. **Instala analítica** antes de abrir. Un lanzamiento sin medición se
   desperdicia.
4. **Aplica las cuatro migraciones pendientes** en un entorno aislado, con las
   pruebas de concurrencia documentadas en `SUNNY_COMPANIONS_MIGRATION_PLAN.md`.
5. **Sustituye la fotografía** antes de publicar, por el riesgo legal.

## Documentación complementaria en el repositorio

| Documento | Para qué |
|---|---|
| `SUNNY_EMMY_ADMIN_GUIDE.md` | Manual del panel, escrito para la clienta |
| `SUNNY_COMPANIONS_MIGRATION_PLAN.md` | Cómo aplicar la migración riesgosa, con 20 pruebas |
| `SUNNY_DIAGNOSTICO_03AGO.md` | Diagnóstico más reciente, con mediciones |
| `SUNNY_ANALISIS_LLAMADA_31JUL.md` | Qué pidió la clienta en la primera revisión |
| `SUNNY_MOTION_SYSTEM_1_0.md` | Sistema de animación y sus reglas |
| `SUNNY_ASSET_MANIFEST.md` | Origen y estado legal de cada fotografía |
| `DATA_FLOW.md` | Cómo viaja la información por el sistema |
| `PRODUCT_SPEC.md` | Especificación funcional original |
