# Sunny Project — Product Spec (MVP)

This document is the single source of truth for product decisions in the MVP. It is written by the engineering agent while building the app, based on the founder's brief, resolving minor ambiguities with the simplest, safest, MVP-coherent choice.

## 1. Product

Sunny Project is a curated platform to discover and reserve local wellness, movement, recovery, food/coffee, outdoor and community experiences in Monterrey. Businesses offer a limited number of free spots to attract new people. Users explore experiences and can claim one free weekly pass.

Two roles: `user` and `admin`. Businesses do not have accounts; the admin manages businesses and experiences on their behalf.

Core loop: **DESCUBRIR → RECLAMAR → ASISTIR → REGRESAR**.

## 2. Weekly pass rules (canonical)

- One free pass per calendar week per user.
- Week starts Monday 00:00, timezone `America/Monterrey`.
- Pass auto-renews every Monday. Unused passes do not roll over.
- One active reservation per user per week (`confirmed` counts as active).
- A user cannot book the same experience twice (any non-cancelled reservation blocks a repeat claim).
- Pass is individual, non-transferable, no guests.
- User must self-certify 18+ (boolean `adult_confirmed_at` timestamp only — no birthdate collected).
- `confirmed`, `attended`, and `no_show` all consume the weekly pass. Only a properly `cancelled` reservation frees it back up.
- No waitlist, no payments, no subscriptions, no extra passes — explicitly out of scope.

UI must always show exactly one of three states: pass available / pass used this week / next pass available Monday <date>.

## 3. Cancellation

- User can cancel from "Mi pase" until 12 hours before `starts_at`.
- On-time cancel: reservation → `cancelled`, capacity released (+1 available), pass recovered, cancellation email sent, user free to book another experience same week.
- Late (< 12h): cancel button disabled, message "El periodo de cancelación terminó", reservation stays `confirmed`; admin can later mark `no_show`.
- Admin can cancel any reservation at any time (no 12h restriction).
- Admin cancelling an experience cascades: all `confirmed` reservations → `cancelled`, capacity notionally irrelevant (experience is cancelled), pass recovered for every affected user, cancellation email sent to each, experience status → `cancelled`.

## 4. Reservation transaction & capacity

Booking is implemented as a single Postgres function `claim_reservation(p_experience_id uuid, p_user_id uuid, p_source text)` marked `SECURITY DEFINER`, called only from a server-side Route Handler with the user's verified session (never directly from the client via PostgREST insert). The function, inside one transaction:

1. `SELECT ... FOR UPDATE` locks the experience row.
2. Re-checks: experience `status = 'published'`, `now() BETWEEN claim_opens_at AND claim_closes_at`, `starts_at > now()`, `reserved_count < capacity` (computed from a `SELECT COUNT(*) FOR UPDATE`-safe query inside the same locked transaction), no existing active reservation for that user in `week_start`, no existing non-cancelled reservation by that user for that experience, and `adult_confirmed_at IS NOT NULL` on the profile.
3. Inserts the reservation with a generated unique `folio` (`SUN-<year>-<6 alphanumeric>`).
4. Returns the created row (or raises a specific error code the API layer translates to a user-facing message).

A partial unique index enforces "one active reservation per user per week" at the DB level as defense in depth:
`CREATE UNIQUE INDEX ON reservations (user_id, week_start) WHERE status IN ('confirmed','attended','no_show');`
(these are the three statuses that consume the pass — see §2).

Row-level locking + the partial unique index together prevent overbooking and double-booking even under concurrent requests.

## 5. Pass validation

No QR. The reservation record (folio, name, experience, business, date/time, location, instructions, status) is the pass. Admin exports attendee CSVs and marks `attended` / `no_show` after the event. Folio format: `SUN-{year}-{6 uppercase alphanumeric}` (e.g. `SUN-2026-AB12CD`).

## 6. Auth

Supabase Auth, magic link only (no passwords, no OAuth). Role stored in `profiles.role` (`user` | `admin`), defaulting to `user`. The email in `ADMIN_EMAIL` is promoted to `admin` by a server-side bootstrap (an idempotent check run on profile creation / first login via the server client using the service role, never client-writable). RLS forbids a user from updating their own `role` column (enforced via a trigger that rejects role changes from non-service-role callers, since column-level RLS grants are awkward with PostgREST — see migrations).

## 7. Data model

See migrations in `supabase/migrations`. Tables: `profiles`, `businesses`, `experiences`, `reservations`, `partner_leads`. All timestamps stored UTC (`timestamptz`), rendered in `America/Monterrey` in the UI via `date-fns-tz`.

## 8. Notifications

Resend + React Email, four Spanish templates: pass confirmed, pass cancelled by user, experience cancelled by admin, new partner lead (to admin). Email delivery is fire-and-forget relative to the booking transaction: a failed send never rolls back or blocks a reservation; failures are logged (`console.error` in MVP — no external log sink) and the pass remains visible in the user's account regardless. In dev, missing `RESEND_API_KEY` prints the rendered email to console instead of sending.

## 9. Visual identity

Editorial/premium direction inspired by the *rhythm* of functionhealth.com/how-it-works (large type, numbered sections, generous whitespace, big photography) — no copied text, images, brand, icons, or components. Palette: ivory `#F4F1E8`, carbon `#171714`, sunny yellow `#F8D347`, orange `#FF7A3D`, warm white `#FFFDFC`, secondary gray `#6D6D65`. Fonts: Manrope (sans, UI) + Newsreader (serif, editorial accents), both via `next/font`. Public site is editorial/warm; `/admin` is a plain, functional, neutral dashboard.

## 10. Explicitly out of scope for MVP

Payments, subscriptions, premium/extra passes, business accounts/dashboard, commissions, invoicing, per-user QR codes/scanner, waitlist, referrals, public reviews, favorites, social feed, chat, points/streaks/levels/badges/leaderboard/rewards, Instagram integration, native mobile app, under-18 support, multi-city, multi-language. No dead/disabled buttons for any of these are shown.

## 11. Ambiguities resolved during build

- **"WhatsApp opcional" format**: stored as free-text `phone` string, no format validation beyond max length — kept simple for MVP.
- **Featured experience on Home**: the single `featured = true` experience with the soonest upcoming `starts_at`; if none is flagged, falls back to the soonest published upcoming experience.
- **"Últimos lugares" threshold**: capacity remaining ≤ 3 and > 0.
- **Experience `sold_out` status**: derived at read time from `capacity - confirmed/attended/no_show reservation count`, not a status an admin sets by hand (admin sets draft/published/cancelled/completed; sold-out is computed and displayed as an overlay state on top of `published`).
- **`completed` status**: set automatically (via a read-time check, no cron in MVP) when `ends_at < now()` on a published experience — shown as "Finalizada".
- **CSV export**: generated server-side on demand in the admin reservations page (not a background job).
- **partner lead notification**: implemented as an email to `ADMIN_EMAIL` via the same Resend integration, not a separate notification system.
- **`.ics` calendar file**: generated on the fly by a route handler from the reservation's experience data, not stored.
- **Analytics `source`**: captured from `?source=` query param client-side, persisted through to the server action on claim, stored on the reservation row; a simple grouped count is shown in `/admin` (no charting library).
