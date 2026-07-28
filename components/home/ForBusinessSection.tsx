import Image from "next/image";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { PartnerLeadModal } from "@/components/site/PartnerLeadModal";

const STEPS = [
  { number: "01", title: "Comparte algunos cupos", body: "Ofrece un puñado de lugares en tus horarios de menor demanda." },
  { number: "02", title: "Conecta con personas nuevas", body: "Personas que buscan probar algo distinto llegan directo a tu negocio." },
  { number: "03", title: "Convierte visitas en clientes", body: "La primera visita la trae Sunny; que regresen depende de ti." },
] as const;

/**
 * Trimmed pitch, not the full form — the form only appears once someone
 * commits via PartnerLeadModal, so this section stays scannable.
 */
export function ForBusinessSection() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <InViewReveal>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image src="/demo-assets/run-club.webp" alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </InViewReveal>

      <InViewReveal delay={0.1}>
        <h2 className="text-3xl font-semibold sm:text-4xl">Haz que nuevas personas descubran tu espacio.</h2>
        <p className="mt-4 max-w-md text-lg text-carbon/70">
          Comparte algunos lugares, conecta con clientes potenciales y forma parte de la selección de Sunny Project.
        </p>

        <div className="mt-8 flex flex-col gap-5">
          {STEPS.map((step) => (
            <div key={step.number} className="flex gap-4">
              <span className="text-sm font-semibold text-orange">{step.number}</span>
              <div>
                <p className="font-medium text-carbon">{step.title}</p>
                <p className="mt-0.5 text-sm text-carbon/60">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <PartnerLeadModal />
        </div>
      </InViewReveal>
    </div>
  );
}
