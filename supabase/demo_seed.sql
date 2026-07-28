-- Sunny Project — demo seed (idempotent)
--
-- Six demo businesses + experiences, clearly marked "[Demostración]" in
-- their title/description (the UI shows this as a "Demostración" badge —
-- see lib/demo-content.ts). Safe to paste into the Supabase SQL Editor
-- and run more than once: every insert upserts on `slug`, and dates are
-- computed relative to `now()` each time it runs, so re-running this
-- refreshes the demo experiences back into the future instead of
-- creating duplicates or leaving them stuck in the past.
--
-- Mirrors scripts/seed.ts exactly. Requires the migrations in
-- supabase/migrations/ to already be applied (this does not create any
-- tables, columns, or policies).
--
-- This is also the idempotent fix for stale `image_url` values on rows
-- that already exist in production: every insert below is `on conflict
-- (slug) do update set ... image_url = excluded.image_url, ...`, so
-- re-running this script re-asserts the correct /demo-assets/*.webp path
-- on each of the 6 demo experiences without creating duplicates.

begin;

insert into public.businesses (name, slug, description, category, active, contact_name, contact_email, logo_url)
values
  ('Studio Norte', 'studio-norte', 'Estudio boutique de movimiento en San Pedro. [Demostración]', 'movimiento', true, 'Studio Norte Team', 'hola@studionorte.demo', '/images/placeholder-1.svg'),
  ('Reset Lab', 'reset-lab', 'Laboratorio de recovery y bienestar en Monterrey. [Demostración]', 'recovery', true, 'Reset Lab Team', 'hola@resetlab.demo', '/images/placeholder-2.svg'),
  ('Casa Clara', 'casa-clara', 'Café de especialidad en Barrio Antiguo. [Demostración]', 'food_coffee', true, 'Casa Clara Team', 'hola@casaclara.demo', '/images/placeholder-3.svg'),
  ('Agua Club', 'agua-club', 'Club de actividades acuáticas en Santiago. [Demostración]', 'outdoor', true, 'Agua Club Team', 'hola@aguaclub.demo', '/images/placeholder-4.svg'),
  ('Norte Run Club', 'norte-run-club', 'Comunidad de corredores en San Pedro. [Demostración]', 'comunidad', true, 'Norte Run Club Team', 'hola@norterunclub.demo', '/images/placeholder-1.svg'),
  ('Lumen Studio', 'lumen-studio', 'Estudio de yoga y movimiento consciente en Monterrey. [Demostración]', 'movimiento', true, 'Lumen Studio Team', 'hola@lumenstudio.demo', '/images/placeholder-2.svg')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  active = excluded.active,
  contact_name = excluded.contact_name,
  contact_email = excluded.contact_email,
  logo_url = excluded.logo_url,
  updated_at = now();

insert into public.experiences (
  business_id, title, slug, short_description, description, category, image_url,
  location_name, address, maps_url, starts_at, ends_at, claim_opens_at, claim_closes_at,
  capacity, status, featured, what_is_included, requirements, restrictions, instructions
)
values
  (
    (select id from public.businesses where slug = 'studio-norte'),
    'Pilates Reformer Intro [Demostración]',
    'pilates-reformer-intro-demo',
    'Clase introductoria de pilates reformer para todos los niveles.',
    'Clase introductoria de pilates reformer para personas que quieren probar el método por primera vez. Experiencia de demostración para Sunny Project.',
    'movimiento',
    '/demo-assets/pilates.webp',
    'Studio Norte — San Pedro',
    'Av. Gómez Morín 1000, San Pedro Garza García',
    'https://maps.google.com/?q=Studio+Norte+San+Pedro',
    date_trunc('day', now()) + interval '3 days' + interval '9 hours',
    date_trunc('day', now()) + interval '3 days' + interval '10 hours',
    now(),
    date_trunc('day', now()) + interval '3 days' + interval '9 hours',
    10,
    'published',
    true,
    array['Clase guiada de 50 minutos', 'Uso de reformer', 'Agua de cortesía'],
    array['Ropa cómoda', 'Llegar 10 minutos antes'],
    array['No recomendado si tienes una lesión reciente sin autorización médica'],
    'Preséntate en recepción con tu nombre y folio 10 minutos antes de la clase.'
  ),
  (
    (select id from public.businesses where slug = 'reset-lab'),
    'Recovery Contrast Session [Demostración]',
    'recovery-contrast-session-demo',
    'Sesión guiada de sauna, baño frío y movilidad.',
    'Sesión guiada de sauna, baño frío y movilidad para recuperación física. Experiencia de demostración para Sunny Project.',
    'recovery',
    '/demo-assets/recovery.webp',
    'Reset Lab — Monterrey',
    'Av. Constitución 500, Monterrey Centro',
    'https://maps.google.com/?q=Reset+Lab+Monterrey',
    date_trunc('day', now()) + interval '4 days' + interval '18 hours',
    date_trunc('day', now()) + interval '4 days' + interval '19 hours',
    now(),
    date_trunc('day', now()) + interval '4 days' + interval '18 hours',
    8,
    'published',
    false,
    array['Sauna', 'Baño frío', 'Movilidad guiada'],
    array['Traje de baño', 'Toalla'],
    array['No recomendado para personas con condiciones cardiacas sin autorización médica'],
    'Llega con traje de baño puesto. Los casilleros están disponibles en recepción.'
  ),
  (
    (select id from public.businesses where slug = 'casa-clara'),
    'Coffee Tasting [Demostración]',
    'coffee-tasting-demo',
    'Degustación guiada de tres cafés de especialidad.',
    'Degustación guiada de tres cafés de especialidad y explicación de sus procesos. Experiencia de demostración para Sunny Project.',
    'food_coffee',
    '/demo-assets/coffee.webp',
    'Casa Clara — Barrio Antiguo',
    'Calle Padre Mier 300, Barrio Antiguo, Monterrey',
    'https://maps.google.com/?q=Casa+Clara+Barrio+Antiguo',
    date_trunc('day', now()) + interval '2 days' + interval '17 hours',
    date_trunc('day', now()) + interval '2 days' + interval '18 hours',
    now(),
    date_trunc('day', now()) + interval '2 days' + interval '17 hours',
    12,
    'published',
    false,
    array['Tres cafés', 'Explicación de notas de cata', 'Snack ligero'],
    array[]::text[],
    array['No recomendado para menores de edad por horario nocturno'],
    'Pregunta por la mesa de degustación de Sunny Project al llegar.'
  ),
  (
    (select id from public.businesses where slug = 'agua-club'),
    'Sunrise Paddle [Demostración]',
    'sunrise-paddle-demo',
    'Paddle board al amanecer con equipo e introducción para principiantes.',
    'Experiencia de paddle board al amanecer con equipo e introducción para principiantes. Experiencia de demostración para Sunny Project.',
    'outdoor',
    '/demo-assets/paddle.webp',
    'Agua Club — Santiago',
    'Presa La Boca, Santiago, Nuevo León',
    'https://maps.google.com/?q=Presa+La+Boca+Santiago',
    date_trunc('day', now()) + interval '6 days' + interval '7 hours',
    date_trunc('day', now()) + interval '6 days' + interval '9 hours',
    now(),
    date_trunc('day', now()) + interval '6 days' + interval '7 hours',
    8,
    'published',
    false,
    array['Tabla', 'Remo', 'Chaleco', 'Instrucción inicial'],
    array['Saber nadar', 'Ropa que pueda mojarse'],
    array['No recomendado para personas que no saben nadar'],
    'Llega al muelle principal de Agua Club 15 minutos antes del amanecer.'
  ),
  (
    (select id from public.businesses where slug = 'norte-run-club'),
    'Run & Coffee Social [Demostración]',
    'run-coffee-social-demo',
    'Carrera social de 5 km seguida de café y convivencia.',
    'Carrera social de cinco kilómetros seguida de café y convivencia. Experiencia de demostración para Sunny Project.',
    'comunidad',
    '/demo-assets/run-club.webp',
    'Norte Run Club — San Pedro',
    'Parque Fundidora Sur, San Pedro Garza García',
    'https://maps.google.com/?q=San+Pedro+Garza+Garcia',
    date_trunc('day', now()) + interval '5 days' + interval '7 hours',
    date_trunc('day', now()) + interval '5 days' + interval '8 hours',
    now(),
    date_trunc('day', now()) + interval '5 days' + interval '7 hours',
    20,
    'published',
    false,
    array['Ruta guiada', 'Hidratación', 'Café al terminar'],
    array['Poder completar 5 km', 'Llegar 15 minutos antes'],
    array['Ritmo social, no competitivo'],
    'Punto de encuentro en la entrada principal del parque. Busca la manta de Sunny Project.'
  ),
  (
    (select id from public.businesses where slug = 'lumen-studio'),
    'Sunset Yoga [Demostración]',
    'sunset-yoga-demo',
    'Clase de yoga al atardecer para todos los niveles.',
    'Clase de yoga al atardecer para todos los niveles. Experiencia de demostración para Sunny Project.',
    'movimiento',
    '/demo-assets/yoga.webp',
    'Lumen Studio — Monterrey',
    'Av. Chepevera 250, Monterrey',
    'https://maps.google.com/?q=Lumen+Studio+Monterrey',
    date_trunc('day', now()) + interval '7 days' + interval '19 hours',
    date_trunc('day', now()) + interval '7 days' + interval '20 hours',
    now(),
    date_trunc('day', now()) + interval '7 days' + interval '19 hours',
    12,
    'published',
    false,
    array['Clase guiada', 'Tapete', 'Agua'],
    array['Ropa cómoda'],
    array['No recomendado si tienes una lesión reciente sin autorización médica'],
    'El tapete se presta en recepción; devuélvelo al terminar la clase.'
  )
on conflict (slug) do update set
  business_id = excluded.business_id,
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  category = excluded.category,
  image_url = excluded.image_url,
  location_name = excluded.location_name,
  address = excluded.address,
  maps_url = excluded.maps_url,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  claim_opens_at = excluded.claim_opens_at,
  claim_closes_at = excluded.claim_closes_at,
  capacity = excluded.capacity,
  status = excluded.status,
  featured = excluded.featured,
  what_is_included = excluded.what_is_included,
  requirements = excluded.requirements,
  restrictions = excluded.restrictions,
  instructions = excluded.instructions,
  updated_at = now();

commit;

-- Sanity check: run this select after the block above to confirm counts.
-- select
--   (select count(*) from public.businesses) as total_businesses,
--   (select count(*) from public.experiences) as total_experiences,
--   (select count(*) from public.experiences where status = 'published') as published_experiences;
