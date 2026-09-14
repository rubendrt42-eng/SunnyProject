/**
 * LA ESTRELLA Y EL SOL, DIBUJADOS EN VECTORIAL.
 *
 * POR QUÉ NO SON UN RECORTE
 *
 * Se intentó extraerlos de una publicación de Instagram. El fondo se pudo
 * modelar y restar sin problema, pero la ilustración de origen es una PAREJA
 * que va de la mano: cada personaje tapa un trozo del otro, así que al
 * separarlos la estrella perdía el brazo derecho y el sol arrastraba un pedazo
 * del cuerpo de la estrella. Figuras incompletas, y se notaba.
 *
 * Redibujados se resuelven los tres problemas de golpe: están completos, son
 * nítidos a cualquier tamaño y pesan unos pocos kilobytes en vez de sesenta.
 *
 * LOS COLORES SON LOS DEL ORIGINAL
 *
 * Muestreados del propio archivo, no elegidos a ojo: amarillo #F5C94C, naranja
 * #E69439, blanco de los tenis #FFFFFF, crema de los calcetines #F2E3C8.
 *
 * CÓMO ESTÁ CONSTRUIDO
 *
 * El aspecto redondeado no viene de curvas dibujadas a mano sino del trazo:
 * un contorno grueso con `stroke-linejoin="round"` redondea las puntas solo.
 * Los brazos y las piernas son líneas con `stroke-linecap="round"` pintadas
 * dos veces —negro grueso debajo, color encima— que es lo que da el tubo con
 * contorno.
 */
const TINTA = "#1A1A1A";
const AMARILLO = "#F5C94C";
const NARANJA = "#E69439";
const CREMA = "#F2E3C8";

/** Ojos cerrados y sonrisa. Los dos personajes llevan la misma cara. */
function Cara({ cx, cy, escala = 1 }: { cx: number; cy: number; escala?: number }) {
  const s = escala;
  return (
    <g
      fill="none"
      stroke={TINTA}
      strokeWidth={5.5 * s}
      strokeLinecap="round"
      transform={`translate(${cx} ${cy})`}
    >
      {/* Ojos: arcos hacia abajo — cerrados y contentos. */}
      <path d={`M${-24 * s} ${-6 * s} a ${12 * s} ${10 * s} 0 0 0 ${22 * s} 0`} />
      <path d={`M${4 * s} ${-6 * s} a ${12 * s} ${10 * s} 0 0 0 ${22 * s} 0`} />
      {/* Sonrisa */}
      <path d={`M${-17 * s} ${16 * s} a ${18 * s} ${15 * s} 0 0 0 ${34 * s} 0`} />
    </g>
  );
}

/** Un brazo o una pierna: tubo con contorno. */
function Miembro({ d, ancho = 18 }: { d: string; ancho?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={TINTA} strokeWidth={ancho + 10} strokeLinecap="round" />
      <path d={d} fill="none" stroke={AMARILLO} strokeWidth={ancho} strokeLinecap="round" />
    </>
  );
}

/** Tenis: la suela sobresale, que es lo que los hace reconocibles. */
function Tenis({ x, y, giro = 0 }: { x: number; y: number; giro?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <path
        d="M-8 -18 q28 0 35 15 q6 12 -8 17 q-18 6 -35 1 q-12 -4 -12 -17 q0 -16 20 -16 Z"
        fill="#FFFFFF"
        stroke={TINTA}
        strokeWidth={8}
        strokeLinejoin="round"
      />
      <path d="M-27 11 q24 9 56 2" fill="none" stroke={TINTA} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
}

export function EstrellaSunni({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 250 260" className={className} role="presentation" aria-hidden focusable="false">
      {/* Brazos y piernas primero: van por detrás del cuerpo. */}
      <Miembro d="M104 150 L96 198" />
      <Miembro d="M142 148 L152 196" />
      <Miembro d="M66 116 L26 116" />
      <Miembro d="M174 114 L214 114" />
      <circle cx={24} cy={116} r={16} fill={AMARILLO} stroke={TINTA} strokeWidth={8.5} />
      <circle cx={216} cy={114} r={16} fill={AMARILLO} stroke={TINTA} strokeWidth={8.5} />
      {/* Calcetines */}
      <path d="M96 190 L96 206" stroke={CREMA} strokeWidth={16} strokeLinecap="round" />
      <path d="M152 188 L152 204" stroke={CREMA} strokeWidth={16} strokeLinecap="round" />
      <Tenis x={90} y={222} giro={-8} />
      <Tenis x={158} y={220} giro={7} />
      {/* El cuerpo. Las puntas se redondean con el propio trazo. */}
      <path
        d="M120 28 L146 76 L200 86 L162 126 L169 180 L120 156 L71 180 L78 126 L40 86 L94 76 Z"
        fill={AMARILLO}
        stroke={TINTA}
        strokeWidth={9.5}
        strokeLinejoin="round"
      />
      <Cara cx={120} cy={108} />
    </svg>
  );
}

export function SolSunni({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 250 285" className={className} role="presentation" aria-hidden focusable="false">
      <Miembro d="M104 186 L96 222" />
      <Miembro d="M142 184 L152 220" />
      <Miembro d="M64 128 L26 128" />
      <Miembro d="M176 126 L214 126" />
      <circle cx={24} cy={128} r={16} fill={AMARILLO} stroke={TINTA} strokeWidth={8.5} />
      <circle cx={216} cy={126} r={16} fill={AMARILLO} stroke={TINTA} strokeWidth={8.5} />
      <path d="M96 214 L96 230" stroke={CREMA} strokeWidth={16} strokeLinecap="round" />
      <path d="M152 212 L152 228" stroke={CREMA} strokeWidth={16} strokeLinecap="round" />
      <Tenis x={90} y={246} giro={-8} />
      <Tenis x={158} y={244} giro={7} />
      {/* Los rayos: once puntas cortas y anchas. Más largas parecerían púas. */}
      <path
        d="M120 32 L137 61 L168 46 L167 79 L200 83 L181 111 L207 133 L176 146 L187 178 L154 172 L145 204 L120 182 L95 204 L86 172 L53 178 L64 146 L33 133 L59 111 L40 83 L73 79 L72 46 L103 61 Z"
        fill={NARANJA}
        stroke={TINTA}
        strokeWidth={9.5}
        strokeLinejoin="round"
      />
      {/* La cara, en un círculo amarillo por delante de los rayos. */}
      <circle cx={120} cy={118} r={54} fill={AMARILLO} stroke={TINTA} strokeWidth={9.5} />
      <Cara cx={120} cy={116} escala={0.95} />
    </svg>
  );
}
