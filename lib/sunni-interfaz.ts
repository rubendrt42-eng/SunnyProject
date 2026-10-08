import type { InterfazSunni, ProsaFormularioSanity } from "@/lib/sanity/types";

/**
 * LOS TEXTOS DE LA INTERFAZ: menú, pie y formularios.
 *
 * Todo lo que se lee en el sitio y NO es una sección de la portada vivía
 * escrito a mano dentro de los componentes. Emmy entraba a Sanity, no
 * encontraba el menú ni el pie ni lo que dice el formulario, y la respuesta
 * «eso está en el código» no sirve: si para cambiar una palabra hace falta
 * un commit, el gestor de contenido no está terminado.
 *
 * Este archivo es el valor por defecto. Sanity manda encima, campo por campo,
 * con la misma regla de siempre: **un campo vacío en Sanity nunca deja un
 * hueco**, se usa el de aquí.
 *
 * QUÉ NO ENTRA, A PROPÓSITO
 *
 * Las etiquetas de cada casilla del formulario y sus listas de opciones. No
 * por pereza: son cuarenta y tantos campos más en el Studio, y cada uno
 * acaba escrito tal cual en una columna de la hoja de cálculo. Mezclar en la
 * misma pantalla «cómo se llama el botón» con «qué opciones acepta la casilla
 * de aforo» hace que no se encuentre ninguna de las dos. Si Emmy necesita
 * cambiar una etiqueta, se cambia aquí en un minuto.
 */

export const NAVEGACION = {
  enlaces: [
    { href: "/#que-hacemos", label: "What is Sun‑i" },
    { href: "/#vending", label: "Vending" },
    { href: "/#experiences", label: "Experiences" },
    { href: "/#brands", label: "For Brands" },
  ],
  /** El botón de la cabecera. Es la conversión principal del sitio. */
  boton: "Bring Sun-i",
} as const;

export const PIE = {
  tituloExplora: "Explora",
  tituloAyuda: "Ayuda",
  tituloContacto: "Contacto",
  enlaces: [
    { href: "/#que-hacemos", label: "What is Sun‑i" },
    { href: "/#vending", label: "Sun‑i Vending" },
    { href: "/#experiences", label: "Sun‑i Experiences" },
    { href: "/#brands", label: "For Brands" },
  ],
  privacidad: "Privacidad",
  /** El año se pone solo: escribirlo a mano envejece el sitio en enero. */
  derechos: "Everyday wellness, lifestyle y tecnología.",
} as const;

/** Los botones del hero. Estaban escritos dentro del JSX de la portada. */
export const HERO_BOTONES = {
  principal: "Bring Sun‑i to your space",
  secundario: "Discover Sun‑i",
} as const;

export type ProsaFormulario = {
  titulo: string;
  intro: string;
  pie: string;
  boton: string;
  exito: string;
  exitoTexto: string;
};

export const FORMULARIOS: Record<"vending" | "experiences" | "brands", ProsaFormulario> = {
  vending: {
    titulo: "Bring Sun‑i to your space",
    intro: "Cuéntanos de tu espacio. Instalamos, surtimos y operamos: tú solo abres la puerta.",
    pie: "Sin costo de instalación · Sin contratos eternos",
    boton: "Quiero Sun‑i",
    exito: "Thanks — the sun is coming to you",
    exitoTexto: "Tu espacio ya está en nuestro radar. Te escribimos muy pronto.",
  },
  experiences: {
    titulo: "Experiencias Sun‑i",
    intro:
      "Cuéntanos qué quieres activar. Diseñamos la sesión, llevamos al facilitador y el material: tú solo invitas a tu gente.",
    pie: "Facilitador incluido · Material incluido",
    boton: "Enviar solicitud",
    exito: "Thanks — the sun is coming to you",
    exitoTexto: "Recibimos tu solicitud. Te escribimos muy pronto con los siguientes pasos.",
  },
  brands: {
    titulo: "Partner with Sun‑i",
    intro: "Cuéntanos de tu marca y de lo que te gustaría hacer con nosotros.",
    pie: "Respondemos en días hábiles",
    boton: "Enviar propuesta",
    exito: "Thanks — the sun is coming to you",
    exitoTexto: "Recibimos tu propuesta. Te escribimos muy pronto.",
  },
};

export const INTERFAZ_POR_DEFECTO = {
  navegacion: NAVEGACION,
  pie: PIE,
  heroBotones: HERO_BOTONES,
  formularios: FORMULARIOS,
} as const;

export type Interfaz = {
  navegacion: { enlaces: { href: string; label: string }[]; boton: string };
  pie: {
    tituloExplora: string;
    tituloAyuda: string;
    tituloContacto: string;
    enlaces: { href: string; label: string }[];
    privacidad: string;
    derechos: string;
  };
  heroBotones: { principal: string; secundario: string };
  formularios: Record<"vending" | "experiences" | "brands", ProsaFormulario>;
};

/* ────────────────────────────────────────────────────────────────────────
   LA MEZCLA CON SANITY

   No es la mezcla honda genérica de `lib/lean-content.ts` porque las formas
   no coinciden: aquí los enlaces son una lista con destino fijo y en el
   Studio son cuatro casillas sueltas (`enlace1`…`enlace4`). Esa diferencia
   es deliberada —una lista editable dejaría añadir un quinto enlace que no
   lleva a ninguna parte— y obliga a traducir en vez de a fusionar.

   La regla de siempre: un valor vacío, en blanco o nulo NUNCA pisa al del
   código.
   ──────────────────────────────────────────────────────────────────────── */


/** Devuelve `encima` solo si trae texto de verdad. */
function oSi(base: string, encima: string | null | undefined): string {
  const v = typeof encima === "string" ? encima.trim() : "";
  return v === "" ? base : v;
}

/** Cambia solo la etiqueta; el destino viene del código y no se toca. */
function etiquetas(
  base: readonly { href: string; label: string }[],
  de: (string | null | undefined)[],
): { href: string; label: string }[] {
  return base.map((e, i) => ({ href: e.href, label: oSi(e.label, de[i]) }));
}

function prosa(base: ProsaFormulario, de: ProsaFormularioSanity | null | undefined): ProsaFormulario {
  return {
    titulo: oSi(base.titulo, de?.titulo),
    intro: oSi(base.intro, de?.intro),
    pie: oSi(base.pie, de?.pie),
    boton: oSi(base.boton, de?.boton),
    exito: oSi(base.exito, de?.exito),
    exitoTexto: oSi(base.exitoTexto, de?.exitoTexto),
  };
}

export function interfazConSanity(de: InterfazSunni | null | undefined): Interfaz {
  const n = de?.navegacion;
  const p = de?.pie;
  return {
    navegacion: {
      enlaces: etiquetas(NAVEGACION.enlaces, [n?.enlace1, n?.enlace2, n?.enlace3, n?.enlace4]),
      boton: oSi(NAVEGACION.boton, n?.boton),
    },
    heroBotones: {
      principal: oSi(HERO_BOTONES.principal, de?.heroBotones?.principal),
      secundario: oSi(HERO_BOTONES.secundario, de?.heroBotones?.secundario),
    },
    pie: {
      tituloExplora: oSi(PIE.tituloExplora, p?.tituloExplora),
      tituloAyuda: oSi(PIE.tituloAyuda, p?.tituloAyuda),
      tituloContacto: oSi(PIE.tituloContacto, p?.tituloContacto),
      enlaces: etiquetas(PIE.enlaces, [p?.enlace1, p?.enlace2, p?.enlace3, p?.enlace4]),
      privacidad: oSi(PIE.privacidad, p?.privacidad),
      derechos: oSi(PIE.derechos, p?.derechos),
    },
    formularios: {
      vending: prosa(FORMULARIOS.vending, de?.vending),
      experiences: prosa(FORMULARIOS.experiences, de?.experiences),
      brands: prosa(FORMULARIOS.brands, de?.brands),
    },
  };
}
