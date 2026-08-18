import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";

/**
 * Los tres pasos, en el lenguaje correcto para esta etapa.
 *
 * El tercero es el importante y por eso está redactado con cuidado: **el sitio
 * no confirma nada**. Recibe una solicitud y Emmy contesta. Decir «reserva tu
 * lugar» aquí sería prometer algo que el sistema no hace, y quien lo leyera se
 * presentaría a una clase creyendo que tiene lugar apartado.
 *
 * POR QUÉ CAMBIÓ LA COMPOSICIÓN
 *
 * Eran tres cajas blancas idénticas, del mismo tamaño y sin ninguna textura:
 * 300 px de alto que no aportaban nada visual en la sección que explica el
 * producto. La auditoría la marcó como la más plana del sitio.
 *
 * Ahora el número manda —grande, en serif, con el naranja de marca— y las tres
 * columnas se escalonan verticalmente en escritorio, de forma que la lectura
 * baja en diagonal en vez de recorrer tres rectángulos alineados. Ninguna caja,
 * ningún borde: solo una línea fina arriba que las separa.
 *
 * Sigue siendo texto y CSS. No se volvió interactivo, no se convirtió en
 * carrusel y no ganó un cuarto paso.
 */
const PASOS = [
  {
    numero: "01",
    titulo: "Descubre una experiencia",
    texto: "Mira lo que hay disponible esta semana en los espacios aliados de Monterrey.",
  },
  {
    numero: "02",
    titulo: "Solicita tu lugar",
    texto: "Déjanos tu nombre y tu WhatsApp. Sin crear cuenta y sin pagar nada.",
  },
  {
    numero: "03",
    titulo: "Confirmamos contigo",
    texto: "Revisamos la disponibilidad y te escribimos por WhatsApp para confirmar tu lugar.",
  },
];

export function HowItWorks() {
  return (
    <Container>
      <InViewReveal variant="lead">
        <p className="eyebrow">Cómo funciona</p>
        <h2 className="mt-3 max-w-2xl text-title text-balance">Salir de la rutina no debería ser complicado.</h2>
      </InViewReveal>

      {/*
        El `<li>` va POR FUERA de la animación, no por dentro.

        Envolver cada elemento en el div que anima rompe la relación directa
        entre `<ol>` y `<li>` que exige HTML, y un lector de pantalla deja de
        anunciar «lista de 3 elementos, elemento 1 de 3» — que es justo la
        información que hace entendible una secuencia de pasos. axe-core lo
        marcó como `list` y `listitem`, gravedad seria, con 8 incidencias.
      */}
      <ol className="mt-12 grid gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
        {PASOS.map((paso, i) => (
          <li key={paso.numero} className={i === 1 ? "sm:mt-10" : i === 2 ? "sm:mt-20" : ""}>
            <InViewReveal delay={i * 0.08}>
              <div className="border-t border-carbon/15 pt-5">
                {/* El número es el orden real de una secuencia, no una
                    decoración: estos pasos ocurren uno después de otro. */}
                <span aria-hidden className="block font-serif text-5xl leading-none text-orange-ink/80 tabular-nums">
                  {paso.numero}
                </span>
                <h3 className="mt-4 text-heading text-balance">{paso.titulo}</h3>
                <p className="mt-2 max-w-xs text-body text-gray">{paso.texto}</p>
              </div>
            </InViewReveal>
          </li>
        ))}
      </ol>
    </Container>
  );
}
