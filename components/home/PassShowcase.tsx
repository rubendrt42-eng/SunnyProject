import { LinkButton } from "@/components/ui/Button";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { formatDateShort, isPast, nextMondayLabel } from "@/lib/dates";
import { displayTitle } from "@/lib/demo-content";
import type { CurrentUser } from "@/lib/auth";
import type { Reservation } from "@/lib/database.types";
import type { ExperienceWithBusiness } from "@/lib/queries";

type ActiveWeekly = (Reservation & { experience: ExperienceWithBusiness }) | null;

/**
 * Four real states driven by the actual session/reservation — never a
 * static mockup. `used` covers a reservation whose experience already
 * happened (attended/no_show, or simply past `ends_at`); a *cancelled*
 * reservation isn't in this set at all (getActiveWeeklyReservation only
 * returns confirmed/attended/no_show), so cancelling naturally falls back
 * to the `available` state and the person can pick another experience.
 */
export function PassShowcase({ user, activeWeekly }: { user: CurrentUser | null; activeWeekly: ActiveWeekly }) {
  const isUsed = Boolean(activeWeekly) && (activeWeekly!.status !== "confirmed" || isPast(activeWeekly!.experience.ends_at));
  const isActive = Boolean(activeWeekly) && !isUsed;

  return (
    <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
      <InViewReveal>
        <p className="text-sm font-semibold tracking-widest text-sunny uppercase">Tu pase</p>

        {!user && (
          <>
            <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">Tu primer pase te espera.</h2>
            <p className="mt-4 max-w-md text-lg text-warm-white/75">
              Crea tu cuenta con tu correo y reclama un lugar gratuito cada semana. Sin contraseñas, sin costo.
            </p>
            <LinkButton href="/acceso" size="lg" variant="secondary" className="mt-8">
              Crear cuenta
            </LinkButton>
          </>
        )}

        {user && !activeWeekly && (
          <>
            <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">Tu pase de esta semana está disponible.</h2>
            <p className="mt-4 max-w-md text-lg text-warm-white/75">
              Elige una experiencia con cupo y tu pase queda listo al instante: folio, fecha y ubicación en &quot;Mi
              pase&quot;.
            </p>
            <LinkButton href="/experiencias" size="lg" variant="secondary" className="mt-8">
              Elegir experiencia
            </LinkButton>
          </>
        )}

        {isActive && activeWeekly && (
          <>
            <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">Ya tienes un lugar esta semana.</h2>
            <p className="mt-4 max-w-md text-lg text-warm-white/75">
              Reservaste <strong className="text-warm-white">{displayTitle(activeWeekly.experience.title)}</strong> para
              el {formatDateShort(activeWeekly.experience.starts_at)}. Presenta tu folio para entrar.
            </p>
            <LinkButton href="/mi-pase" size="lg" variant="secondary" className="mt-8">
              Ver mi pase
            </LinkButton>
          </>
        )}

        {isUsed && activeWeekly && (
          <>
            <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">Ya usaste tu pase de esta semana.</h2>
            <p className="mt-4 max-w-md text-lg text-warm-white/75">
              Tu próximo pase estará disponible el {nextMondayLabel()}. Mientras tanto, explora qué se viene.
            </p>
            <LinkButton href="/experiencias" size="lg" variant="outline" className="mt-8 border-warm-white/40 text-warm-white hover:bg-warm-white/10">
              Ver próximas experiencias
            </LinkButton>
          </>
        )}
      </InViewReveal>

      <InViewReveal delay={0.1}>
        <div className="mx-auto w-full max-w-sm rotate-1 rounded-2xl border border-warm-white/10 bg-warm-white/5 p-7 text-warm-white shadow-2xl backdrop-blur transition-transform duration-500 hover:rotate-0">
          <div className="flex items-center justify-between">
            <p className="font-serif text-lg italic">Sunny Project</p>
            <span className="rounded-full bg-sunny px-3 py-1 text-xs font-semibold text-carbon">
              {isActive ? "Confirmado" : isUsed ? "Usado" : user ? "Disponible" : "Bloqueado"}
            </span>
          </div>
          <div className="mt-8">
            <p className="text-xs tracking-widest text-warm-white/50 uppercase">{isUsed ? "Último folio" : "Folio"}</p>
            <p className="mt-1 font-mono text-2xl tracking-wide">
              {activeWeekly ? activeWeekly.folio : <span className="text-warm-white/35">Aún sin asignar</span>}
            </p>
          </div>
          <div className="mt-6 h-px w-full bg-warm-white/15" />
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-warm-white/50">Experiencia</dt>
              <dd className="truncate text-right">{activeWeekly ? displayTitle(activeWeekly.experience.title) : "Por elegir"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-warm-white/50">Fecha</dt>
              <dd>{activeWeekly ? formatDateShort(activeWeekly.experience.starts_at) : "Esta semana"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-warm-white/50">Estado</dt>
              <dd>{isActive ? "Listo para presentar" : isUsed ? "Experiencia disfrutada" : user ? "Esperando tu elección" : "Inicia sesión"}</dd>
            </div>
          </dl>
          <p className="mt-6 text-xs text-warm-white/50">
            {user ? "Cancela hasta 12 horas antes desde “Mi pase”." : "Inicia sesión para activar tu pase semanal."}
          </p>
        </div>
      </InViewReveal>
    </div>
  );
}
