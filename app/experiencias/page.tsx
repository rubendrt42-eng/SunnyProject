import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { ExperienceGrid } from "@/components/lean/ExperienceGrid";
import { getUpcomingExperiences } from "@/lib/sanity/queries";

/**
 * El catálogo completo.
 *
 * SIN FILTROS NI BUSCADOR, A PROPÓSITO
 *
 * La versión anterior tenía filtros por categoría y un buscador sincronizados a
 * la URL. Con seis experiencias a la semana, filtrar una lista que cabe entera
 * en dos pantallas no ayuda a nadie: añade controles que hay que entender para
 * resolver un problema que no existe. Y el esquema de Sanity no tiene
 * categorías, así que filtrar por ellas obligaría a pedirle a Emmy que llene un
 * campo más cada semana sin ganar nada.
 *
 * Vuelven a hacer falta el día que haya treinta experiencias, no antes.
 *
 * El orden lo decide la consulta: de la más próxima a la más lejana. Es el
 * único orden que le sirve a alguien que está decidiendo qué hacer esta semana.
 */
/**
 * 60 segundos. Tiene que ser un número literal: Next analiza esta
 * configuración de forma estática en el build y una constante importada no la
 * puede leer — falla con «Invalid segment configuration export». El mismo
 * valor vive nombrado en SANITY_REVALIDATE_SECONDS para las consultas.
 */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Experiencias — The Sunny Project",
  description: "Todas las experiencias disponibles esta semana en Monterrey.",
};

export default async function ExperienciasPage() {
  const experiences = await getUpcomingExperiences();

  return (
    <main className="py-14 sm:py-20">
      <Container>
        <InViewReveal>
          <p className="eyebrow">Monterrey</p>
          <h1 className="mt-3 max-w-2xl text-title text-balance">
            {experiences.length > 0
              ? "Todo lo que puedes hacer estos días."
              : "Aquí van a estar las próximas experiencias."}
          </h1>
          {experiences.length > 0 && (
            <p className="mt-4 max-w-lg text-body-l text-gray">
              {experiences.length} {experiences.length === 1 ? "experiencia disponible" : "experiencias disponibles"}, de
              la más próxima a la más lejana.
            </p>
          )}
        </InViewReveal>

        {/*
          Encabezado de la lista, invisible pero real.

          axe-core marcaba `heading-order` aquí: la página iba de `h1` a los
          `h3` de las tarjetas sin nada en medio. Para quien navega saltando
          entre encabezados con un lector de pantalla, ese salto significa que
          la estructura de la página miente sobre su propia jerarquía. El texto
          no aporta nada a quien ve la pantalla —el h1 ya lo dijo— así que va
          oculto visualmente y presente para la tecnología asistiva.
        */}
        <h2 className="sr-only">
          {experiences.length > 0 ? "Experiencias disponibles" : "Sin experiencias por ahora"}
        </h2>

        <div className="mt-10">
          <ExperienceGrid experiences={experiences} />
        </div>
      </Container>
    </main>
  );
}
