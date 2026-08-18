import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { ExperienceGrid } from "@/components/lean/ExperienceGrid";
import { empiezaEnLosProximos } from "@/lib/dates";
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

  /**
   * «Próximos días» son los siete siguientes. El resto va a «Más adelante».
   *
   * Se calcula aquí y no en la consulta porque la consulta ya filtra lo que
   * está vigente y volver a preguntarle a Sanity por lo mismo con otro corte
   * serían dos viajes para un dato que ya está en memoria.
   */
  const pronto = experiences.filter((e) => empiezaEnLosProximos(e.startDateTime, 7));
  const despues = experiences.filter((e) => !empiezaEnLosProximos(e.startDateTime, 7));

  const grupos = [
    { titulo: "Próximos días", items: pronto },
    { titulo: "Más adelante", items: despues },
  ].filter((g) => g.items.length > 0);

  return (
    <main className="py-14 sm:py-20">
      <Container>
        <InViewReveal variant="lead">
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
        {/*
          AGRUPADO POR TIEMPO, NO UNA LISTA PLANA

          Con dos experiencias da lo mismo. Con quince es un muro donde nada
          orienta: la primera y la décima se ven iguales aunque una sea el
          viernes y la otra dentro de un mes. La pregunta que trae a alguien
          aquí es «¿qué puedo hacer pronto?», así que el catálogo la responde
          antes de que la formule.

          El corte son siete días desde ahora. No es una categoría que Emmy
          tenga que mantener: se calcula solo a partir de la fecha.
        */}
        {experiences.length === 0 ? (
          <>
            <h2 className="sr-only">Sin experiencias por ahora</h2>
            <div className="mt-10">
              <ExperienceGrid experiences={experiences} />
            </div>
          </>
        ) : (
          <div className="mt-12 flex flex-col gap-14 sm:gap-20">
            {grupos.map((grupo) => (
              <section key={grupo.titulo}>
                <InViewReveal>
                  <h2 className="flex items-baseline gap-3 text-subtitle">
                    {grupo.titulo}
                    <span className="tabular text-small font-normal text-gray">
                      {grupo.items.length}
                    </span>
                  </h2>
                </InViewReveal>
                <div className="mt-6">
                  <ExperienceGrid experiences={grupo.items} />
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
