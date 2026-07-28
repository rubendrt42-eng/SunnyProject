# Visual correction plan — Sunny Project

Pre-implementation plan for the visual correction pass requested on top of the previous redesign iteration. No product logic, schema, or routes change here — this is presentation-layer only, per the brief.

## 0. What triggered this pass

The last iteration fixed structure (hero, sections order, quick view, dynamic pass) but still reads as an AI-generated prototype: an abstract color-blob "video," fake generated illustrations standing in for photography, an oversaturated full-bleed yellow section, oversized pill radii on almost everything, and decorative abstract icon work. This plan fixes the *visual system*, not the structure.

## 1. Fundamental asset rule (binding for this whole pass)

**No new imagery, illustrations, gradients, abstract video, or "artistic" placeholders are generated in this pass.** The user supplies real, licensed files. Where a file doesn't exist yet, the UI must show a **neutral, honest "missing asset" state** — flat background, a small functional icon, and the exact filename that's missing — never a substitute illustration or invented photo/video.

Concretely: the 6 fake generated `.webp` "illustrations" from the previous phase (`pilates.webp`, `recovery.webp`, `coffee.webp`, `paddle.webp`, `run-club.webp`, `yoga.webp`) and the abstract `hero-reel.mp4` / `hero-poster.webp` I generated last iteration **are deleted in this pass**. They are exactly the thing this correction is against — keeping them at those filenames would make the "missing asset" detection lie (the file would "exist" and load, but still be fake). After deletion, `/public/demo-assets/` is empty until real files are dropped in with the exact names below; the app is built to handle that emptiness gracefully everywhere a photo/video is used.

### Expected filenames (all under `/public/demo-assets/`)
`hero-reel.mp4`, `hero-poster.webp`, `pilates.webp`, `recovery.webp`, `coffee.webp`, `paddle.webp`, `run-club.webp`, `yoga.webp`, `community.webp`, `business-partner.webp`.

### How "missing" detection works
- `lib/assets.server.ts` (`server-only`): `listAvailableDemoAssets()` — one `readdirSync` of `/public/demo-assets` per request, returns `[]` if the directory doesn't exist (never throws).
- `lib/demo-assets.ts` (isomorphic, no `server-only`): `resolveExperienceImage(url, availableAssets)` — pure function, matches a `/demo-assets/<file>` URL against the available-file list; URLs outside that folder (a future real CDN link) are trusted as-is and never flagged "missing."
- Every server page that renders a photo/video calls `listAvailableDemoAssets()` once and passes the plain string array down as a prop — this keeps the filesystem check server-only while letting client components (`ThisWeekSection`, `QuickView`, `CategoriesSection`, the hero rotator) do the same resolution with the same pure function, no client-side `fs` access needed.
- `components/ui/ManagedPhoto.tsx` — the single component that renders a photo everywhere in the app. Given a real, present file it renders `next/image`; given a missing one it renders a flat `bg-carbon/[0.04]` box with a small "image-off" icon and `Falta <filename>` (or `Sin fotografía` if there was no URL at all). One component, one behavior, used by every card/hero/drawer.
- The hero video gets the same treatment: if `hero-reel.mp4`/`hero-poster.webp` aren't present, the hero renders a flat carbon background with white text (still fully legible, still on-brand) and a small discreet corner note naming the missing file, instead of a `<video>` pointing at nothing.

## 2. Components that change

| File | Change |
|---|---|
| `lib/assets.server.ts` (new) | `listAvailableDemoAssets()` |
| `lib/demo-assets.ts` (new) | `resolveExperienceImage()`, `demoAssetFilename()` |
| `components/ui/ManagedPhoto.tsx` (new) | Shared photo/missing-state renderer |
| `components/ui/Button.tsx` | New 3-tier system: primary (sunny fill, 50px/12px radius), secondary (bordered, 12px radius, not oval — absorbs the old `outline` look), ghost (text-only, becomes the "botón textual" tier) |
| `components/ui/Badge.tsx` | Smaller padding/font — capsules stay, but shrink |
| `components/home/Hero.tsx` | Real video/poster with missing-state fallback, no corner rounding, no abstract overlays |
| `components/home/HeroExperienceRotator.tsx` (new) | Replaces the static `HeroFeaturedCard` — 4–5 upcoming experiences, 4.5s auto-advance, arrows/dots/swipe, hover+tab-hidden pause, reduced-motion aware, opens the existing `QuickView` |
| `components/home/HeroFeaturedCard.tsx` | Deleted — superseded by the rotator's card |
| `components/home/CategoriesSection.tsx` | Stable per-category cover photo (`pilates.webp`/`recovery.webp`/`coffee.webp`/`paddle.webp`/`community.webp`) via `ManagedPhoto` instead of deriving from whichever experience happens to exist |
| `components/home/ForBusinessSection.tsx` | `business-partner.webp` via `ManagedPhoto` |
| `components/home/HowItWorksNarrative.tsx` | Section background moves out of this component (page-level fix below); inactive-step opacity 0.3 → 0.55; step visuals rebuilt as small real-product snippets (real card with `ManagedPhoto`, real cupos/CTA snippet, real folio card) instead of abstract color blocks |
| `app/page.tsx` | "Cómo funciona" section background: sunny → warm-white/ivory with yellow/orange used only as accents; passes `availableAssets` down to every section that needs it |
| `components/experience/ExperienceCard.tsx`, `FeaturedExperienceCard.tsx` | `ManagedPhoto` instead of raw `next/image` |
| `components/experience/DetailHero.tsx` | Full-bleed real photo via `ManagedPhoto`, no section rounding, smaller/width-capped title, top metadata as a clean icon+text line (Lucide icons) instead of capsules |
| `components/experience/QuickView.tsx` | `ManagedPhoto`, Lucide close icon, smaller radii |
| `components/home/ThisWeekSection.tsx` | `ManagedPhoto`, radius/microinteraction tuning (max lift −3px, max zoom 1.02, tap scale 0.98) |
| `app/experiencias/page.tsx`, `app/experiencias/[slug]/page.tsx` | Fetch and pass `availableAssets` |
| `components/motion/AnimatedArrow.tsx` | Kept as-is (already a minimal functional arrow, not an "illustration") |
| new: Lucide icons for Calendar/Clock/MapPin/Users/X/ChevronLeft/ChevronRight/ImageOff | `lucide-react` added as a real dependency |

## 3. Assets required from you

Drop these into `/public/demo-assets/` with these exact names — nothing else needs to change, every path in the code already points here:

- `hero-reel.mp4` — real footage, 12–18s, muted, no logos/faces-as-brand, H.264, reasonably compressed.
- `hero-poster.webp` — a representative still (ideally the video's own first frame).
- `pilates.webp`, `recovery.webp`, `coffee.webp`, `paddle.webp`, `run-club.webp`, `yoga.webp` — one real photo per seeded experience (see mapping below).
- `community.webp` — a general "Comunidad" category cover (used by the categories section, independent of any one experience).
- `business-partner.webp` — used on the Home "Para negocios" section.

## 4. `image_url` review — no drift found, but here's the idempotent fix path anyway

I checked `scripts/seed.ts` and `supabase/demo_seed.sql` against the requested mapping — **they already match exactly**:

| Experience | `image_url` |
|---|---|
| Pilates Reformer Intro | `/demo-assets/pilates.webp` |
| Recovery Contrast Session | `/demo-assets/recovery.webp` |
| Coffee Tasting | `/demo-assets/coffee.webp` |
| Sunrise Paddle | `/demo-assets/paddle.webp` |
| Run & Coffee Social | `/demo-assets/run-club.webp` |
| Sunset Yoga | `/demo-assets/yoga.webp` |

So there's no bad data to fix — the problem was always the *file contents* at those paths (fake generated illustrations), not the URLs pointing to them. `supabase/demo_seed.sql` is **already the idempotent script this task asks for**: every insert is `on conflict (slug) do update set ... image_url = excluded.image_url, ...`, so re-running it in the Supabase SQL Editor re-asserts the correct `image_url` on the existing rows (and refreshes the demo dates back into the future) without creating duplicates. I'm adding one clarifying comment line to that file rather than writing a redundant new script. Exact instructions are in the final report.

## 5. New button system

- **Primary** (main action): `h-[50px]`, `rounded-xl` (12px), `px-6` (24px), `bg-sunny text-carbon`, hover darkens fill slightly + optional trailing arrow nudges 4px (opt-in via a new `arrow` prop, not forced onto every button — form-submit buttons like "Guardar" don't get one).
- **Secondary**: `rounded-xl`, subtle `border-carbon/25`, transparent fill, hover firms up the border — this is what `variant="outline"` already looked like, so `outline` becomes an alias and every existing `outline` call site is unaffected.
- **Ghost / text button**: no container, text + small arrow, optional underline on hover.
- Current `variant="secondary"` call sites (Hero CTA, the 3 pass-showcase CTAs, the header's transparent-state CTA, the closing-section CTA) are switched to `primary` — they were always meant to be the strong, self-contained, sunny-filled action; "secondary" was the wrong label for them, not the wrong look.
- Badges (category/availability/state/"Demostración") keep their capsule shape but shrink padding/font.

## 6. Radius system

- Buttons & inputs: 12px (`rounded-xl`).
- Small cards (list rows, badges' containers): 16px (`rounded-2xl`).
- Large cards (featured/hero cards): 20px (`rounded-[20px]`).
- Modals / drawer / bottom sheet: 24px (`rounded-3xl`, top corners only on the sheet).
- Full-bleed sections (hero, detail hero): **no rounding** — the `rounded-b-[2rem] sm:rounded-b-[3rem]` on both heroes is removed.

## 7. Palette per section (unchanged from the last iteration except "Cómo funciona")

Hero: dark video, white text. Esta semana en Sunny: ivory. **Cómo funciona: warm-white/ivory, not full-bleed sunny — yellow and orange are accents only (numerals, progress line).** Categorías: warm/sand, photo-led. Pase semanal: carbon, warm-white text, yellow accents. Para negocios: soft desaturated orange. Footer: carbon.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Redefining what "primary"/"secondary" mean visually could look inconsistent mid-migration | Grepped every call site first (§5) — every `secondary` usage today is already meant to be a strong CTA, so relabeling them `primary` is a rename, not a redesign of those specific spots. |
| Deleting the 6 illustration webps makes every experience card show "missing" until you add real photos | Intentional and requested — the alternative (leaving fake illustrations live) is exactly the problem being corrected. `ManagedPhoto`'s missing-state is designed to look like a deliberate, calm empty state, not a broken page. |
| Hero rotator duplicating `QuickView`'s mount (it already mounts once inside `ThisWeekSection`) | Each section mounts its own `QuickView` instance — the component is fully self-contained (its own open/closed state, its own history entry), so two independent instances on one page don't conflict; only one is ever open at a time in practice. |
| `lucide-react` is a new dependency | Small, tree-shakeable, MIT-licensed, no runtime cost beyond the icons actually imported. |
| Adding `availableAssets` prop-drilling touches many files | Mechanical, one prop, computed once per page — no behavior change to anything already working. |

## 9. Explicitly not touched (still out of scope)

Supabase schema/RLS/RPCs, auth flow, `ClaimPanel`/reservation logic, admin panel, `/mi-cuenta`, `/historial` design, Quick View's open/close/history mechanics (only its inner photo/icon rendering changes).
