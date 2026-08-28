import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { BusinessForm } from "@/components/lean/BusinessForm";

export const metadata: Metadata = {
  title: "Para negocios — The Sunny Project",
  description:
    "Sunny trabaja con estudios, cafés, clubes y talleres de Monterrey. Cuéntanos de tu espacio y armamos una experiencia juntos.",
};

/**
 * La página de captación de espacios aliados.
 *
 * Es una página, no un portal: no hay cuenta, no hay acceso, y nada de lo que
 * se envía aquí se publica solo. Un negocio deja sus datos, Emmy los revisa y
 * decide. Eso está dicho explícitamente abajo del formulario porque es la
 * expectativa que más fácil se malinterpreta — alguien podría llenar esto
 * esperando ver su clase en el sitio al día siguiente.
 *
 * El titular es el que se acordó como llamada a la acción: «¿Quieres crear una
 * experiencia con Sunny?».
 */
export default function ParaNegociosPage() {
  return (
    <main className="py-14 sm:py-20">
      <Container className="max-w-2xl">
        <InViewReveal>
          <p className="eyebrow">Para negocios</p>
          <h1 className="mt-3 text-title text-balance">¿Quieres crear una experiencia con Sunny?</h1>
          {/*
            «Nosotros llevamos gente nueva a conocerte. Sin costo para ti.» se
            lee como una agencia de captación, y promete un resultado —que
            llegue gente— que depende de cada experiencia. Esto describe el
            trato real: se arma junta, el espacio aparta lugares, Sunny la
            publica. El mismo mensaje que el capítulo de la portada.
          */}
          <p className="mt-4 text-body-l text-gray">
            Sunny trabaja con estudios, cafés, clubes y talleres de Monterrey. Armamos juntos una experiencia, tú
            apartas algunos lugares y nosotros la publicamos y la difundimos. Cuéntanos qué haces y lo platicamos.
          </p>
        </InViewReveal>

        <div className="mt-10">
          <BusinessForm />
        </div>

        <p className="mt-8 text-small text-gray">
          Al enviar tus datos nos llega tu propuesta para revisarla. Nada se publica automáticamente: te escribimos
          primero para platicar cómo podría funcionar.
        </p>
      </Container>
    </main>
  );
}
