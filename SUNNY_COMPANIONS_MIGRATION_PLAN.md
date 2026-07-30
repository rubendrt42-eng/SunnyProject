# Sunny — Plan de migración: reservaciones grupales y acompañantes

**Estado: preparada y probada en TypeScript. NO aplicada a ninguna base de datos.**

Este documento es la condición para aplicar `20260201000100_group_reservations.sql`. Léelo completo antes de ejecutar nada.

---

## 0. Por qué está detenida

La migración **reescribe cómo se protege el cupo**. Hoy `claim_reservation()` cuenta **filas**; después contará **personas**. Aplicarla a la base compartida sin probarla antes es exactamente el riesgo que el brief §28 pide evitar.

**Qué se verificó desde este entorno:**

- ✅ Sintaxis y contenido de los dos archivos SQL, revisados a mano.
- ✅ 31 pruebas de Vitest sobre el esquema de la petición, los lectores con `clamp`, y la aritmética de ocupación (`tests/unit/group-reservations.test.ts`).
- ✅ La aplicación compila y funciona **antes** de la migración (columnas ausentes → valores por defecto seguros).
- ❌ **No se ejecutó ninguna de las dos migraciones contra Postgres.** No hay Supabase alcanzable desde este entorno (`Host not in allowlist: qtygzhvzuzllpzssqbzw.supabase.co`), y las herramientas MCP de Supabase se desconectaron a mitad de la sesión. Tampoco existe un proyecto de staging ni una rama de Supabase configurada.

**Consecuencia honesta: la garantía de que no hay sobreventa NO está demostrada.** Vive en el bloqueo de fila + la comprobación `sum(party_size) + p_party_size > capacity` dentro de `claim_reservation()`, y eso solo se puede comprobar contra un Postgres real. Las pruebas de TypeScript verifican la aritmética de la que depende esa decisión, no la transacción.

---

## 1. Los dos archivos, separados por riesgo

| Archivo | Riesgo | ¿Se puede aplicar sola? |
|---|---|---|
| `20260201000000_experience_presentation.sql` | **Bajo.** Solo `add column ... default` + una restricción CHECK ampliada. No redefine ninguna función. Ninguna fila cambia de significado. | ✅ Sí. Es la que enciende Sunny Originals, modalidad social, archivar, y aliados públicos |
| `20260201000100_group_reservations.sql` | **Alto.** Reescribe `claim_reservation()`, `reserved_counts_for_experiences()` y `admin_set_attendance()`. Cambia cómo se calcula el cupo | ⚠️ Solo después de probarla en un entorno aislado |

Se separaron a propósito: la primera entrega la mayor parte del valor visible sin tocar la lógica de reservación.

---

## 2. Esquema

### `experiences`
| Columna | Tipo | Default | Nota |
|---|---|---|---|
| `is_original` | boolean not null | `false` | (000000) Curada por Sunny |
| `social_modes` | text[] not null | `'{}'` | (000000) Claves validadas en la app |
| `archived_at` | timestamptz | null | (000000) Archivar conserva la fila |
| `post_benefit` | text | null | (000000) Beneficio posterior opcional |
| `max_party_size` | integer not null | **1** | (000100) CHECK `between 1 and 3` |

### `businesses`
| Columna | Tipo | Default | Nota |
|---|---|---|---|
| `featured_as_partner` | boolean not null | `false` | (000000) Aliado público explícito |

### `partner_leads`
| Columna | Tipo | Nota |
|---|---|---|
| `internal_notes` | text | (000000) Privadas |
| `converted_business_id` | uuid → businesses | (000000) `on delete set null` |
| `status` CHECK | — | (000000) Ampliada a 6 valores; superconjunto del anterior, ninguna fila puede fallar |

### `reservations`
| Columna | Tipo | Default | Nota |
|---|---|---|---|
| `party_size` | integer not null | **1** | (000100) CHECK `between 1 and 3` |

### `reservation_companions` (nueva, 000100)
`id` uuid PK · `reservation_id` uuid → reservations **on delete cascade** · `full_name` text not null (CHECK no vacío) · `email` text null · `status` text (mismos 4 estados) · `created_at`.

RLS activo. `select` para el titular y para admin; `update` solo admin. **No hay política de insert/update/delete para usuarios normales** — las filas solo se crean dentro de `claim_reservation()` (security definer). Eso es lo que hace real la regla "los acompañantes no se editan después", en lugar de ser solo una convención de la interfaz.

---

## 3. Funciones

### `reserved_counts_for_experiences(uuid[])`
`count(*)` → `coalesce(sum(party_size), 0)::int`.

**El tipo de retorno se mantiene en `integer`.** Postgres no permite cambiar el tipo de retorno con `CREATE OR REPLACE` ("cannot change return type of existing function"), así que ampliarlo a `bigint` habría hecho fallar la migración. El `sum` se castea de vuelta a `int`; con capacidad máxima de 1000 por experiencia no hay riesgo de desbordamiento.

`coalesce` importa: `sum()` sobre cero filas devuelve NULL, no 0.

### `claim_reservation(uuid, text, integer, jsonb)`
Se conserva: bloqueo `for update` sobre la experiencia (serializa reclamos concurrentes), revalidación de todas las reglas en el servidor, y ser la única vía sancionada para insertar una reservación.

Se agrega: validación de `p_party_size` contra `max_party_size`, comprobación de cupo **en personas**, y escritura de los acompañantes en la **misma transacción** — un fallo deja la reservación revertida, nunca un grupo a medias.

⚠️ **La versión de 2 argumentos se hace `DROP`, no solo `REPLACE`.** Agregar parámetros crea una **sobrecarga**: la función original sobreviviría, mantendría su `grant execute` y seguiría contando filas. Cualquier llamada al formato de 2 argumentos —un bundle viejo en caché, una petición hecha a mano— saltaría todas las validaciones de grupo y reintroduciría la sobreventa. Por eso la migración incluye `drop function if exists public.claim_reservation(uuid, text);` y un `grant` nuevo para la firma de 4 argumentos.

### `admin_set_attendance(uuid, text)`
Marca al titular y propaga a los acompañantes, para que las dos vistas no puedan discrepar.

### `sync_companion_cancellation()` (trigger nuevo)
`after update of status on reservations`: si la reservación pasa a `cancelled`, cancela a todos sus acompañantes en la misma sentencia. Cancelación todo-o-nada (decisión 5) garantizada **en la base**, sin importar qué código la haya originado.

---

## 4. Compatibilidad con datos existentes

`party_size` es `not null default 1`. Toda reservación que ya existe sigue significando exactamente lo que siempre significó: **una persona**.

- No se requiere backfill.
- Ninguna fila histórica cambia.
- `reserved_counts_for_experiences` devuelve lo mismo que antes mientras nadie reserve en grupo.
- En la aplicación, `partySizeOf()` trata la ausencia de la columna como 1, así que los números son correctos antes, durante y después.

**Verificación previa recomendada** (debe dar el mismo número antes y después de aplicar 000100):

```sql
select experience_id, count(*) as filas, coalesce(sum(1), 0) as personas_hoy
from public.reservations
where status in ('confirmed','attended','no_show')
group by experience_id
order by experience_id;
```

---

## 5. Orden de aplicación

1. **Respaldo.** Punto de restauración o dump de `experiences`, `reservations`, `businesses`, `partner_leads`.
2. Ejecutar la consulta de verificación previa (§4) y guardar el resultado.
3. Aplicar **`20260201000000_experience_presentation.sql`**. Recargar la app: nada debe cambiar visualmente todavía (ninguna experiencia es Original, ningún negocio es aliado).
4. Comprobar que el panel ya ofrece **Sunny Original** y **Archivar**, y que Negocios ofrece **Mostrar como aliado**.
5. Aplicar **`20260201000100_group_reservations.sql`** en el entorno aislado.
6. Correr las pruebas SQL de §6 **todas**.
7. Volver a ejecutar la consulta de §4 y confirmar que los números coinciden con el paso 2.
8. Solo entonces considerar la base compartida, repitiendo 1–7.

Después de 000100, opcionalmente ejecutar `supabase/demo_seed_groups.sql` para dar a las experiencias demo su `max_party_size`, `social_modes` y la marca de Original.

---

## 6. Pruebas SQL obligatorias (en el entorno aislado)

Estas son las que **no** pueden hacerse desde TypeScript. Ninguna debe omitirse.

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | `party_size = 1` en experiencia con `max_party_size = 1` | Éxito. Comportamiento idéntico al actual |
| 2 | `party_size = 2` con 1 acompañante, `max_party_size = 2` | Éxito. `sum(party_size)` sube 2 |
| 3 | `party_size = 3` con 2 acompañantes, `max_party_size = 3` | Éxito. Cupo baja 3 |
| 4 | `party_size = 3` con `max_party_size = 2` | `PARTY_SIZE_TOO_LARGE` |
| 5 | `party_size = 3` con solo 1 acompañante | `COMPANION_COUNT_MISMATCH` |
| 6 | Acompañante con nombre vacío o solo espacios | `COMPANION_NAME_REQUIRED` |
| 7 | Acompañante sin correo | Éxito, `email is null` |
| 8 | **Cupo exacto**: capacidad 10, 7 personas dentro, grupo de 3 | Éxito. Queda exactamente 0 |
| 9 | **Último lugar**: capacidad 10, 9 personas dentro, grupo de 2 | `EXPERIENCE_SOLD_OUT` |
| 10 | **Sobreventa**: capacidad 10, 9 personas dentro, grupo de 1 | Éxito. Total 10, no 11 |
| 11 | **Concurrencia** — dos sesiones psql, ambas reclamando los últimos 2 lugares con grupos de 2, `begin` simultáneo | Una tiene éxito, la otra recibe `EXPERIENCE_SOLD_OUT`. **Nunca ambas.** Es la prueba más importante del conjunto |
| 12 | Doble clic: dos llamadas idénticas seguidas del mismo usuario | La segunda falla con `ALREADY_RESERVED_EXPERIENCE` o `WEEKLY_PASS_ALREADY_USED` |
| 13 | Cancelar un grupo de 3 | Reservación `cancelled`, **los 3 acompañantes `cancelled`** por el trigger, cupo recupera 3 |
| 14 | Cancelar fuera de la ventana de 12 h | `CANCELLATION_WINDOW_CLOSED`, nada cambia |
| 15 | Reservación antigua (sin `party_size` explícito) | Cuenta como 1. Los totales coinciden con el paso 2 de §5 |
| 16 | `admin_set_attendance(reservación grupal, 'attended')` | Titular y acompañantes quedan `attended` |
| 17 | Usuario normal intenta `insert` en `reservation_companions` | Rechazado por RLS (no hay política de insert) |
| 18 | Llamar `claim_reservation(uuid, text)` con 2 argumentos | **Debe fallar**: la función ya no existe. Si tiene éxito, el `drop` no se aplicó y la sobreventa sigue posible |
| 19 | Experiencia con `archived_at` no nulo | `EXPERIENCE_NOT_PUBLISHED` |
| 20 | `party_size = 0` o negativo | `INVALID_PARTY_SIZE` |

Guion sugerido para la prueba 11:

```sql
-- Sesión A                          -- Sesión B
begin;                               begin;
select claim_reservation(            select claim_reservation(
  '<exp>', 'test', 2,                  '<exp>', 'test', 2,
  '[{"full_name":"A1"}]'::jsonb);      '[{"full_name":"B1"}]'::jsonb);
-- (bloquea a B en el for update)
commit;                              -- se desbloquea → debe fallar
```

---

## 7. Riesgos

| Riesgo | Gravedad | Mitigación |
|---|---|---|
| Sobrecarga de 2 argumentos sobrevive → sobreventa | **Crítica** | `drop function` explícito + prueba 18 |
| Cambio de tipo de retorno hace fallar la migración | Alta | Se mantiene `integer`; ya resuelto en el archivo |
| Se agrega el selector de lugares sin aplicar 000100 | **Crítica** | La API devuelve `GROUPS_NOT_ENABLED` para `party_size > 1` si la base no está migrada, en vez de reservar 1 lugar para 3 personas |
| Cancelación parcial deja lugares fantasma | Alta | Trigger en la base, no en la app + prueba 13 |
| Grupo a medias por fallo a mitad | Media | Acompañantes se insertan en la misma transacción |
| `sum()` NULL sobre cero filas | Media | `coalesce(..., 0)` |
| Valor corrupto en `max_party_size` | Baja | CHECK en la base + `clamp` en `maxPartySizeOf()` |
| Rollback con grupos ya creados | **Alta** | Ver §8 |

---

## 8. Rollback

`20260201000000` es aditiva: revertirla es mecánico (el SQL comentado está al final del archivo), pero **borrar las columnas descarta las banderas que Emmy haya configurado** — qué experiencias son Originals, qué negocios son aliados, las notas de las solicitudes. Ese dato no se recupera. Es preferible dejar las columnas y no usarlas.

`20260201000100` **solo se puede revertir con seguridad si ninguna reservación tiene `party_size > 1`**:

```sql
select count(*) from public.reservations where party_size > 1;
```

Si devuelve algo distinto de 0, **no revertir**: borrar la columna convertiría silenciosamente un grupo de tres en un solo lugar y la experiencia parecería tener cupo libre que no existe. En ese caso, corregir hacia adelante.

Si devuelve 0, el SQL comentado al final del archivo restaura el conteo por filas; también hay que volver a aplicar las definiciones originales de las tres funciones desde `20260101000600_functions.sql`.

---

## 9. Qué ya está listo en la aplicación

| Pieza | Estado |
|---|---|
| Tipos (`party_size`, `max_party_size`, `ReservationCompanion`) | Listos, opcionales, con fallback |
| `partySizeOf` / `maxPartySizeOf` con clamp | Listos + probados |
| Esquema Zod de la petición (`partySize`, `companions`) | Listo + probado |
| API `/api/reservations/claim` | Envía los 4 parámetros; si la base no está migrada, hace fallback a la firma vieja **solo para 1 persona** y devuelve `GROUPS_NOT_ENABLED` para grupos |
| `ClaimPanel` con selector y nombres | Listo; solo aparece si `max_party_size > 1` |
| Quick View / detalle muestran la modalidad y el límite | Listos |
| "Mi pase" muestra el grupo | Listo; tolera que la tabla no exista |
| Correo de confirmación lista acompañantes | Listo |
| Panel: acompañantes por reservación, filtro individual/grupo | Listo; tolera que la tabla no exista |
| Ocupación en personas en el panel | Lista + probada |
| Emmy puede definir `max_party_size` y la modalidad al crear/editar | Listo en el formulario |
