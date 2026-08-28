import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/sanity/queries";
import { DEFAULT_SETTINGS, mezclarAjustes, whatsappLink } from "@/lib/lean-content";

/**
 * El pie del sitio.
 *
 * QUÉ SE CORRIGIÓ
 *
 * Publicaba `@sunnyproject.mx` y `hola@sunnyproject.mx` escritos a mano en este
 * archivo. **No son cuentas reales.** Estaban en todas las páginas del sitio,
 * invitando a escribir a direcciones que nadie lee.
 *
 * También decía «Un pase gratuito por semana» —vocabulario del producto
 * anterior— y «Proyecto de demostración», que dejó de ser cierto en cuanto el
 * sitio se publicó en una URL abierta.
 *
 * DE DÓNDE SALEN AHORA LOS DATOS
 *
 * De `siteSettings` en Sanity, igual que el resto del contenido editable. Y
 * **cada canal se dibuja solo si tiene valor**: si Emmy no ha puesto el
 * WhatsApp, no aparece un WhatsApp. La alternativa —dejar un valor por
 * defecto— es exactamente el error que se está corrigiendo.
 *
 * Si no hay ningún canal, la columna de contacto no se dibuja. Un encabezado
 * «Contacto» sobre un hueco es peor que no tener columna.
 */
export async function Footer() {
  const s = mezclarAjustes(DEFAULT_SETTINGS, await getSiteSettings());
  const whatsapp = s.whatsapp?.trim();
  const instagram = s.instagramUrl?.trim();
  const correo = s.contactEmail?.trim();
  const hayContacto = Boolean(whatsapp || instagram || correo);

  return (
    <footer className="mt-auto bg-carbon py-12 text-warm-white">
      <Container className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-xl italic">The Sunny Project</p>
          {/*
            Decía «bienestar, movimiento y comunidad», y eso encerraba a Sunny
            en wellness cuando también entran cafés, talleres y conceptos que
            no son de movimiento. El pie sale en todas las páginas: es la
            definición que más veces se lee del sitio.
          */}
          <p className="mt-2 text-sm text-warm-white/60">{s.footerDescripcion}</p>
        </div>

        <div className={`grid gap-8 text-sm ${hayContacto ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-warm-white">Explora</span>
            <EnlacePie href="/experiencias">Experiencias</EnlacePie>
            <EnlacePie href="/como-funciona">Cómo funciona</EnlacePie>
            <EnlacePie href="/para-negocios">Para negocios</EnlacePie>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-medium text-warm-white">Ayuda</span>
            <EnlacePie href="/preguntas-frecuentes">Preguntas frecuentes</EnlacePie>
            <EnlacePie href="/privacidad">Privacidad</EnlacePie>
            {/*
              «Términos» ya no se enlaza: la página describía reglas que no
              existen y no hay una política validada que ponga en su lugar.
              Volverá cuando la haya. Ver `next.config.ts`.
            */}
          </div>

          {hayContacto && (
            <div className="flex flex-col gap-2">
              <span className="font-medium text-warm-white">Contacto</span>
              {whatsapp && (
                <a
                  href={whatsappLink(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-white/60 transition-colors hover:text-warm-white"
                >
                  WhatsApp
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-white/60 transition-colors hover:text-warm-white"
                >
                  Instagram
                </a>
              )}
              {correo && (
                <a href={`mailto:${correo}`} className="text-warm-white/60 transition-colors hover:text-warm-white">
                  {correo}
                </a>
              )}
            </div>
          )}
        </div>
      </Container>

      <Container className="mt-10 border-t border-warm-white/10 pt-6 text-xs text-warm-white/50">
        © {new Date().getFullYear()} The Sunny Project — Monterrey.
      </Container>
    </footer>
  );
}

function EnlacePie({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-warm-white/60 transition-colors hover:text-warm-white">
      {children}
    </Link>
  );
}
