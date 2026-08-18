import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { BrandCanvas } from "@/components/lean/BrandCanvas";
import { InViewReveal } from "@/components/motion/InViewReveal";

export const metadata: Metadata = {
  title: "Cómo funciona — The Sunny Project",
  description:
    "Tres pasos: descubre una experiencia, solicita tu lugar y nosotros te confirmamos. Sin cuentas y sin pagar nada.",
};

/**
 * Cómo funciona, reescrita.
 *
 * QUÉ DECÍA ANTES
 *
 * Esta página describía el producto anterior: un pase semanal gratuito, un
 * folio que presentar al llegar, una sola reservación activa por semana y
 * cancelación hasta 12 horas antes. Nada de eso existe. Y como está enlazada
 * desde el menú, era el segundo destino más accesible del sitio: quien leía
 * en la portada «solicita tu lugar y te confirmamos» y entraba aquí, se
 * encontraba con otro producto.
 *
 * LA DISTINCIÓN QUE ESTA PÁGINA TIENE QUE DEJAR CLARA
 *
 * **Solicitar no es confirmar.** El sitio recibe una solicitud; la confirmación
 * la da una persona después, por WhatsApp. Si alguien se va de aquí creyendo
 * que ya tiene lugar, se presenta a una clase donde no lo esperan. Por eso el
 * tercer paso lo dice con esas palabras y hay una nota aparte que lo repite.
 *
 * SOBRE LAS IMÁGENES
 *
 * La versión anterior ilustraba cada paso con fotografías de `lib/media.ts`.
 * Son imágenes de referencia sin licencia para publicarse, así que aquí se usa
 * el lienzo de marca. Cuando existan fotografías propias, sustituir el
 * `BrandCanvas` por la imagen es un cambio de una línea por paso.
 */
const PASOS = [
  {
    numero: "01",
    titulo: "Descubre",
    texto: "Explora las experiencias disponibles en Sunny.",
  },
  {
    numero: "02",
    titulo: "Solicita tu lugar",
    texto: "Elige una experiencia y deja tus datos. No necesitas crear cuenta.",
  },
  {
    numero: "03",
    titulo: "Confirmamos contigo",
    texto:
      "The Sunny Project revisa disponibilidad y se pone en contacto contigo para confirmar.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main className="py-14 sm:py-24">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow">El recorrido</p>
          <h1 className="mt-3 text-display text-balance">Cómo funciona</h1>
          <p className="mt-5 max-w-xl text-body-l text-gray">
            Tres pasos. Sin cuentas, sin pagos y sin letra chica.
          </p>
        </div>

        {/*
          Composición editorial, no tres cajas iguales: el número manda, ocupa
          su propia columna y el texto vive al lado. Cada paso se alterna con
          un lienzo de marca para que la página tenga textura sin depender de
          fotografías que todavía no existen.
        */}
        <ol className="mt-14 flex flex-col gap-14 sm:mt-20 sm:gap-20">
          {PASOS.map((paso, i) => (
            <li
              key={paso.numero}
              className={`grid items-center gap-6 sm:grid-cols-12 sm:gap-10 ${
                i % 2 === 1 ? "sm:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="sm:col-span-7">
                <span
                  aria-hidden
                  className="block font-serif text-6xl leading-none text-orange-ink/85 tabular-nums sm:text-7xl"
                >
                  {paso.numero}
                </span>
                <h2 className="mt-4 text-title text-balance">{paso.titulo}</h2>
                <p className="mt-3 max-w-md text-body-l text-gray">{paso.texto}</p>
              </div>
              {/* Solo el primer paso lleva lienzo. Tres seguidos, uno por
                  paso, era donde más se notaba que el mismo motivo se estaba
                  repitiendo para rellenar. Los otros dos se sostienen con el
                  número grande, que es lo que de verdad estructura la lectura. */}
              {i === 0 ? (
                <InViewReveal variant="media" className="sm:col-span-5">
                  <BrandCanvas seed={paso.titulo} className="aspect-16/10 w-full rounded-xl sm:aspect-4/3" />
                </InViewReveal>
              ) : (
                <div aria-hidden className="hidden sm:col-span-5 sm:block" />
              )}
            </li>
          ))}
        </ol>

        {/*
          La aclaración que evita el malentendido caro. Va en su propio bloque
          y con contraste, no como una nota al pie: es la diferencia entre
          presentarse a una clase donde te esperan y a una donde no.
        */}
        <section className="mt-16 rounded-xl bg-carbon p-8 text-warm-white sm:mt-24 sm:p-10">
          <h2 className="text-subtitle">Solicitar no es lo mismo que tener lugar</h2>
          <p className="mt-3 max-w-2xl text-body-l text-warm-white/75">
            Al enviar el formulario nos llega tu solicitud y revisamos la disponibilidad del espacio. Tu lugar queda
            confirmado cuando te escribimos por WhatsApp, no antes. Si no hay cupo, también te avisamos.
          </p>
        </section>

        <div className="mt-12">
          <LinkButton href="/experiencias" size="lg" arrow>
            Explorar experiencias
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
