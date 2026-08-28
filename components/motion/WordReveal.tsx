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
/**
 * Quita comillas y puntuación de los bordes para poder comparar palabras.
 *
 * Hace falta porque la frase que se resalta se escribe sin comillas —«qué buen
 * plan»— pero en el titular llega entre ellas —«"qué buen plan"»—, pegadas a la
 * primera y a la última palabra. Comparando en crudo nunca coincidirían.
 */
function limpia(palabra: string) {
  return palabra
    .replace(/[“”"«»'‘’.,;:!?¡¿()]/g, "")
    .toLocaleLowerCase("es");
}

/**
 * Dónde empieza y acaba la frase resaltada, contada en palabras.
 *
 * Se busca sobre las palabras del titular ya partido, no sobre la cadena: así
 * el resalte cae en palabras enteras y las comillas viajan pegadas a la palabra
 * que las lleva, que es como se leen.
 */
function rangoResaltado(palabras: string[], frase?: string | null) {
  const objetivo = frase?.trim();
  if (!objetivo) return null;
  const buscadas = objetivo.split(/\s+/).map(limpia);
  const limpias = palabras.map(limpia);
  for (let i = 0; i + buscadas.length <= limpias.length; i++) {
    if (buscadas.every((b, k) => limpias[i + k] === b)) {
      return { desde: i, hasta: i + buscadas.length - 1 };
    }
  }
  return null;
}

/**
 * Parte el titular en las tres líneas que dicta la frase destacada.
 *
 * Devuelve lo que va antes, la frase, y lo que va después — cada una con el
 * índice global de su primera palabra, para que el escalonado de la animación
 * siga siendo uno solo de principio a fin y no se reinicie en cada línea.
 *
 * Si la frase no aparece en el titular, devuelve una sola línea con todo: el
 * titular no puede romperse porque alguien escriba mal la frase destacada.
 */
function partirEnLineas(palabras: string[], rango: { desde: number; hasta: number } | null) {
  if (!rango) return [{ desde: 0, palabras, resaltada: false }];
  const lineas: { desde: number; palabras: string[]; resaltada: boolean }[] = [];
  if (rango.desde > 0) lineas.push({ desde: 0, palabras: palabras.slice(0, rango.desde), resaltada: false });
  lineas.push({ desde: rango.desde, palabras: palabras.slice(rango.desde, rango.hasta + 1), resaltada: true });
  if (rango.hasta < palabras.length - 1) {
    lineas.push({ desde: rango.hasta + 1, palabras: palabras.slice(rango.hasta + 1), resaltada: false });
  }
  return lineas;
}

export function WordReveal({
  text,
  as = "span",
  className,
  delay = 0,
  wordDelay = STAGGER.word,
  resaltar,
  claseResalte,
  enLineas = false,
}: {
  text: string;
  as?: keyof typeof TAGS;
  className?: string;
  delay?: number;
  wordDelay?: number;
  /**
   * Frase del propio texto que va con otra voz. Si no aparece tal cual, no se
   * resalta nada y el titular se dibuja entero igual: no puede romperse.
   */
  resaltar?: string | null;
  /** Clases que se aplican a las palabras resaltadas. */
  claseResalte?: string;
  /**
   * Pone la frase destacada en su propio renglón, con lo de antes encima y lo
   * de después debajo.
   *
   * Sin esto la frase resalta dentro del párrafo del titular y el salto de
   * línea lo decide el ancho disponible, así que «qué buen plan» se parte por
   * la mitad en cuanto cambia la pantalla. Con esto los tres renglones son
   * fijos y la frase se lee siempre entera.
   */
  enLineas?: boolean;
}) {
  const Tag = TAGS[as];
  const words = text.split(" ");
  const rango = rangoResaltado(words, resaltar);

  const palabra = (word: string, i: number, resaltada: boolean, ultima: boolean) => (
    <span
      key={`${word}-${i}`}
      aria-hidden
      className={
        resaltada
          ? `reveal reveal-on-load inline-block whitespace-pre-wrap ${claseResalte ?? ""}`
          : "reveal reveal-on-load inline-block whitespace-pre-wrap"
      }
      style={
        {
          "--reveal-delay": `${delay + i * wordDelay}s`,
          "--reveal-y": "0.6em",
        } as CSSProperties
      }
    >
      {word}
      {ultima ? "" : " "}
    </span>
  );

  if (enLineas && rango) {
    return (
      <Tag className={className}>
        <span className="sr-only">{text}</span>
        {partirEnLineas(words, rango).map((linea) => (
          <span key={linea.desde} aria-hidden className="block">
            {linea.palabras.map((w, k) =>
              palabra(w, linea.desde + k, linea.resaltada, k === linea.palabras.length - 1),
            )}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {words.map((word, i) =>
        palabra(word, i, Boolean(rango && i >= rango.desde && i <= rango.hasta), i === words.length - 1),
      )}
    </Tag>
  );
}
