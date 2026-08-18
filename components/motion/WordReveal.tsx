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
 * `whitespace-pre` es obligatorio: el espacio final vive dentro del `span`, y
 * en un `inline-block` un espacio final se colapsa. Sin esto el hero decía
 * «Descubre algonuevo. Vívelocon alguien.» Detectado en capturas de QA.
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
          className="reveal reveal-on-load inline-block whitespace-pre"
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
