-- Sunny — marca explícita de contenido de demostración
--
-- SEGURA e idempotente. Añade una columna con valor por defecto, rellena el
-- estado actual a partir del título y no toca nada más. Sin cambios de
-- función, sin cambios de política, sin borrados.
--
-- POR QUÉ EXISTE
--
-- El badge «Demostración» dependía solo de que el título terminase en
-- "[Demostración]". Eso significa que el badge desaparece en cuanto alguien
-- edita el título, aunque la experiencia siga siendo de prueba — y al revés:
-- una experiencia real copiada de una de demo lo arrastra sin querer.
--
-- Antes de abrir a usuarios reales hace falta un interruptor del que alguien
-- se haga responsable, no una convención de texto.
--
-- `lib/demo-content.ts` ya prefiere esta columna cuando existe y cae al
-- sufijo cuando no, así que el sitio es correcto antes y después de aplicar
-- esto.

begin;

alter table public.experiences
  add column if not exists is_demo boolean not null default false;

comment on column public.experiences.is_demo is
  'Contenido de demostración. Controla el badge «Demostración» en la interfaz pública.';

-- Refleja el estado actual: lo que hoy lleva el sufijo queda marcado.
update public.experiences
   set is_demo = true
 where is_demo = false
   and title ~* '\[Demostraci[oó]n\]\s*$';

commit;

-- Verificación:
-- select count(*) filter (where is_demo) as demo,
--        count(*) filter (where not is_demo) as reales
--   from public.experiences;
--
-- Para vaciar la demostración antes de abrir, una vez cargadas las reales:
-- delete from public.experiences where is_demo;
