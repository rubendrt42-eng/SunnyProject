import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-carbon/10 bg-warm-white py-12">
      <Container className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-xl italic">Sunny Project</p>
          <p className="mt-2 text-sm text-gray">
            Experiencias curadas de wellness, movimiento y comunidad en Monterrey. Un pase gratuito por semana.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-carbon">Explora</span>
            <Link href="/experiencias" className="text-gray hover:text-carbon">
              Experiencias
            </Link>
            <Link href="/como-funciona" className="text-gray hover:text-carbon">
              Cómo funciona
            </Link>
            <Link href="/para-negocios" className="text-gray hover:text-carbon">
              Para negocios
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-carbon">Ayuda</span>
            <Link href="/preguntas-frecuentes" className="text-gray hover:text-carbon">
              Preguntas frecuentes
            </Link>
            <Link href="/privacidad" className="text-gray hover:text-carbon">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-gray hover:text-carbon">
              Términos
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-carbon">Contacto</span>
            <span className="text-gray">@sunnyproject.mx</span>
            <span className="text-gray">hola@sunnyproject.mx</span>
          </div>
        </div>
      </Container>

      <Container className="mt-10 border-t border-carbon/10 pt-6 text-xs text-gray">
        © {new Date().getFullYear()} Sunny Project. Proyecto de demostración — Monterrey.
      </Container>
    </footer>
  );
}
