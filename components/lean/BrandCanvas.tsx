/**
 * El lienzo de marca: lo que se dibuja donde iría una fotografía que todavía no
 * existe.
 *
 * POR QUÉ EXISTE
 *
 * La auditoría encontró que las tarjetas sin imagen mostraban un rectángulo
 * gris con el texto «Sin fotografía». Eso no es un estado vacío, es un error a
 * la vista: comunica que algo falló, justo en el elemento que sostiene el
 * argumento de la página.
 *
 * La ausencia de fotografía es un hecho real de esta etapa —Emmy todavía no ha
 * subido las suyas, y las de referencia no tienen licencia para publicarse—.
 * Así que la ausencia se dibuja **a propósito**, con la paleta y las formas del
 * sistema, para que parezca una decisión y no un hueco.
 *
 * TODO ES CSS, SIN ARCHIVOS
 *
 * Gradientes y formas con `radial-gradient` y `conic-gradient`, más la textura
 * de grano que ya usa el hero. Cero peticiones de red, cero peso de imagen,
 * cero problemas de licencia. Y como no hay `<img>`, tampoco hay salto de
 * layout mientras carga.
 *
 * DETERMINISTA
 *
 * La variante se elige a partir del texto que se le pasa (`seed`), no al azar:
 * la misma experiencia dibuja siempre el mismo lienzo, en la tarjeta y en su
 * página de detalle. Si fuera aleatorio, recargar cambiaría el color y el sitio
 * parecería inestable.
 */

/** Las cuatro variantes. Todas salen de la paleta; ninguna introduce un color nuevo. */
const VARIANTES = [
  {
    fondo: "radial-gradient(120% 90% at 15% 10%, #f8d347 0%, #f4d98a 38%, #f4f1e8 78%)",
    figura: "conic-gradient(from 210deg at 70% 75%, rgba(255,122,61,.42), rgba(248,211,71,0) 55%)",
  },
  {
    fondo: "radial-gradient(110% 100% at 85% 15%, #ff7a3d 0%, #f2b183 42%, #f4f1e8 80%)",
    figura: "conic-gradient(from 30deg at 25% 80%, rgba(248,211,71,.5), rgba(255,122,61,0) 52%)",
  },
  {
    fondo: "radial-gradient(130% 85% at 50% 0%, #23231f 0%, #3d3d34 45%, #6d6d65 100%)",
    figura: "conic-gradient(from 140deg at 30% 70%, rgba(248,211,71,.34), rgba(23,23,20,0) 58%)",
  },
  {
    fondo: "radial-gradient(115% 95% at 10% 85%, #f8d347 0%, #f2b183 40%, #fffdfc 82%)",
    figura: "conic-gradient(from 300deg at 75% 20%, rgba(255,122,61,.38), rgba(255,253,252,0) 50%)",
  },
] as const;

/** Suma de códigos de carácter. No necesita ser un buen hash: solo estable. */
function variantePara(seed: string): (typeof VARIANTES)[number] {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % 997;
  return VARIANTES[n % VARIANTES.length];
}

/** Igual que `variantePara`, saltándose la variante oscura. */
function varianteClara(seed: string): (typeof VARIANTES)[number] {
  const claras = VARIANTES.filter((_, i) => i !== 2);
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % 997;
  return claras[n % claras.length];
}

export function BrandCanvas({
  seed,
  className = "",
  label,
  tone = "auto",
}: {
  /** Texto estable —normalmente el título— del que sale la variante. */
  seed: string;
  className?: string;
  /**
   * Qué anunciar a un lector de pantalla. Por defecto **nada**: es decoración,
   * y describir un degradado no ayuda a nadie a decidir si le interesa la
   * experiencia. El título ya está en el encabezado, a un elemento de distancia.
   */
  label?: string;
  /**
   * `"light"` excluye la variante oscura. Sobre un fondo carbón, un lienzo
   * carbón se lee como un hueco, no como una pieza.
   */
  tone?: "auto" | "light";
}) {
  const v = tone === "light" ? varianteClara(seed) : variantePara(seed);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: v.fondo }}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <div className="absolute inset-0" style={{ background: v.figura }} />
      {/* El mismo grano del hero: quita el aspecto de degradado plano de plantilla. */}
      <div className="hero-grain absolute inset-0" />
      {/* Arco fino de marca. Da un punto de foco sin llegar a ser un logotipo. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-[0.22]"
      >
        <circle cx="50" cy="52" r="26" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-carbon" />
        <circle cx="50" cy="52" r="38" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-carbon" />
      </svg>
    </div>
  );
}
