# Sunny Project

Una plataforma curada para descubrir y reservar experiencias locales de wellness, movimiento, recovery, cafés, outdoor y comunidad en Monterrey. Cada usuario tiene un pase gratuito por semana para reclamar un lugar en una experiencia con cupo limitado.

Ver [`PRODUCT_SPEC.md`](./PRODUCT_SPEC.md) para todas las reglas de producto y las decisiones tomadas ante ambigüedades.

## Stack

Next.js (App Router) · TypeScript estricto · Tailwind CSS v4 · Supabase (Auth, Postgres, Storage, RLS) · Resend + React Email · Zod · Vitest + Playwright · pnpm.

## Cómo funciona el pase semanal (resumen)

Un pase gratuito por usuario por semana calendario (lunes 00:00, `America/Monterrey`). Reservar consume el pase; cancelar con ≥12 horas de anticipación lo libera. Toda la lógica de negocio vive en funciones transaccionales de Postgres (`supabase/migrations`), nunca solo en el cliente — ver §4-5 de `PRODUCT_SPEC.md`.

## 1. Requisitos

- Node.js 20+
- pnpm 10+
- Una cuenta de [Supabase](https://supabase.com) (gratuita)
- Opcional: cuenta de [Resend](https://resend.com) para enviar correos reales

## 2. Instalación local

```bash
pnpm install
cp .env.example .env.local
```

Sin configurar Supabase, la app arranca y muestra una pantalla de configuración amigable en cualquier ruta — no una pantalla rota. Para tener la app funcional necesitas completar los pasos 3-5.

## 3. Configura Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia **Project URL**, **anon public key** y **service_role key** (Project Settings → API) a `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

3. En **Authentication → Providers**, confirma que **Email** esté habilitado.
4. En **Authentication → URL Configuration**, agrega tu `NEXT_PUBLIC_SITE_URL` (p. ej. `http://localhost:3000` y tu dominio de producción) a **Redirect URLs**, incluyendo `/auth/callback` (p. ej. `http://localhost:3000/auth/callback`).

## 4. Aplica las migraciones

Las migraciones viven en `supabase/migrations/*.sql` y son el esquema completo: tablas, índices, RLS, funciones transaccionales (`claim_reservation`, `cancel_reservation`, etc.) y buckets de Storage.

**Opción A — Supabase CLI (recomendada):**

```bash
npx supabase login
npx supabase link --project-ref <tu-project-ref>
npx supabase db push
```

**Opción B — SQL Editor del dashboard:** abre cada archivo en `supabase/migrations/` en orden (por el prefijo de fecha) y ejecútalo en **SQL Editor**.

## 5. Variables de entorno restantes

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=tu-correo@ejemplo.com
RESEND_API_KEY=
RESEND_FROM_EMAIL=Sunny Project <onboarding@resend.dev>
```

- `ADMIN_EMAIL`: el correo que se promueve automáticamente a rol `admin` la primera vez que inicia sesión (ver §6 del spec). Puede dejarse vacío mientras pruebas como usuario normal.
- `RESEND_API_KEY`: si se deja vacío, los correos se imprimen en la consola del servidor en lugar de enviarse — la app sigue funcionando completamente.

Variables **solo de servidor** (nunca se exponen al navegador): `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`. Las que empiezan con `NEXT_PUBLIC_` sí se exponen al cliente (son seguras: URL del proyecto y llave anónima, protegidas por RLS).

## 6. Seed data (contenido de ejemplo)

Crea 4 negocios y 4 experiencias de demostración (marcadas como "[Demostración]"), con fechas próximas relativas a "hoy":

```bash
pnpm seed
```

Requiere `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya configurados. Es idempotente (usa `upsert` por slug), puedes correrlo varias veces.

## 7. Cómo crear el admin

1. Define `ADMIN_EMAIL=tu-correo@ejemplo.com` en `.env.local` (y en Vercel para producción).
2. Entra a la app con ese correo desde `/acceso` (magic link).
3. Al volver de `/auth/callback`, el servidor detecta que el correo coincide con `ADMIN_EMAIL` y promueve el perfil a `role = 'admin'` usando el service role key — nunca desde el cliente. Ya puedes entrar a `/admin`.

Si necesitas promover a un admin adicional sin pasar por `ADMIN_EMAIL`, hazlo directamente en SQL Editor:

```sql
update public.profiles set role = 'admin' where id = '<uuid-del-usuario>';
```

(Esto solo funciona con permisos de service role / SQL Editor — el cliente tiene ese cambio bloqueado por RLS y por un trigger, ver `20260101000100_profiles.sql`.)

## 8. Correr localmente

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## 9. Pruebas

```bash
pnpm lint        # ESLint
pnpm typecheck   # tsc --noEmit
pnpm test        # Vitest (unitarias — no requieren Supabase)
pnpm test:e2e    # Playwright (requiere la app corriendo + Supabase configurado + seed aplicado)
pnpm build       # build de producción
```

- **Unitarias** (`tests/unit`): reglas puras — cómputo de estados de experiencia, CTA de reservación, validaciones Zod, generación de `.ics`, timezone/semana calendario. No requieren nada configurado.
- **Integración contra Supabase real** (`tests/integration/reservations.test.ts`): ejercitan `claim_reservation()`/`cancel_reservation()` y RLS contra un proyecto de Supabase real y desechable (nunca producción). Se **saltan automáticamente** a menos que definas `TEST_SUPABASE_URL`, `TEST_SUPABASE_ANON_KEY` y `TEST_SUPABASE_SERVICE_ROLE_KEY` — cubren: reservar con pase+cupo, no doble reserva de la misma experiencia, no dos pases activos la misma semana, cancelación a tiempo libera el pase, cancelación tardía rechazada, no reservar agotada, dos usuarios no pueden tomar el mismo último cupo, un usuario no puede leer reservaciones de otro, un usuario no puede escribir su propio rol.
- **Playwright** (`tests/e2e`): flujos públicos (home, catálogo, filtros, detalle, 404, legales) y verificación de que `/mi-pase` y `/admin` redirigen a `/acceso` sin sesión. Asumen Supabase configurado + `pnpm seed` corrido — sin eso, todas las rutas muestran la pantalla de configuración y las pruebas fallarán (esperado, no es un bug).

## 10. Desplegar en Vercel

1. Importa el repositorio en [vercel.com/new](https://vercel.com/new).
2. Framework preset: Next.js (detectado automáticamente).
3. Agrega todas las variables de `.env.example` en **Settings → Environment Variables** (usa tu dominio real de Vercel como `NEXT_PUBLIC_SITE_URL`).
4. Aplica las migraciones a tu proyecto de Supabase de producción (paso 4) y corre `pnpm seed` apuntando a ese proyecto si quieres datos de ejemplo ahí también.
5. Agrega la URL de producción + `/auth/callback` a **Redirect URLs** en Supabase Auth (paso 3.4).
6. Despliega. `next build` no requiere Supabase configurado para completarse (todas las páginas dinámicas se renderizan en runtime, no en build time), pero sin las variables de entorno reales en Vercel la app en producción mostrará la pantalla de configuración en vez de la app real.

## Estructura del proyecto

```
app/                    Rutas (App Router): públicas, /mi-pase /mi-cuenta /historial, /admin/*, /api/*
components/             UI compartida (ui/, site/, experience/, pass/, account/, admin/, auth/)
lib/                    Supabase clients, auth, queries, validaciones Zod, reglas de estado/CTA, fechas, email
emails/                 Plantillas React Email
supabase/migrations/    Esquema, RLS, funciones transaccionales, Storage — la fuente de verdad del backend
scripts/seed.ts         Seed de negocios/experiencias de demostración
tests/                  unit/ (Vitest puro), integration/ (Vitest + Supabase real), e2e/ (Playwright)
```

## Qué requiere contenido real antes de lanzar

- **Seed data**: las 4 experiencias/negocios de ejemplo están marcadas "[Demostración]" — reemplázalas o despublícalas (`/admin/experiencias`) antes de invitar usuarios reales.
- **Imágenes**: `/public/images/placeholder-*.svg` son ilustraciones genéricas locales; sube imágenes reales por experiencia/negocio desde el panel admin (usa Supabase Storage, ya configurado con buckets `experience-images` y `business-logos`).
- **Copys legales**: `/privacidad` y `/terminos` tienen redacción razonable para un MVP pero no reemplazan revisión legal antes de un lanzamiento real.
- **Dominio de correo (Resend)**: `RESEND_FROM_EMAIL` usa el dominio sandbox `onboarding@resend.dev` por defecto; verifica tu propio dominio en Resend para producción.
- **Redirect URLs de Supabase Auth**: deben incluir tu dominio final, no solo `localhost`.
- **Vercel Analytics** (opcional): el proyecto no lo integra por defecto para no añadir una dependencia innecesaria al MVP; puedes agregar `@vercel/analytics` en `app/layout.tsx` si lo activas en tu proyecto de Vercel.
