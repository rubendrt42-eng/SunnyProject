import Image from "next/image";
import { WordReveal } from "@/components/motion/WordReveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LinkButton } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HERO_TOGETHER } from "@/lib/media";

/**
 * Hero a sangre completa: la fotografía ES el fondo, y el contenido se ancla
 * abajo a la izquierda.
 *
 * SOBRE LA RESOLUCIÓN, QUE ES LA DECISIÓN IMPORTANTE AQUÍ
 *
 * La versión anterior era una división editorial —tipografía a la izquierda,
 * foto en una columna— y el motivo estaba escrito: **no existe ni una sola
 * fotografía horizontal en el proyecto**. Las 13 imágenes son verticales de
 * 736 px de ancho (el ancho canónico de Pinterest; ver
 * SUNNY_ASSET_MANIFEST.md §0), salvo el retrato cuadrado de Emmy.
 *
 * Un fondo de 736 px estirado a 1920 se amplía 2,6 veces. Eso se nota. Se
 * hace igualmente porque es la composición pedida, y se compensa con tres
 * cosas que sí están bajo control:
 *
 *  1. El velo oscuro, que hace falta de todas formas para que el texto blanco
 *     pase AA, y que se come buena parte de la falta de nitidez.
 *  2. El grano (`.hero-grain`), que rompe las bandas suaves que deja el
 *     escalado. Es el truco de siempre y funciona.
 *  3. `object-position: center 72%`, elegido comparando cuatro encuadres
 *     renderizados. Con el recorte por el centro se veía la reja y el
 *     follaje, y las dos jugadoras —que son literalmente el argumento de
 *     «vívelo con alguien»— quedaban cortadas por abajo. Al 72 % el saludo
 *     con las palas queda a la altura del titular.
 *
 * Nada de esto sustituye a una foto de verdad. Con una horizontal de 2400 px
 * este hero sube un escalón entero sin tocar una línea de código.
 *
 * EL VELO
 *
 * Dos capas, no una. Un tinte uniforme flojo sobre toda la imagen para que el
 * header se lea en cualquier parte, y un degradado fuerte desde abajo donde
 * vive el texto. Un solo tinte lo bastante oscuro para el texto habría
 * apagado la fotografía entera, que es justo lo que no queremos si la foto es
 * el argumento.
 *
 * Los valores no se eligieron a ojo. Se midió el contraste de cada texto
 * contra el píxel MÁS CLARO del fondo que le toca debajo —no contra el
 * promedio, que perdona demasiado— renderizando la página y muestreando los
 * píxeles. La primera versión llevaba el chip en `bg-white/10` y el degradado
 * arrancaba en `carbon/10`: en móvil, donde el recorte deja el cielo detrás
 * del chip, daba 4.40:1 sobre un texto de 11 px que necesita 4.5. El chip
 * pasó a fondo oscuro y el degradado arranca en `carbon/25`.
 *
 * Si algún día se cambia la fotografía, hay que volver a medir. El velo está
 * calibrado para ESTA imagen.
 */
export function Hero({ experienceCount, venueCount }: { experienceCount: number; venueCount: number }) {
  // `-mt-18` sube la sección los 72 px que mide el header.
  //
  // El header es `sticky`, no `fixed`, así que SIGUE ocupando su hueco en el
  // flujo: sin esto el hero empezaba justo por debajo y quedaba una franja
  // del fondo de la página cruzando la parte superior de la pantalla — se
  // veía como un borde gris sobre la fotografía. Subiendo la sección, la foto
  // pasa por detrás del header, que es lo que hace la referencia.
  return (
    <section className="relative isolate -mt-18 flex min-h-[88svh] flex-col justify-end overflow-hidden lg:min-h-[92svh]">
      <Image
        src={HERO_TOGETHER.src}
        alt={HERO_TOGETHER.alt}
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[center_72%]"
      />

      {/* Capa 1: tinte parejo. Sostiene el header arriba. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-carbon/45" />
      {/* Capa 2: el degradado que hace legible el texto de abajo. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-carbon/90 via-carbon/60 to-carbon/25"
      />
      <div aria-hidden className="hero-grain absolute inset-0 -z-10" />

      {/* `pt-32` deja sitio al header, que ahora flota encima en vez de
          empujar la sección hacia abajo. */}
      <Container className="pt-32 pb-14 sm:pb-20">
        <LineReveal>
          <p className="inline-flex rounded-full border border-white/25 bg-carbon/55 px-4 py-1.5 text-label text-warm-white backdrop-blur-sm">
            Monterrey · Cada semana
          </p>
        </LineReveal>

        {/* Dos líneas cortas, ~7 palabras. La promesa es el descubrimiento Y
            la compañía — ese par es el diferenciador entero. Las dos viven
            dentro del mismo h1 para que el encabezado de la página sea la
            promesa completa, no su primera mitad.

            La segunda línea va en `sunny` y no en `orange-ink`: sobre foto
            oscura el naranja quemado se hunde, y el amarillo de marca es lo
            que más contrasta contra el velo. */}
        <h1 className="mt-6 max-w-3xl text-display text-warm-white">
          <WordReveal as="span" text="Descubre algo nuevo." className="block" />
          <WordReveal as="span" text="Vívelo con alguien." delay={0.22} className="block text-sunny" />
        </h1>

        <LineReveal delay={0.5}>
          <p className="mt-6 max-w-lg text-body-l text-warm-white/85">
            Experiencias locales para salir de la rutina, conectar y formar parte de una comunidad que busca crecer.
          </p>
        </LineReveal>

        {/* La fila de abajo: acción a la izquierda, datos a la derecha,
            alineadas por la base. Es lo que hace que el hero termine en una
            línea firme en vez de deshilacharse — y lo que llena el ancho en
            escritorio, que era la queja concreta. */}
        <LineReveal delay={0.62}>
          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="flex flex-wrap items-center gap-3">
              <LinkButton href="/experiencias" size="lg" variant="primary" arrow>
                Explorar esta semana
              </LinkButton>
              <LinkButton
                href="/#que-es-sunny"
                size="lg"
                variant="secondary"
                className="border-white/35 text-warm-white hover:border-white/70 hover:bg-white/10"
              >
                Conoce Sunny
              </LinkButton>
            </div>

            <HeroFacts experienceCount={experienceCount} venueCount={venueCount} />
          </div>
        </LineReveal>
      </Container>
    </section>
  );
}

/**
 * Tres datos, todos ciertos y dos de ellos contados de la base de datos, no
 * escritos a mano. Si una semana solo hay dos experiencias, aquí dice dos.
 *
 * El separador es un borde y no un carácter «|» para que un lector de
 * pantalla no lo lea, y desaparece en móvil, donde los datos se apilan en
 * una rejilla de tres columnas estrechas.
 */
function HeroFacts({ experienceCount, venueCount }: { experienceCount: number; venueCount: number }) {
  const facts = [
    { value: String(experienceCount), label: experienceCount === 1 ? "Experiencia" : "Experiencias", note: "Esta semana" },
    { value: "1 pase", label: "Por semana", note: "Sin costo" },
    { value: String(venueCount), label: venueCount === 1 ? "Espacio" : "Espacios", note: "Aliados en la ciudad" },
  ];

  return (
    <dl className="grid grid-cols-3 gap-px overflow-hidden">
      {facts.map((fact, i) => (
        <div key={fact.label} className={i > 0 ? "border-l border-white/25 pl-4 sm:pl-6" : "pr-4 sm:pr-6"}>
          <dt className="sr-only">
            {fact.label} — {fact.note}
          </dt>
          <dd>
            <span className="block text-xl font-bold text-warm-white sm:text-2xl">{fact.value}</span>
            <span className="mt-0.5 block text-small font-medium text-warm-white/90">{fact.label}</span>
            <span className="block text-xs text-warm-white/65">{fact.note}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
