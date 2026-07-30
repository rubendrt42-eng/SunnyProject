import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PartnerLeadForm } from "@/components/site/PartnerLeadForm";
import { BUSINESS_SPACE_PHOTO } from "@/lib/media";

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
          <p className="eyebrow">Para negocios</p>
          {/* `title` y no `display`: esta página reparte el ancho con el
              formulario, y a 76 px el titular se partía en cinco líneas. La
              regla es que `display` solo se usa cuando el encabezado dispone
              del ancho completo del contenedor. */}
          <h1 className="mt-3 text-title">Haz que nuevas personas descubran tu espacio.</h1>
          <p className="mt-4 text-lg text-gray">
            Comparte algunos lugares, conecta con clientes potenciales y forma parte de la selección de Sunny
            Project.
          </p>

          {/* La página no tenía ni una fotografía, mientras que su resumen en
              el Home sí. Es la misma imagen ya aprobada de `lib/media.ts`:
              muestra un espacio genérico, no el local de un negocio con
              nombre. */}
          <div className="relative mt-10 aspect-[3/2] w-full overflow-hidden rounded-xl bg-carbon/5">
            <Image
              src={BUSINESS_SPACE_PHOTO.src}
              alt={BUSINESS_SPACE_PHOTO.alt}
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="mt-10 flex flex-col gap-8">
            {BENEFITS.map((b) => (
              <div key={b.title}>
                <h2 className="text-heading">{b.title}</h2>
                <p className="mt-1 text-gray">{b.body}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 text-small text-gray">
            No necesitas crear una cuenta. Nuestro equipo revisa cada solicitud y publica la experiencia por ti.
          </p>
        </div>

        <div className="rounded-xl border border-carbon/10 bg-warm-white p-8">
          <h2 className="text-heading">Cuéntanos de tu negocio</h2>
          <div className="mt-6">
            <PartnerLeadForm />
          </div>
        </div>
      </Container>
    </main>
  );
}
