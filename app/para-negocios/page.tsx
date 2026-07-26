import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PartnerLeadForm } from "@/components/site/PartnerLeadForm";

export const metadata: Metadata = { title: "Para negocios — Sunny Project" };

const BENEFITS = [
  { title: "Exposición local", body: "Nuevas personas descubren tu espacio cada semana a través de nuestra curaduría." },
  { title: "Sin comisiones", body: "En esta etapa no cobramos comisión por los lugares que compartas." },
  { title: "Tú decides el cupo", body: "Tú defines cuántos lugares ofreces y cuándo." },
];

export default function ParaNegociosPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="grid gap-16 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl italic sm:text-5xl">Haz que nuevas personas descubran tu espacio.</h1>
          <p className="mt-4 text-lg text-gray">
            Comparte algunos lugares, conecta con clientes potenciales y forma parte de la selección de Sunny
            Project.
          </p>

          <div className="mt-10 flex flex-col gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <h2 className="text-lg font-semibold">{b.title}</h2>
                <p className="mt-1 text-gray">{b.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-gray">
            No necesitas crear una cuenta. Nuestro equipo revisa cada solicitud y publica la experiencia por ti.
          </p>
        </div>

        <div className="rounded-2xl border border-carbon/10 bg-warm-white p-8">
          <h2 className="text-xl font-semibold">Cuéntanos de tu negocio</h2>
          <div className="mt-6">
            <PartnerLeadForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
