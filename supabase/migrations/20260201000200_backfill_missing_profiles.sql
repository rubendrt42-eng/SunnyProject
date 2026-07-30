-- Sunny — backfill profiles for accounts that predate the profile trigger
--
-- SAFE and idempotent. One INSERT ... SELECT ... ON CONFLICT DO NOTHING. No
-- schema change, no function change, no existing row modified.
--
-- WHY THIS EXISTS
--
-- `public.profiles` rows are created by the `on_auth_user_created` trigger
-- (supabase/migrations/20260101000100_profiles.sql). Any account created
-- BEFORE that migration was applied has no profile row and nothing heals it,
-- because nothing in the app inserted one — `bootstrapAdminRole()` only ran
-- an UPDATE, which matches zero rows and fails silently.
--
-- The consequences are severe and look nothing like their cause:
--   · getCurrentUser() returns `profile: null`
--   · requireAdmin() refuses /admin, so the panel is unreachable forever
--   · isProfileComplete() is false, so claim_reservation() raises
--     PROFILE_INCOMPLETE (or PROFILE_NOT_FOUND) on every attempt
--
-- The account can sign in perfectly — Supabase records `action: "login"` —
-- and still be unable to do anything. From the user's side it is
-- indistinguishable from "login is broken", which is how it was reported.
--
-- This was real on this project: 1 row in auth.users, 0 rows in
-- public.profiles, with four successful logins in the Auth logs.
--
-- Only `id` is inserted. `full_name` and the consent timestamps
-- (`adult_confirmed_at`, `terms_accepted_at`) are deliberately left NULL:
-- they belong to the user and are captured by ProfileCompletionForm. Writing
-- a consent on someone's behalf would be fabricating it, and the reservation
-- guard is supposed to stop until they give it.
--
-- `role` is NOT set here either — it defaults to 'user'. Granting admin is a
-- separate, deliberate act (ADMIN_EMAIL on login, or an explicit UPDATE).

begin;

insert into public.profiles (id)
select u.id
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

commit;

-- Verification — both counts should match after this runs:
-- select (select count(*) from auth.users) as usuarios,
--        (select count(*) from public.profiles) as perfiles;
