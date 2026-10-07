import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Wordmark } from "@/components/site/Wordmark";
import { MARCA } from "@/lib/sunni-content";
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
    <footer className="mt-auto bg-ink py-12 text-warm-white">
      <Container className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-sm">
          <Wordmark tono="claro" />
          {/*
            Decía «bienestar, movimiento y comunidad», y eso encerraba a Sunny
            en wellness cuando también entran cafés, talleres y conceptos que
            no son de movimiento. El pie sale en todas las páginas: es la
            definición que más veces se lee del sitio.
          */}
          <p className="mt-2 text-sm text-warm-white/60">{s.footerDescripcion}</p>
        </div>

        <div className={`grid gap-8 text-sm ${hayContacto ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
          <div className="flex flex-col gap-2 pointer-coarse:gap-0">
            <span className="font-medium text-warm-white pointer-coarse:mb-1">Explora</span>
            <EnlacePie href="/#que-hacemos">What is Sun‑i</EnlacePie>
            <EnlacePie href="/#vending">Sun‑i Vending</EnlacePie>
            <EnlacePie href="/#experiences">Sun‑i Experiences</EnlacePie>
            <EnlacePie href="/#brands">For Brands</EnlacePie>
          </div>

          <div className="flex flex-col gap-2 pointer-coarse:gap-0">
            <span className="font-medium text-warm-white pointer-coarse:mb-1">Ayuda</span>
            <EnlacePie href="/privacidad">Privacidad</EnlacePie>
            {/*
              «Términos» ya no se enlaza: la página describía reglas que no
              existen y no hay una política validada que ponga en su lugar.
              Volverá cuando la haya. Ver `next.config.ts`.
            */}
          </div>

          {hayContacto && (
            <div className="flex flex-col gap-2 pointer-coarse:gap-0">
              <span className="font-medium text-warm-white pointer-coarse:mb-1">Contacto</span>
              {whatsapp && (
                <a
                  href={whatsappLink(whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-white/60 transition-colors hover:text-warm-white pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center"
                >
                  WhatsApp
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-warm-white/60 transition-colors hover:text-warm-white pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center"
                >
                  Instagram
                </a>
              )}
              {correo && (
                <a href={`mailto:${correo}`} className="text-warm-white/60 transition-colors hover:text-warm-white pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center">
                  {correo}
                </a>
              )}
            </div>
          )}
        </div>
      </Container>

      <Container className="mt-10 border-t border-warm-white/10 pt-6 text-xs text-warm-white/50">
        © {new Date().getFullYear()} {MARCA.nombre} — Everyday wellness, lifestyle y tecnología.
      </Container>
    </footer>
  );
}

/**
 * Un enlace del pie.
 *
 * Medían 20px de alto, por debajo del mínimo de 24px de la WCAG 2.5.8, y en el
 * teléfono quedaban cuatro seguidos a 8px de distancia: se tocaba el de al
 * lado. `pointer-coarse:min-h-11` los lleva a los 44px
 * estándar **donde se toca con el dedo** —teléfono y tableta por igual— y los
 * deja en su altura natural donde hay cursor, porque ahí alargarlos solo
 * abriría huecos en el pie. El ancho de pantalla era el criterio equivocado:
 * una tableta de 768px se toca igual que un teléfono.
 */
function EnlacePie({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-warm-white/60 transition-colors hover:text-warm-white pointer-coarse:flex pointer-coarse:min-h-11 pointer-coarse:items-center"
    >
      {children}
    </Link>
  );
}
