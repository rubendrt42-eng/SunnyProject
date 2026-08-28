import Link from "next/link";
import { AtSign } from "lucide-react";
import { InViewReveal } from "@/components/motion/InViewReveal";
import { LinkButton } from "@/components/ui/Button";
import type { BloqueDeTexto } from "@/lib/sanity/types";

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
export function CommunitySection({ bloque, instagramUrl }: { bloque: BloqueDeTexto; instagramUrl?: string }) {
  return (
    <div className="bg-carbon py-24 text-warm-white sm:py-32 lg:py-40">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <InViewReveal variant="lead">
          <p className="eyebrow text-sunny">Comunidad</p>
        </InViewReveal>

        {/*
          LA FRASE ES EL ELEMENTO VISUAL

          Aquí había un lienzo de degradado ocupando siete de doce columnas: el
          tercer rectángulo naranja idéntico de la misma portada, sin nada que
          decir. El análisis de referencias asigna a esta sección otro papel —
          la frase-ancla que rompe el ritmo a mitad del scroll— y ese papel lo
          hace la tipografía, no una imagen de relleno.

          Así que la sección se estrecha, se centra y la frase crece hasta
          ocupar el sitio que ocupaba el degradado. Es el único momento del
          sitio donde el texto es la ilustración, y por eso funciona: rompe el
          ritmo de columnas de todo lo demás.
        */}
        <InViewReveal delay={0.06}>
          {/*
            «Puedes llegar solo. Eso no significa que te vas a ir igual»
            prometía una transformación que Sunny no organiza, y estaba escrita
            para sonar profunda. La frase que la sustituye no es una metáfora:
            describe literalmente cómo se junta la gente en este producto —no
            hay perfiles ni grupos, hay experiencias— y por eso puede ocupar el
            mismo sitio sin prometer nada.

            La composición no se tocó: el titular sigue siendo el elemento
            visual del capítulo.
          */}
          <h2 className="mt-6 text-display text-balance text-warm-white">
            {bloque.titulo}
            {bloque.acento && (
              <>
                {" "}
                <span className="font-serif font-normal text-sunny italic">{bloque.acento}</span>
              </>
            )}
          </h2>
        </InViewReveal>

        <InViewReveal delay={0.12}>
          <p className="mt-10 max-w-[54ch] text-lead text-warm-white/75">{bloque.texto}</p>
        </InViewReveal>

        <InViewReveal delay={0.16}>
          <p className="mt-5 max-w-xl border-l border-sunny/40 pl-5 font-serif text-body-l text-warm-white/85 italic">
            {bloque.cita}
          </p>
        </InViewReveal>

        <InViewReveal delay={0.22}>
          <div className="mt-12 flex flex-wrap items-center gap-3">
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

        <InViewReveal delay={0.28}>
          <p /* /55 y no /45: a /45 el contraste es 4.43:1 y AA pide 4.5 para
               texto pequeño. Sigue leyéndose como nota al pie. */
            className="mt-8 text-small text-warm-white/55">
            ¿Ya viste algo que le va a alguien?{" "}
            <Link
              href="/experiencias"
              className="underline decoration-warm-white/45 underline-offset-4 transition-colors hover:decoration-warm-white"
            >
              Compártelo desde cualquier experiencia
            </Link>
            .
          </p>
        </InViewReveal>
      </div>
    </div>
  );
}
