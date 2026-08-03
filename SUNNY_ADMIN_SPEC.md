# Sunny — Especificación del panel de Emmy

Referencia técnica del panel. La versión para Emmy, sin jerga, es `SUNNY_EMMY_ADMIN_GUIDE.md`.

---

## 1. Principio

El panel es tan importante como la página pública, pero **no** comparte su personalidad. Comparte tokens (color, tipografía, radios, botones, badges) y difiere deliberadamente en: sin fotografía decorativa, sin animación de entrada, densidad mayor (`text-small` como cuerpo), fondo plano `neutral-100`, y tablas que se convierten en tarjetas por debajo de `sm:`.

Objetivo operativo: **Emmy administra la oferta diaria sin editar código y sin depender del desarrollador.**

---

## 2. Rutas

| Ruta | Función |
|---|---|
| `/admin` | Dashboard |
| `/admin/experiencias` | Lista + acciones, 8 filtros de estado |
| `/admin/experiencias/nueva` | Crear |
| `/admin/experiencias/[id]` | Editar |
| `/admin/negocios` | Lista + activar/desactivar + aliado público |
| `/admin/negocios/nuevo`, `/admin/negocios/[id]` | Crear / editar |
| `/admin/reservaciones` | Lista paginada, 5 filtros, acciones, exportación |
| `/admin/solicitudes` | Pipeline + notas + conversión |
| `/admin/usuarios` | Consulta de solo lectura |

`/admin/configuracion` **no se creó**: no había nada que configurar que no viviera ya en variables de entorno o en el formulario de experiencia. Añadir una pantalla vacía habría sido alcance por alcance.

---

## 3. Autorización

Tres capas, en este orden:

1. **`proxy.ts`** — comprueba sesión y `profiles.role = 'admin'` **antes de renderizar** y responde `307` sin cuerpo. Esta es la capa que protege de verdad: `redirect()` en el layout **no** impide que el HTML se envíe en esta versión de Next (ver `SUNNY_DESIGN_QA_REPORT.md` §3.5). La consulta de rol solo corre en rutas `/admin`.
2. **`requireAdmin()` en el layout** — defensa en profundidad.
3. **RLS en Supabase** — `profiles_select_admin`, `reservations_select_admin`, `partner_leads_select_admin`, y `is_admin()` dentro de cada función `admin_*`. Incluso con una petición forjada, la base no devuelve nada.

Ocultar enlaces **no** se considera control de acceso en ningún punto.

Cubierto por `tests/unit/admin-gate.test.ts` (6 casos, incluido usuario con sesión que no es admin y perfil inexistente).

---

## 4. Dashboard

Responde las siete preguntas de §31 del brief, en este orden de prioridad:

1. **Cuál es la siguiente experiencia** — en prosa, con enlace, no como métrica.
2. **Qué necesita atención** — agotada · empieza en <48 h sin reservaciones · quedan ≤2 lugares · sigue en borrador con fecha futura. Se omite si no hay nada.
3. **Próximos 7 días** — tabla: experiencia, negocio, fecha, cupo, reservados, disponibles, grupos, estado.
4. **Totales** — próximas, cupos, lugares reservados, disponibles, reservas de la semana, asistencias/no-show.
5. **Solicitudes nuevas** — aviso al pie + contador en la navegación.

Deliberadamente **no** es una rejilla de diez métricas fijas: el brief lo descarta y el registro dinámico de experiencias es el punto.

**Ocupación se mide en personas**, vía `partySizeOf()`, así que el panel coincide con el sitio público y sigue siendo correcto después de la migración de grupos.

Ninguna métrica es inventada. No hay tasas de conversión, ni proyecciones, ni "engagement".

---

## 5. Estados de experiencia — derivados, no almacenados

Siete estados visibles: `draft` · `scheduled` · `published` · `sold_out` · `completed` · `cancelled` · `archived`.

La columna `status` de la base **no se migró** para contener siete valores. `scheduled` (apertura futura), `sold_out` (reservados ≥ cupo), `completed` (`ends_at` pasado) y `archived` (`archived_at` presente) son **derivables**, y calcularlos evita dos estados almacenados que podrían contradecir el dato del que se derivan. La derivación vive en `computeAdminState()`.

---

## 6. Acciones y sus reglas

| Acción | Regla |
|---|---|
| Publicar | Solo desde `draft` |
| Ocultar | Solo desde `published`; vuelve a `draft`, conserva reservaciones. Pide confirmación |
| Duplicar | Copia contenido y configuración; **no** reservaciones, folios, asistencia ni estadísticas. Queda en `draft`, `featured = false`, `archived_at = null`. **Desviación documentada**: la decisión 10 pide fechas vacías, imposible porque tres columnas de fecha son `NOT NULL`; la copia cae una semana después, siempre en el futuro, y el texto del botón lo advierte |
| Destacar | Alterna `featured` |
| Sunny Original | Alterna `is_original`. Oculto hasta que exista la columna |
| Archivar / Restaurar | Alterna `archived_at`. **Nunca borra.** Pide confirmación explicando que se conserva todo |
| Cancelar experiencia | `admin_cancel_experience()`: cancela la experiencia y todas sus reservaciones en una transacción, devolviendo el pase a cada persona |
| Activar negocio | Alterna `active` |
| Aliado público | Alterna `featured_as_partner`, **separado de `active`** (decisión 9) |
| Asistencia / no-show | `admin_set_attendance()`. Solo en confirmadas. Propaga a acompañantes |
| Cancelar reservación | `admin_cancel_reservation()`, sin la ventana de 12 h. Todo-o-nada en grupos |
| Estado de solicitud | Solo los valores que el CHECK vigente acepta (ver §8) |
| Convertir solicitud | Crea el negocio **inactivo**, conserva la solicitud como `converted` con `converted_business_id` |

**No existe ninguna acción de borrado en todo el panel.**

---

## 7. Rendimiento

| Antes | Ahora |
|---|---|
| Reservaciones cargaba **todas** las filas históricas en cada petición | Paginado, 50 por página, con `count: exact` |
| Correos: recorría **toda** la tabla `auth.users` en páginas de 1000 en cada petición para llenar una columna | Solo los usuarios de la página actual, en lotes de 10 |
| Estado y experiencia se filtraban en memoria | Se filtran en la consulta (columnas indexadas) |
| Estadísticas por experiencia | Una pasada sobre las reservaciones ya obtenidas, no una consulta por experiencia |

El contador de solicitudes de la navegación usa `head: true` (cuenta sin traer filas).

---

## 8. Compatibilidad con las migraciones pendientes

Ningún control que dependa de una columna inexistente se muestra roto. La existencia se detecta por **forma de la fila** (`"archived_at" in experience`), no por adivinanza:

| Columna ausente | Efecto en el panel |
|---|---|
| `archived_at`, `is_original` | Botones *Archivar* y *Sunny Original* **no se renderizan**, con una nota explicando por qué |
| `featured_as_partner` | Botón *Mostrar como aliado* oculto, con nota |
| `internal_notes` | Campo de notas oculto; `meeting` y `converted` **no se ofrecen** en el selector de estado, porque el CHECK vigente los rechazaría |
| `party_size`, `reservation_companions` | Ocupación cuenta 1 por reservación; lista de acompañantes vacía; el filtro individual/grupo sigue funcionando |

El criterio: **antes ocultar un control que ofrecer uno que falla al hacer clic.**

---

## 9. Responsive

| Ancho | Comportamiento |
|---|---|
| < 640 | Todo en tarjetas apiladas. Navegación en fila desplazable horizontal |
| 640–1023 | Tablas con scroll horizontal propio |
| ≥ 1024 | Sidebar fijo (`sticky`), tablas completas |

Verificado a 390 y 1440 en capturas (`SUNNY_DESIGN_QA_REPORT.md` §2, capturas 20–27). Sin scroll horizontal accidental en ninguna ruta del panel.

---

## 10. Accesibilidad

Sección activa con `aria-current="page"` además del color · botones semánticos · `aria-pressed` en los alternadores · `aria-busy` durante la acción · `aria-live` en los contadores de resultados · `<th scope="col">` en las tablas · confirmación por `window.confirm` en acciones que cambian lo que se ve · estados vacíos con icono **y** texto (nunca solo un icono).
