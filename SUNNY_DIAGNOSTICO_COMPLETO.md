# Sunny — Diagnóstico completo del producto

Estado a 31 de julio de 2026, rama `claude/sunny-mvp-1-1-design-admin`,
sirviendo en `sunny-project-teal.vercel.app`.

Esta es la primera vez que puedo auditar **las tres capas** a la vez: el sitio
en producción, el código, y la base de datos con sus políticas de seguridad.
Todo lo de aquí está comprobado en ejecución salvo donde diga lo contrario.

---

# 1. Qué funciona hoy

| Capa | Estado |
|---|---|
| Sitio público en producción | **8 de 8 rutas responden 200** |
| `/admin` sin sesión | **307** a `/acceso` — la barrera vive en el middleware, antes de renderizar |
| Acceso con enlace mágico | **Probado de punta a punta.** Callback → sesión → panel |
| Panel de Emmy | `/admin`, `/admin/experiencias`, `/admin/reservaciones` → 200 con contenido real |
| Correo | SMTP propio (Resend) configurado; 30 envíos/hora en vez de un puñado |
| Compuertas | lint ✓ · typecheck ✓ · **107 pruebas** ✓ · build ✓ |
| Accesibilidad | **0 hallazgos** de `axe-core` en 9 rutas × 2 viewports |
| Responsive | **0 scroll horizontal** en 49 combinaciones (7 rutas × 7 anchos) |

El producto **está en pie y es usable**. Lo que sigue son cosas que arreglar
antes o durante el crecimiento, no cosas rotas.

---

# 2. Seguridad — lo que encontró el analizador de Supabase

Corrí el linter de seguridad de Supabase por primera vez. Salieron **25 avisos**.
Los revisé uno por uno y, lo más importante:

## 2.1 Ninguno es explotable hoy. Lo verifiqué

El aviso más alarmante dice que `admin_cancel_experience`,
`admin_cancel_reservation` y `admin_set_attendance` —funciones `SECURITY
DEFINER`, que corren con permisos elevados— **son ejecutables por el rol
`anon`**, es decir por cualquiera sin iniciar sesión, vía
`/rest/v1/rpc/<función>`.

Leído así, cualquiera podría cancelar la experiencia de cualquiera.

**No es el caso, y lo comprobé llamándolas de verdad** con la clave pública y
un UUID inexistente:

```
admin_cancel_experience    → {"code":"42501","message":"FORBIDDEN"}
admin_cancel_reservation   → {"code":"42501","message":"FORBIDDEN"}
admin_set_attendance       → {"code":"42501","message":"FORBIDDEN"}
claim_reservation          → {"code":"28000","message":"NOT_AUTHENTICATED"}
```

Las cuatro llevan guardia interna (`if not public.is_admin() then raise
exception 'FORBIDDEN'`). El aviso es real pero describe **una capa de defensa
que falta, no una puerta abierta**: PostgreSQL concede `EXECUTE` a `PUBLIC` por
defecto y nadie lo revocó.

**Qué hacer:** revocar `EXECUTE` a `public` y `anon` en las funciones de
administración. Es defensa en profundidad — si algún día alguien toca la
guardia interna, no queda todo expuesto de golpe. Prioridad media, no urgente.

## 2.2 Cualquiera puede insertar solicitudes de negocio sin límite — MEDIO

La política `partner_leads_insert_public` tiene `WITH CHECK (true)`. Es
**intencional**: el formulario de `/para-negocios` es público y no exige cuenta.

Pero no hay límite de frecuencia. Alguien puede llenar la tabla y la bandeja de
Emmy con un script. Hoy con 3 solicitudes no importa; el día que el sitio tenga
tráfico, sí.

**Qué hacer:** captcha, o un límite por IP en el endpoint `/api/partner-leads`.

## 2.3 Los buckets públicos permiten listar todo su contenido — BAJO

`business-logos` y `experience-images` tienen una política `SELECT` amplia, así
que un cliente puede **listar todos los archivos**, no solo abrir los que
conoce. No hace falta para que las imágenes se vean.

## 2.4 Menores

- `set_updated_at` no fija `search_path`.
- Protección contra contraseñas filtradas desactivada — **irrelevante aquí**:
  el sitio no usa contraseñas, solo enlace mágico.

---

# 3. Rendimiento de la base — 30 avisos

Ninguno duele hoy (1 usuario, 6 experiencias, 8 reservaciones). Todos duelen a
escala.

## 3.1 Las políticas RLS reevalúan `auth.uid()` por cada fila — ALTO a medio plazo

Cuatro políticas —`profiles_select_own`, `profiles_insert_own`,
`profiles_update_own`, `reservations_select_own`— llaman a `auth.<función>()`
directamente. Postgres la vuelve a evaluar **para cada fila examinada**.

Con 10 000 reservaciones, listar el historial de alguien evalúa la función
10 000 veces. La corrección es mecánica: envolver en `(select auth.uid())`, que
la convierte en constante para toda la consulta.

## 3.2 Políticas permisivas duplicadas — MEDIO

`businesses`, `experiences`, `profiles` y `reservations` tienen **dos políticas
permisivas de `SELECT` para el mismo rol** (la de admin y la pública/propia).
Postgres tiene que ejecutar las dos en cada consulta. Se resuelve fundiéndolas
en una sola con `OR`.

## 3.3 Seis índices sin usar — INFO

`businesses_category_idx`, `experiences_business_id_idx`,
`experiences_category_idx`, `experiences_featured_idx`,
`reservations_status_idx`, `partner_leads_created_at_idx`.

**No los quitaría todavía.** «Sin usar» con 6 filas solo significa que Postgres
prefiere recorrer la tabla entera porque es diminuta. Con datos reales varios de
esos índices sí entrarán. Revisar dentro de unos meses, no ahora.

---

# 4. Migraciones — el punto que más riesgo acumula

| En el repositorio | Aplicada en la base |
|---|---|
| Las 10 primeras (`20260101…`) | **Sí** |
| `20260201000000_experience_presentation` | **No** |
| `20260201000100_group_reservations` | **No** |
| `20260201000200_backfill_missing_profiles` | **No** |
| `20260201000300_is_demo` | **No** |

**Cuatro migraciones escritas y ninguna aplicada.** El sitio funciona igualmente
porque todas las consultas usan `select("*")` y los lectores defensivos
(`lib/experience-flags.ts`, `lib/demo-content.ts`) devuelven el comportamiento
previo cuando la columna no existe. Eso fue deliberado y sigue siendo correcto.

Pero implica tres cosas que conviene tener claras:

1. **No hay reservaciones con acompañantes.** Todo es individual, un lugar por
   pase.
2. **La garantía de no-sobreventa bajo concurrencia NO está demostrada.**
   `claim_reservation` sigue siendo la versión de 2 argumentos que cuenta filas.
   Las 20 pruebas de `SUNNY_COMPANIONS_MIGRATION_PLAN.md` §6 no se han corrido
   en ningún entorno.
3. **El interruptor `is_demo` aún no existe**, así que el badge «Demostración»
   sigue dependiendo del sufijo del título.

Cuanto más tiempo pase, más difícil será aplicarlas todas juntas. Mi
recomendación: una rama de Supabase o un proyecto de staging para probarlas, y
aplicarlas en orden. **No contra la base que estás usando para probar.**

---

# 5. Datos

| Tabla | Filas | Nota |
|---|---|---|
| `auth.users` | 1 | Tu cuenta |
| `profiles` | 1 | `role = admin` ✓ |
| `experiences` | 6 | Publicadas, 1–6 de agosto de 2026 |
| Negocios | 6 | Todos de demostración |

**Todo el contenido es de demostración.** Antes de abrir hay que decidir si se
vacía o se marca. La consulta para vaciarlo está anotada al final de
`20260201000300_is_demo.sql`.

Tu perfil tiene rol de admin pero **`full_name` y los dos consentimientos están
vacíos** — a propósito, son tuyos y no me corresponde rellenarlos. El panel
funciona sin eso; reservar no. Ahora el sitio te lleva a completarlo al entrar.

---

# 6. Infraestructura

**Vercel.** Producción sirve la rama `claude/sunny-mvp-1-1-design-admin`. No hay
rama `main`: el repositorio tiene tres ramas `claude/*` y la por defecto sigue
siendo la vieja (`claude/sunny-project-mvp-i5f1ey`). **Conviene ordenar esto**
antes de que alguien más toque el proyecto — la rama por defecto de GitHub y la
de producción de Vercel apuntando a sitios distintos es una trampa para el
siguiente que llegue.

**Supabase.** Redirect URLs: falta el comodín `https://*.vercel.app/**`. Sin él,
cualquier despliegue de previsualización futuro volverá a mandar los enlaces
mágicos a producción en silencio — el fallo que costó una sesión entera
diagnosticar.

**Resend.** SMTP conectado, pero **sin dominio verificado**. El remitente es
`onboarding@resend.dev`, que solo entrega a tu propia dirección. **Emmy no
recibirá nada, y los usuarios tampoco.** Verificar un dominio propio es
requisito para abrir, no un extra.

Y la API key que se compartió en el chat sigue activa: rótala antes de verificar
el dominio, que es cuando pasa a poder enviar en nombre de la marca.

---

# 7. Producto y experiencia

Resuelto en las últimas rondas: contraste de color AA, titular del hero legible
por lectores de pantalla, Quick View visible en enlaces compartidos, filtros del
catálogo de 290 px a 95 px, hueco de 544 px en «Esta semana», una sola voz
tipográfica en las 12 páginas, buscador y paginación en el panel, diálogo de
cancelación con número de afectados, y el perfil pedido al entrar.

Queda abierto **por decisión tuya, no por falta de tiempo**:

- **El Home mide 12.445 px** — 13 secciones y 14 `<h2>` compitiendo, 3,7 veces
  el alto del catálogo. Hay que elegir qué tres secciones lo sostienen.
- **Fotografía propia.** Todo el material es genérico y de archivo. Con fotos
  reales de los espacios aliados el sitio sube un escalón entero.
- **Los textos de los diez estados de CTA** deberían decir qué hacer, no solo
  qué pasa. `pass_used_elsewhere` es el más claro: falta decir que se puede
  cancelar la otra reservación y dónde.

---

# 8. Qué haría, en orden

## Antes de abrir a usuarios reales — bloqueantes
1. **Verificar un dominio en Resend** y cambiar el remitente. Sin esto no llega
   ni un correo a nadie que no seas tú.
2. **Decidir qué pasa con los datos de demostración.**
3. **Añadir `https://*.vercel.app/**`** a Redirect URLs de Supabase.
4. **Rotar la API key de Resend.**

## Antes de que haya volumen
5. **Aplicar las cuatro migraciones** en un entorno aislado, con las 20 pruebas
   de concurrencia. Es lo que más riesgo acumula.
6. **Revocar `EXECUTE` a `anon`** en las funciones de administración.
7. **Límite de frecuencia** en el formulario de negocios.
8. **`(select auth.uid())`** en las cuatro políticas RLS.

## Cuando quieras
9. Longitud del Home, fotografía propia, textos de CTA, políticas duplicadas.

---

## Sobre el método y sus límites

Comprobado en ejecución: rutas de producción, guardias de las funciones RPC,
avisos del linter de Supabase, estado de migraciones y datos, y las compuertas
del repositorio.

**No comprobado:** el panel de administración con una sesión nueva en un
navegador. Chromium no sale a internet desde mi entorno —solo `curl`— así que no
puedo abrir producción con sesión, y la sesión simulada contra el mock la
rechaza el middleware. Los hallazgos del panel salen de leer el código y de
`curl` autenticado, que confirma que responde 200 con contenido, no de mirar la
pantalla.

Tampoco he probado un flujo de reserva real de punta a punta: requiere completar
tu perfil primero.
