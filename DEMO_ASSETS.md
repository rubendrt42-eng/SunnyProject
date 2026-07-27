# Demo assets

`/public/demo-assets/*.webp` are used by the six seed experiences (`scripts/seed.ts`).

## Why these are placeholders, not Pexels/Unsplash photos

This build environment has no outbound network access to `images.pexels.com` or `images.unsplash.com` (blocked by the sandbox's egress policy — verified, not assumed). Per the fallback instruction given for this task, real stock photography was **not** downloaded or hotlinked. Instead, each file is a generated, properly-dimensioned (1600×1000) `.webp` — an editorial gradient in Sunny's own palette (ivory/carbon/sunny yellow/orange/warm white) with a simple line icon and the experience's name, generated locally with `scripts/generate-demo-assets.mjs` (not a project dependency — run manually, once, with `node scripts/generate-demo-assets.mjs`).

**These are not photographs of real businesses or people.** No Pexels/Unsplash/Pinterest/Instagram/Google Images content was used anywhere.

## Files

| File | Experience | Source | Author | License |
|---|---|---|---|---|
| `pilates.webp` | Pilates Reformer Intro | Generated locally (gradient + icon, Sunny palette) | — | N/A — original generated asset, no external license |
| `recovery.webp` | Recovery Contrast Session | Generated locally | — | N/A |
| `coffee.webp` | Coffee Tasting | Generated locally | — | N/A |
| `paddle.webp` | Sunrise Paddle | Generated locally | — | N/A |
| `run-club.webp` | Run & Coffee Social | Generated locally | — | N/A |
| `yoga.webp` | Sunset Yoga | Generated locally | — | N/A |

## What to replace before a real launch

Swap each file above for a real, properly-licensed photo before inviting real users:

1. **Pexels** ([pexels.com](https://pexels.com)) or **Unsplash** ([unsplash.com](https://unsplash.com)) — both free-to-use, no attribution legally required (but crediting the photographer is good practice).
2. Search terms that fit each experience: `pilates reformer studio`, `sauna cold plunge recovery`, `coffee tasting specialty`, `stand up paddle board sunrise`, `running club group morning`, `sunset yoga class outdoor`.
3. Download at ≥1600×1000, export/convert to `.webp`, and replace the matching file in `/public/demo-assets/` **keeping the same filename** — no code changes needed since `scripts/seed.ts` references these paths.
4. Update the table above with the real file/source/author/license once replaced.

## Regenerating the placeholders

```bash
node scripts/generate-demo-assets.mjs
```

Requires `sharp`, which is already present transitively (Next.js's image optimizer depends on it) — this script is a one-off tool, not added to `package.json`.
