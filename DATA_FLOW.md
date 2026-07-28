# Data flow — Sunny Project

Who reads/writes each table, through which endpoint, with what validation, and what the person (and "Emmy", the admin) sees. Written for this redesign iteration per the requirement to map data end-to-end before touching UI; no schema changes were made — this documents the existing system.

## Tables

| Table | Written by | Read by (public) | Read by (admin) |
|---|---|---|---|
| `profiles` | trigger `handle_new_user()` on signup; `completeProfileAction`; admin role bootstrap in `/auth/callback` | `getCurrentUser()` (header, gating) | none dedicated yet (out of scope this phase) |
| `experiences` | Admin CRUD (`/admin/experiencias/**`) | `getPublicExperiences`, `getExperienceBySlug`, `getFeaturedExperience` | `/admin/experiencias`, `/admin/page.tsx` (dashboard) |
| `reservations` | `claim_reservation()` / `cancel_reservation()` Postgres functions (`SECURITY DEFINER`, the only writers — RLS blocks direct client writes) | `getActiveWeeklyReservation`, `getUserReservationHistory`, `getExistingReservationForExperience` | `/admin/reservaciones`, `/admin/page.tsx`, CSV export |
| `businesses` | Admin CRUD (`/admin/negocios/**`) | `getActiveBusinesses` | `/admin/negocios` |
| `partner_leads` | `POST /api/partner-leads` (public form) | — (not shown publicly) | `/admin/solicitudes`, status transitions via `setPartnerLeadStatusAction` |

## Actions, end to end

### 1. Magic-link sign-in
- **Trigger**: `MagicLinkForm` → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '/auth/callback?next=...' } })` (client SDK, direct to Supabase Auth — no app API route).
- **Validation**: none beyond the browser's `type="email"`; Supabase itself rejects malformed addresses.
- **Table**: none yet — Supabase Auth sends the email itself (its own email provider, separate from the Resend integration used for reservation emails).
- **Callback**: `GET /auth/callback` → `exchangeCodeForSession(code)` → on success, sets the session cookie and redirects to `next` (default `/mi-pase`) with `?bienvenido=1`. On failure, redirects to `/acceso?error=expired|generic` (see `app/auth/callback/route.ts`).
- **Admin visibility**: Supabase Dashboard → Authentication → Users (outside this app's admin panel).
- **User-facing states**: "Enviando…" → "Revisa tu correo" (`MagicLinkForm`) → (opens email, different device or not, out of this app's control) → "Sesión iniciada" toast (`SessionWelcomeToast`) or an error banner on `/acceso` if the link was expired/invalid.
- **If it fails**: the callback never throws into a 500 — every branch resolves to a redirect with a specific, human-readable reason on `/acceso`.

### 2. Complete profile
- **Trigger**: `ProfileCompletionForm` → `completeProfileAction` Server Action (`lib/actions/profile.ts`).
- **Validation**: Zod schema server-side (full name required, `adult_confirmed`/`terms_accepted` must be checked) — see `lib/actions/profile.ts`.
- **Table**: `profiles` (update, own row only — RLS `id = auth.uid()`; `role` column is separately protected by `trg_prevent_role_self_update`).
- **Admin visibility**: none dedicated (out of scope this phase; visible via Supabase Table Editor).
- **Email**: none.
- **User-facing states**: inline field errors, "Guardando…" while pending, then the claim flow continues automatically (`onComplete` callback advances `ClaimPanel`/`QuickView` to the confirm step).

### 3. Claim a weekly pass
- **Trigger**: `ClaimPanel` (mounted on `/experiencias/[slug]` and inside `QuickView`) → `POST /api/reservations/claim`.
- **Validation**: `claimReservationSchema` (Zod) for the request shape; all business rules (published, claim window open, not past, capacity, one pass per week, not already reserved, profile complete) are enforced **inside** the `claim_reservation()` Postgres function, not in the route handler — this is the single source of truth so the transactional guarantee (no double-booking under concurrent requests) holds regardless of caller.
- **Table**: `reservations` (insert, via the RPC only — RLS has no public insert policy).
- **Admin visibility**: `/admin/reservaciones` (full list, filterable), `/admin/page.tsx` (capacity dashboard).
- **Email**: `notifyPassConfirmed` (Resend, `PaseConfirmado` template) — folio, date, time, location, link to `/mi-pase`.
- **If the email fails**: `sendEmail()` never throws (see `lib/email/send.ts`) — it logs and swallows. The reservation is already committed in the DB before the email is attempted, so a failed send never rolls back or blocks the pass; the person still sees "¡Pase confirmado!" with the real folio in the UI and in `/mi-pase`, just without the email copy. Without `RESEND_API_KEY` set, the email is logged to the server console instead of sent (dev fallback).
- **User-facing states**: checkbox acknowledgement → "Reservando…" (button-scoped loader only, per the "no full-page spinner" rule) → success card with folio, or a specific error (`sold_out`, `pass_used_elsewhere`, `already_reserved`, `closed`, mapped in `lib/constants.ts` → `RESERVATION_ERROR_MESSAGES`).

### 4. Cancel a reservation
- **Trigger**: `/mi-pase` cancel action → `POST /api/reservations/[id]/cancel`.
- **Validation**: ownership + the 12-hour cancellation window, enforced inside `cancel_reservation()` (Postgres function).
- **Table**: `reservations` (status → `cancelled`, via the RPC only).
- **Admin visibility**: `/admin/reservaciones` shows the cancelled status; the released spot is immediately reflected in every capacity read (`reserved_counts_for_experiences` RPC only counts `confirmed/attended/no_show`).
- **Email**: `notifyPassCancelledByUser` (`PaseCancelado` template).
- **If the email fails**: same swallow-and-log behavior as above; cancellation is already committed.
- **Consequence for the weekly pass**: since `getActiveWeeklyReservation` only returns `confirmed/attended/no_show`, a cancelled reservation makes the person's pass "available" again for that same week — this is exactly what powers the "cancel → choose another experience" requirement in the new Home pass section, with no extra code needed.

### 5. Admin cancels an experience
- **Trigger**: `/admin/experiencias/[id]` → `POST /api/admin/experiences/[id]/cancel`.
- **Validation**: `requireAdmin()` guard.
- **Table**: `experiences.status = 'cancelled'`; all active `reservations` for it are cancelled in the same transaction.
- **Email**: `notifyExperienceCancelledByAdmin` to every affected reservation holder (`ExperienciaCancelada` template).
- **User-facing state**: the experience shows as "Cancelada" everywhere (`computeExperienceState`), and `ClaimPanel`/`QuickView` show the cancelled info message instead of a CTA.

### 6. Business partner lead
- **Trigger**: `PartnerLeadForm` (now reached via `PartnerLeadModal` from the Home "Para negocios" section, or the full `/para-negocios` page) → `POST /api/partner-leads`.
- **Validation**: `partnerLeadSchema` (Zod) — business name, contact name, email required; phone/category/instagram/city/message/offered_spots optional.
- **Table**: `partner_leads` (insert; public RLS insert policy scoped to this shape).
- **Admin visibility**: `/admin/solicitudes` — full list ordered by newest, with status transitions (`new → contacted → accepted → rejected`) via `setPartnerLeadStatusAction`.
- **Email**: `notifyNewPartnerLead` to `ADMIN_EMAIL` (`NuevaSolicitudNegocio` template) — skipped silently if `ADMIN_EMAIL` isn't set.
- **If the email fails**: same swallow-and-log; the lead is already in `partner_leads` and visible in `/admin/solicitudes` regardless of whether the notification email went out.
- **User-facing states**: "Enviando…" → "¡Gracias por tu interés!" or a generic retry message on failure (`status === 'error'` in `PartnerLeadForm`).

### 7. CSV export
- **Trigger**: `/admin/reservaciones` → `GET /api/admin/reservations/export`.
- **Validation**: `requireAdmin()` guard.
- **Table**: reads `reservations` joined with `experiences`/`profiles`; no writes.
- **Output**: a `.csv` file download, not an email.

## Admin panel surface check (existing, unchanged this phase)

| Data | Where Emmy sees it |
|---|---|
| Usuarios | Supabase Table Editor → `profiles` (no dedicated in-app admin screen yet — noted as a gap, not fixed this phase since `/admin` redesign is out of scope) |
| Reservaciones | `/admin/reservaciones` — list, filters, cancel, resend confirmation email, CSV export |
| Experiencias | `/admin/experiencias` — CRUD, cancel |
| Solicitudes de negocios | `/admin/solicitudes` — list, status transitions |
| Cupos / estados | `/admin/page.tsx` dashboard — total capacity vs. reserved across published, upcoming experiences |

No Google Sheets/Airtable integration exists or was added this iteration — all admin visibility is the in-app `/admin/**` panel plus direct Supabase Table Editor access for `profiles`.
