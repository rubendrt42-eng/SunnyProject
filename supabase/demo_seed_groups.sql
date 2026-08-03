-- Sunny — demo group/presentation settings (idempotent)
--
-- Run this ONLY AFTER both MVP 1.1 migrations are applied:
--   20260201000000_experience_presentation.sql  (safe, additive)
--   20260201000100_group_reservations.sql       (see SUNNY_COMPANIONS_MIGRATION_PLAN.md)
--
-- Run supabase/demo_seed.sql first — that one creates the six demo
-- experiences and works against the un-migrated schema. This file only
-- adds the settings that need the new columns, so the two are separate on
-- purpose: you can refresh the demo content at any time without needing the
-- risky migration.
--
-- Safe to run repeatedly: every statement is an UPDATE keyed on slug.
--
-- After this runs, the Preview shows:
--   · the Sunny Originals section (Run & Coffee Social is flagged)
--   · social modality badges on the cards, quick view and detail page
--   · the "¿Cuántos lugares?" selector on the two experiences that allow it
--   · the intent selector matching on modality as well as category

begin;

-- Mat Pilates Intro — individual, beginner friendly, small group.
update public.experiences set
  max_party_size = 1,
  is_original = false,
  social_modes = array['solo', 'principiantes', 'grupo_pequeno'],
  post_benefit = '15% en tu primer paquete de clases'
where slug = 'mat-pilates-intro-demo';

-- Sunset Yoga — individual, come alone, meet people.
update public.experiences set
  max_party_size = 1,
  is_original = false,
  social_modes = array['solo', 'conocer', 'principiantes']
where slug = 'sunset-yoga-demo';

-- Coffee Tasting — allows one companion. Good plan for two.
update public.experiences set
  max_party_size = 2,
  is_original = false,
  social_modes = array['amigos', 'acompanante', 'grupo_pequeno'],
  post_benefit = 'Bolsa de café de 250g a precio de socio'
where slug = 'coffee-tasting-demo';

-- Pádel Mix-In — allows two companions; the format is literally about
-- meeting new people, and the attached photograph shows exactly that.
update public.experiences set
  max_party_size = 3,
  is_original = false,
  social_modes = array['solo', 'conocer', 'acompanante', 'principiantes']
where slug = 'padel-mixin-demo';

-- Recovery & Breathwork — individual, quiet.
update public.experiences set
  max_party_size = 1,
  is_original = false,
  social_modes = array['solo', 'grupo_pequeno']
where slug = 'recovery-breathwork-demo';

-- Run & Coffee Social — THE Sunny Original. Organised by Sunny itself,
-- allows companions, and is built around staying to talk afterwards.
update public.experiences set
  max_party_size = 3,
  is_original = true,
  social_modes = array['solo', 'conocer', 'amigos', 'acompanante', 'principiantes']
where slug = 'run-coffee-social-demo';

-- Public allies -------------------------------------------------------------
--
-- Deliberately NOT set here. `featured_as_partner` means "this business
-- agreed to appear on the public home page", and no such agreement exists
-- for the demo businesses — they are placeholders. Setting it would put
-- invented allies on the site, which brief §21 and §37 both forbid.
--
-- To see the section during a demo, flip a business from the panel
-- (Negocios → Mostrar como aliado). Be aware the demo businesses have no
-- real logo, so the card falls back to the name set in type.

commit;

-- Verification: every demo experience should list its settings.
-- select slug, max_party_size, is_original, social_modes
-- from public.experiences
-- where slug like '%-demo'
-- order by slug;
