-- Sunny MVP 1.1 — presentation columns (SAFE, additive)
--
-- This migration is deliberately separated from the group-reservation one
-- (20260201000100) because they carry very different risk. Everything here
-- is `add column` with a default, plus one widened CHECK constraint. No
-- function is redefined, no existing row changes meaning, and nothing
-- touches how capacity is enforced. It can be applied on its own, and the
-- app already runs correctly both before and after it (every new field is
-- read through lib/experience-flags.ts, which supplies the pre-migration
-- fallback).
--
-- The dangerous change — rewriting claim_reservation() to count people
-- instead of rows — lives in the NEXT migration and stays behind the
-- deployment barrier described in SUNNY_COMPANIONS_MIGRATION_PLAN.md.

begin;

-- Experiences ---------------------------------------------------------------

-- Curated by Sunny itself rather than by a partner space. Drives the
-- "Sunny Originals" section, which does not render at all while no
-- experience carries this flag.
alter table public.experiences
  add column if not exists is_original boolean not null default false;

-- Admin-chosen social modality keys. Validated in the application against
-- lib/social-modes.ts; unknown values are dropped at read time rather than
-- rendered, so a hand-edited row can never produce a bogus badge.
alter table public.experiences
  add column if not exists social_modes text[] not null default '{}';

-- Archiving keeps the row. Nothing in Sunny deletes historical records to
-- tidy a list: archived experiences leave the public catalogue and the
-- dashboard, and their reservations, folios and attendance stay intact.
alter table public.experiences
  add column if not exists archived_at timestamptz;

-- Optional perk the space offers after the experience (e.g. a discount on a
-- first month). Free text, shown only when present.
alter table public.experiences
  add column if not exists post_benefit text;

create index if not exists experiences_is_original_idx on public.experiences (is_original);
create index if not exists experiences_archived_at_idx on public.experiences (archived_at);

-- Note on `status`: it is intentionally NOT migrated to hold seven values.
-- `scheduled`, `sold_out`, `completed` and `archived` are all derivable
-- (claim_opens_at in the future, reserved >= capacity, ends_at in the past,
-- archived_at set) and are computed in lib/experience-flags.ts. Widening the
-- CHECK constraint would add two stored states that could disagree with the
-- data they are derived from — a class of bug worth avoiding.

-- Businesses ----------------------------------------------------------------

-- An active business does NOT become a public ally automatically
-- (decision 9 in SUNNY_MVP_1_1_DECISIONS.md): operating with Sunny and
-- agreeing to appear on the home page are different consents.
alter table public.businesses
  add column if not exists featured_as_partner boolean not null default false;

create index if not exists businesses_featured_as_partner_idx on public.businesses (featured_as_partner);

-- Partner leads -------------------------------------------------------------

alter table public.partner_leads
  add column if not exists internal_notes text;

alter table public.partner_leads
  add column if not exists converted_business_id uuid references public.businesses (id) on delete set null;

-- Widen the pipeline with `meeting` and `converted`. Done as drop + add
-- because Postgres cannot alter a CHECK in place. Safe: the new set is a
-- strict superset of the old one, so no existing row can fail it.
alter table public.partner_leads
  drop constraint if exists partner_leads_status_check;

alter table public.partner_leads
  add constraint partner_leads_status_check
  check (status in ('new', 'contacted', 'meeting', 'accepted', 'rejected', 'converted'));

commit;

-- Rollback ------------------------------------------------------------------
-- Additive, so reverting is mechanical. Note that dropping the columns
-- discards the flags Emmy has set (which experiences are Originals, which
-- businesses are public allies, which leads were archived-with-notes) —
-- that data is not recoverable, so prefer leaving the columns in place and
-- simply not using them.
--
-- begin;
-- alter table public.partner_leads drop constraint if exists partner_leads_status_check;
-- alter table public.partner_leads add constraint partner_leads_status_check
--   check (status in ('new', 'contacted', 'accepted', 'rejected'));
-- alter table public.partner_leads drop column if exists converted_business_id;
-- alter table public.partner_leads drop column if exists internal_notes;
-- drop index if exists businesses_featured_as_partner_idx;
-- alter table public.businesses drop column if exists featured_as_partner;
-- drop index if exists experiences_archived_at_idx;
-- drop index if exists experiences_is_original_idx;
-- alter table public.experiences drop column if exists post_benefit;
-- alter table public.experiences drop column if exists archived_at;
-- alter table public.experiences drop column if exists social_modes;
-- alter table public.experiences drop column if exists is_original;
-- commit;
