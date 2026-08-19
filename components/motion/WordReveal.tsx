import type { CSSProperties } from "react";
import { STAGGER } from "@/lib/motion";

const TAGS = { span: "span", h1: "h1", h2: "h2", p: "p" } as const;

/**
 * Titular que entra palabra a palabra. Solo en el hero.
 *
 * CSS puro: cada palabra lleva su propio `animation-delay`. Antes esto eran
 * tantos componentes de cliente como palabras tuviera el titular, cada uno
 * server-renderizado con `opacity:0` — o sea que la promesa entera de la
 * portada dependía de que el JavaScript llegara.
 *
 * SOBRE EL TEXTO PARA LECTORES DE PANTALLA
 *
 * El texto completo va en un nodo `sr-only` y cada palabra visible lleva
 * `aria-hidden`. No es adorno: antes esto era un `aria-label` en el envoltorio,
 * que en un `span` sin rol está prohibido y se ignora — y como todas las
 * palabras estaban ocultas, el `h1` de la portada acababa **sin texto
 * accesible ninguno**. Lo detectó axe-core como `aria-prohibited-attr`,
 * gravedad seria.
 *
 * SOBRE EL ESPACIO ENTRE PALABRAS
 *
 * El espacio final vive dentro del `span`, y en un `inline-block` un espacio
 * final se colapsa con el ajuste de línea normal. Sin conservarlo el hero decía
 * «Descubre algonuevo. Vívelocon alguien.» Detectado en capturas de QA.
 *
 * POR QUÉ `pre-wrap` Y NO `pre`
 *
 * `whitespace-pre` conserva el espacio pero **prohíbe partir dentro de la
 * palabra**, y `overflow-wrap` no se aplica donde no se permite ajustar. Con
 * una palabra más ancha que la pantalla el `inline-block` crecía hasta su ancho
 * natural y el hero —que recorta con `overflow-clip`— se la comía sin que nada
 * lo delatara: no hay barra de scroll horizontal, solo texto que desaparece.
 *
 * Medido en la portada, con el titular escrito desde el gestor de contenido:
 *
 *     320px  caben ~12 letras   «profundamente» 286px > 280px disponibles
 *                               «acompañamiento» 322px
 *                               «autoconocimiento» 337px
 *     390px  caben ~16 letras   «extraordinariamente» 377px > 350px
 *
 * O sea palabras normales en español, no casos rebuscados. `pre-wrap` conserva
 * el espacio igual que `pre` y además permite ajustar, que es lo que deja
 * actuar al `overflow-wrap: anywhere` que ya llevan los titulares.
 */
export function WordReveal({
  text,
  as = "span",
  className,
  delay = 0,
  wordDelay = STAGGER.word,
}: {
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  delay?: number;
  wordDelay?: number;
}) {
  const Tag = TAGS[as];
  const words = text.split(" ");

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden
          className="reveal reveal-on-load inline-block whitespace-pre-wrap"
          style={
            {
              "--reveal-delay": `${delay + i * wordDelay}s`,
              "--reveal-y": "0.6em",
            } as CSSProperties
          }
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
