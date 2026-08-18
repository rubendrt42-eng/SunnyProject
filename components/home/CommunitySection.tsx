import Link from "next/link";
import { AtSign } from "lucide-react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { LinkButton } from "@/components/ui/Button";
import { BrandCanvas } from "@/components/lean/BrandCanvas";

/**
 * Comunidad — el capítulo oscuro de la portada.
 *
 * DOS FALLOS QUE TENÍA
 *
 * 1. **Texto blanco sobre fondo casi blanco.** La sección está escrita para un
 *    fondo oscuro —`text-warm-white`, `text-warm-white/75`, bordes
 *    `warm-white/30`— pero la portada la montaba sobre `bg-warm-white`. El
 *    resultado publicado era un párrafo invisible: en las capturas de la
 *    auditoría solo se leía la frase amarilla, y a duras penas. Ahora el fondo
 *    lo pone **la propia sección**, así que la pareja color de fondo / color de
 *    texto no puede volver a separarse.
 *
 * 2. **Un Instagram inventado.** El botón «Seguir a Sunny» apuntaba a
 *    `instagram.com/sunnyproject.mx`, escrito a mano en `lib/constants.ts`. No
 *    es una cuenta real. Ahora el enlace viene de Sanity y **solo aparece si
 *    existe**.
 *
 * Y de paso resuelve lo que pedía la auditoría: es la única sección oscura
 * entre el hero y el pie, que es lo que devuelve el ritmo a una portada donde
 * todo lo demás vive entre marfil y blanco cálido.
 *
 * SOBRE LAS IMÁGENES
 *
 * Las dos fotografías eran de referencia, sin licencia para publicarse, y a
 * 1440 px se salían por el borde derecho. Se sustituyen por lienzos de marca
 * mientras no haya fotografía propia. La composición asimétrica se conserva
 * —una desplazada respecto a la otra— porque es lo que hace que esta sección no
 * se lea como las rejillas de arriba y abajo.
 */
export function CommunitySection({ instagramUrl }: { instagramUrl?: string }) {
  return (
    <div className="bg-carbon py-20 text-warm-white sm:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <InViewReveal variant="lead">
            <p className="eyebrow text-sunny">Comunidad</p>
            <h2 className="mt-4 text-title text-warm-white text-balance">
              Puedes llegar solo.{" "}
              <span className="font-serif text-sunny italic">Eso no significa que te vas a ir igual.</span>
            </h2>
          </InViewReveal>

          <InViewReveal delay={0.08}>
            <p className="mt-6 max-w-md text-body-l text-warm-white/75">
              No se trata solamente de probar una actividad. Se trata de encontrar nuevas formas de moverte, aprender,
              convivir y conectar con personas que tienen las mismas ganas de vivir algo diferente.
            </p>
          </InViewReveal>

          <InViewReveal delay={0.14}>
            <p className="mt-4 max-w-md text-body text-warm-white/60">
              Una experiencia puede durar una hora. La conexión puede quedarse.
            </p>
          </InViewReveal>

          <InViewReveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <LinkButton href="/experiencias" variant="primary" arrow>
                Ver experiencias
              </LinkButton>

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-warm-white/30 px-5 text-small font-medium text-warm-white transition-colors hover:bg-warm-white/10"
                >
                  <AtSign aria-hidden size={16} strokeWidth={1.5} />
                  Seguir a Sunny
                  <span className="sr-only"> en Instagram</span>
                </a>
              )}
            </div>
          </InViewReveal>

          <InViewReveal delay={0.26}>
            <p className="mt-6 text-small text-warm-white/50">
              ¿Ya viste algo que le va a alguien?{" "}
              <Link
                href="/experiencias"
                className="underline decoration-warm-white/40 underline-offset-4 hover:decoration-warm-white"
              >
                Compártelo desde cualquier experiencia
              </Link>
              .
            </p>
          </InViewReveal>
        </div>

        {/*
          UN SOLO LIENZO, NO DOS

          Eran dos piezas desplazadas entre sí. Con fotografías reales la
          composición asimétrica funcionaba; con lienzos de marca, dos veces el
          mismo motivo en la misma pantalla lo delata como relleno. Y en móvil
          quedaban dos miniaturas donde no se distinguía nada.

          Uno solo, más grande y en vertical: ocupa el sitio con intención.
          Cuando haya fotografía real, aquí vuelven las dos.
        */}
        <div className="lg:col-span-7">
          <InViewReveal variant="media">
            <BrandCanvas
              seed="comunidad"
              tone="light"
              className="aspect-4/3 w-full rounded-xl lg:aspect-4/5"
            />
          </InViewReveal>
        </div>
      </div>
    </div>
  );
}
