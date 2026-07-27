# Interaction Adaptation Plan

This document records how the public side of Sunny Project adopted the *interaction level* of the "Baseline — Tennis Club & Academy" reference — scroll narrative, microinteractions, editorial motion, carousels, menus, modals — without copying its brand, copy, imagery, colors, or code. Written before implementation, per the request that introduced this phase.

## What was taken as inspiration (behavior only, never assets/copy/brand)

- **Session-gated intro loader** that slides away to reveal the hero, rather than a spinner.
- **Header that starts transparent over a full-bleed hero and solidifies on scroll.**
- **Word-by-word hero title reveal**, secondary copy and CTA following after, subtle photo parallax.
- **A horizontal, autoplaying carousel** for a curated set of items instead of a static grid up front.
- **A sticky, scroll-driven "how it works" narrative**: text pinned on one side, a visual that advances a step at a time as you scroll, with a progress indicator.
- **Cards that lift, zoom their photo, and reveal an arrow on hover**, rather than static bordered boxes.
- **An immersive detail page**: large hero photo with parallax, progressively-revealed sections, a sticky booking panel on desktop / fixed bottom CTA on mobile.
- **Full-screen mobile menu** with staggered link entrance instead of a plain dropdown.
- **A reusable "movement system"** (word/line/in-view reveal, parallax, hover-lift, animated arrow, carousel dots, fullscreen menu, animated modal) so the same primitives are reused everywhere instead of one-off animations per page.

## How it was adapted to Sunny

- Baseline's blue/corporate palette is not used anywhere; every surface still uses ivory `#F4F1E8`, carbon `#171714`, sunny yellow `#F8D347`, orange `#FF7A3D`, warm white `#FFFDFC` (Tailwind theme tokens already defined in `app/globals.css`).
- The hero's headline, subcopy, and CTA are Sunny's own copy (from the original brief): *"TU PRÓXIMA EXPERIENCIA EMPIEZA AQUÍ"*, not Baseline's tennis-club language.
- The "how it works" narrative uses Sunny's real three-step loop (Descubre → Reclama → Vive), and its three visuals are built from the app's own components (a mini experience card, a capacity indicator, the digital pass), not illustrations from the reference.
- The featured carousel and every "featured experience" card render **real rows from `experiences`/`businesses` in Supabase** — never invented placeholder content. If there is no `featured` row, it falls back to the soonest published, capacity-available experience (same rule already documented in `PRODUCT_SPEC.md §11`).
- Cards use rounded-corner editorial framing and a serif accent for titles, consistent with Sunny's existing typography system (Manrope + Newsreader) — no sharp corporate grid.
- Motion timings were kept inside the brief's own guardrails (200–800ms, no bounce, no infinite/ambient animation, one thing animating at a time on entry) rather than matching Baseline's specific curves.
- Smooth scroll (Lenis) and the intro loader are **intentionally not global** — they only wrap public marketing routes (see "Preserved" below), because the brief explicitly excludes account/reservation/admin screens from this treatment.

## What was discarded

- Baseline's exact color system, logo, photography, and copywriting — not reused in any form.
- Any single-file/static HTML approach — everything stays inside the existing Next.js App Router structure as typed React components.
- Membership/loyalty framing from Baseline's "state card" — Sunny has no memberships; that section was reinterpreted as the weekly-pass status, which is left for a later iteration (see "Not yet built" below) since it touches `/mi-pase` logic that this phase does not modify.
- Fake testimonials, fake stats, and invented "9K+"-style numbers — explicitly out of scope per the brief; not built in this phase.
- A from-scratch redesign of `/experiencias` filters, the categories index, the "selected experiences" triptych, the metrics section, and the footer rewrite — all real Baseline-inspired ideas in the brief, but the brief's own §19 phasing says not to touch the whole app at once. Only the items in "Primera iteración" are built now (see below).

## First iteration — what was actually built

1. **Session loader** (`components/motion/SessionLoader.tsx`) — shown once per `sessionStorage` session, ~700ms, slides up, skipped under `prefers-reduced-motion`, mounted only for public routes via `AppChrome`.
2. **Header** (`components/site/Header.tsx` + new `components/site/HeaderInteractive.tsx`) — transparent-over-hero on `/` only, solid everywhere else (no hero to sit over on other pages), solidifies on scroll, full-screen animated mobile menu via `components/motion/FullscreenMenu.tsx`.
3. **Home hero** (`components/home/Hero.tsx`) — full-bleed rounded photo, overlay, word-reveal title, staggered subcopy/CTA, parallax photo, real featured-experience card, scroll indicator.
4. **Featured experiences carousel** (`components/home/ExperienceCarousel.tsx`) — 3–5 real published/upcoming experiences, autoplay every 4.5s, pauses on hover and on hidden tab, arrows + dots, swipe on touch, crossfade, reduced-motion aware.
5. **"Cómo funciona" scroll narrative** (`components/home/HowItWorksNarrative.tsx`) — sticky text + advancing visual + vertical progress bar on desktop, stacked reveal-on-enter on mobile.
6. **Shared `ExperienceCard` upgrade** (`components/experience/ExperienceCard.tsx`) — hover lift, image zoom, animated arrow, still the same card used by the carousel, the home "featured" grid, and `/experiencias` — so the catalog benefits automatically without a separate rebuild this round.
7. **Experience detail page** (`app/experiencias/[slug]/page.tsx` + `components/experience/DetailHero.tsx`, `components/experience/AnimatedAccordion.tsx`) — parallax hero photo, progressively-revealed info sections, animated accordions for "qué incluye/requisitos/restricciones", sticky reservation panel on desktop, fixed bottom CTA bar on mobile, animated success state on claim (built on the **existing, unmodified** `ClaimPanel` logic).

## Not yet built (explicitly deferred, not forgotten)

Per the brief's own phasing instructions, these remain for a later pass and were **not** touched:
- `/admin` (any styling).
- `/mi-cuenta`, `/historial` (any styling).
- Email templates.
- `/experiencias` filter bar redesign (skeletons, sticky filters, animated filter chips) — cards there already inherit the new hover/zoom treatment for free.
- Categories editorial index, "selected experiences" triptych, metrics section, testimonials, `/para-negocios` modal conversion, footer rewrite.
- `/mi-pase` weekly-pass status redesign (§10 of the brief) — deferred because it requires touching the pass page, which is on the "do not modify yet" list for this iteration.

## What functionality was preserved (unchanged)

- Supabase schema, RLS policies, and every migration in `supabase/migrations/`.
- Magic-link authentication and the `/auth/callback` admin-bootstrap flow.
- The transactional `claim_reservation()` / `cancel_reservation()` Postgres functions and the capacity/weekly-pass rules they enforce.
- All Route Handlers under `app/api/**` (claim, cancel, admin actions, CSV export, `.ics`).
- The admin panel, its layout, and all its Server Actions.
- Email templates and the Resend/console-fallback send path.
- All existing routes, page URLs, and Zod validation schemas.
- Reservation/claim data flow on the detail page — the redesign only changes presentation around the existing `ClaimPanel` component and its states; the claim/cancel network calls and error-code mapping are untouched.

## Components added to the shared "movement system" (`components/motion/`)

`WordReveal`, `LineReveal`, `InViewReveal`, `ParallaxImage`, `HoverLift`, `AnimatedArrow`, `CarouselDots`, `FullscreenMenu`, `AnimatedModal`, `SmoothScrollProvider`, `SessionLoader`, `AppChrome` (route-based motion scoping). All respect `prefers-reduced-motion`, none block scroll, and hover-driven effects rely on Motion's pointer-based `whileHover`/CSS `group-hover`, which don't trigger from touch taps.
