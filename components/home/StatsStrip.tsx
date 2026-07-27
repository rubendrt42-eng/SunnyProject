import { Container } from "@/components/ui/Container";
import { CountUp } from "@/components/motion/CountUp";
import { InViewReveal } from "@/components/motion/InViewReveal";
import type { PublicStats } from "@/lib/queries";

export function StatsStrip({ stats }: { stats: PublicStats }) {
  const items = [
    { value: stats.publishedExperiences, label: stats.publishedExperiences === 1 ? "experiencia publicada" : "experiencias publicadas" },
    { value: stats.activeBusinesses, label: stats.activeBusinesses === 1 ? "negocio activo" : "negocios activos" },
    { value: stats.categoriesRepresented, label: stats.categoriesRepresented === 1 ? "categoría" : "categorías" },
  ];

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {items.map((item, i) => (
            <InViewReveal key={item.label} delay={i * 0.08} className="text-center sm:text-left">
              <CountUp value={item.value} className="font-serif text-6xl italic sm:text-7xl" />
              <p className="mt-2 text-sm tracking-wide text-gray uppercase">{item.label}</p>
            </InViewReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
