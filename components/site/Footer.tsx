import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="mt-auto bg-carbon py-12 text-warm-white">
      <Container className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-xl italic">Sunny Project</p>
          <p className="mt-2 text-sm text-warm-white/60">
            Experiencias curadas de wellness, movimiento y comunidad en Monterrey. Un pase gratuito por semana.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-warm-white">Explora</span>
            <Link href="/experiencias" className="text-warm-white/60 hover:text-warm-white">
              Experiencias
            </Link>
            <Link href="/como-funciona" className="text-warm-white/60 hover:text-warm-white">
              Cómo funciona
            </Link>
            <Link href="/para-negocios" className="text-warm-white/60 hover:text-warm-white">
              Para negocios
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-warm-white">Ayuda</span>
            <Link href="/preguntas-frecuentes" className="text-warm-white/60 hover:text-warm-white">
              Preguntas frecuentes
            </Link>
            <Link href="/privacidad" className="text-warm-white/60 hover:text-warm-white">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-warm-white/60 hover:text-warm-white">
              Términos
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-warm-white">Contacto</span>
            <span className="text-warm-white/60">@sunnyproject.mx</span>
            <span className="text-warm-white/60">hola@sunnyproject.mx</span>
          </div>
        </div>
      </Container>

      <Container className="mt-10 border-t border-warm-white/10 pt-6 text-xs text-warm-white/50">
        © {new Date().getFullYear()} Sunny Project. Proyecto de demostración — Monterrey.
      </Container>
    </footer>
  );
}
