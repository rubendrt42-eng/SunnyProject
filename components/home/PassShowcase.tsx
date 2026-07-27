import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { InViewReveal } from "@/components/motion/InViewReveal";

export function PassShowcase() {
  return (
    <section className="border-y border-carbon/10 bg-warm-white py-20 sm:py-28">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <InViewReveal>
          <p className="text-sm font-semibold tracking-widest text-orange uppercase">Tu pase</p>
          <h2 className="mt-2 font-serif text-4xl italic sm:text-5xl">Siempre contigo, siempre gratis.</h2>
          <p className="mt-4 max-w-md text-lg text-gray">
            En cuanto reclamas tu lugar, tu pase queda listo en &quot;Mi pase&quot;: folio, fecha, ubicación e
            instrucciones. Solo preséntate con tu nombre.
          </p>
          <LinkButton href="/experiencias" size="lg" className="mt-8">
            Explorar experiencias
          </LinkButton>
        </InViewReveal>

        <InViewReveal delay={0.1}>
          <div className="mx-auto w-full max-w-sm rotate-1 rounded-2xl border border-carbon/10 bg-carbon p-7 text-warm-white shadow-2xl transition-transform duration-500 hover:rotate-0">
            <div className="flex items-center justify-between">
              <p className="font-serif text-lg italic">Sunny Project</p>
              <span className="rounded-full bg-sunny px-3 py-1 text-xs font-semibold text-carbon">Confirmado</span>
            </div>
            <div className="mt-8">
              <p className="text-xs tracking-widest text-warm-white/60 uppercase">Folio</p>
              <p className="mt-1 font-mono text-2xl tracking-wide">SUN-2026-XXXXXX</p>
            </div>
            <div className="mt-6 h-px w-full bg-warm-white/15" />
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-warm-white/60">Experiencia</dt>
                <dd>Tu próxima experiencia</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-white/60">Fecha</dt>
                <dd>Esta semana</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-warm-white/60">Estado</dt>
                <dd>Listo para presentar</dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-warm-white/60">Cancela hasta 12 horas antes desde &quot;Mi pase&quot;.</p>
          </div>
        </InViewReveal>
      </Container>
    </section>
  );
}
