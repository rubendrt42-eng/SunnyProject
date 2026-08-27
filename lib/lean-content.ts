import type { SiteSettings } from "@/lib/sanity/types";

/**
 * Los textos con los que arranca el sitio antes de que Emmy escriba los suyos.
 *
 * Existen para que el MVP se pueda desplegar y revisar con el documento de
 * textos vacío. En cuanto ella publique el suyo en Sanity, estos dejan de
 * usarse campo por campo — no es todo o nada: si llena el titular pero no las
 * preguntas frecuentes, se usa su titular y estas preguntas.
 *
 * No son texto de relleno. Son la versión que ya está escrita y aprobada del
 * sitio actual, para que lo primero que se vea sea correcto y no un «Lorem
 * ipsum» esperando a que alguien lo arregle.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  heroTitle: "Descubre algo nuevo.",
  heroTitleAccent: "Vívelo con alguien.",
  heroSubtitle:
    "Experiencias locales para salir de la rutina, conectar y formar parte de una comunidad que busca crecer.",
  aboutShortText:
    "The Sunny Project nace de una idea simple: probar cosas nuevas es más fácil —y mucho mejor— cuando no lo haces solo. Cada semana reunimos experiencias de espacios locales de Monterrey para que descubras algo distinto y conozcas gente en el camino.",
  faq: [
    {
      question: "¿Cuánto cuesta?",
      answer:
        "Nada. Solicitas tu lugar y, si hay disponibilidad, te confirmamos por WhatsApp. No se cobra nada por el sitio.",
    },
    {
      question: "¿Necesito crear una cuenta?",
      answer: "No. Solo dejas tu nombre, tu WhatsApp y tu correo al solicitar un lugar.",
    },
    {
      question: "¿Solicitar un lugar significa que ya estoy confirmado?",
      answer:
        "No. Al enviar el formulario nos llega tu solicitud y revisamos la disponibilidad del espacio. Tu lugar queda confirmado cuando te escribimos, no antes.",
    },
    {
      question: "¿Cómo sé si mi lugar fue confirmado?",
      answer:
        "Te escribimos por WhatsApp al número que dejaste en el formulario. Si no hay cupo, también te avisamos.",
    },
    {
      question: "¿Qué pasa si una experiencia está agotada?",
      answer:
        "La experiencia sigue visible pero ya no admite nuevas solicitudes. Puedes revisar las demás experiencias disponibles.",
    },
    {
      question: "¿Dónde veo nuevas experiencias?",
      answer:
        "En la sección de experiencias. Se actualiza cuando publicamos algo nuevo, y las que ya ocurrieron desaparecen solas.",
    },
    {
      question: "¿Puedo llevar a alguien?",
      answer: "Sí. Al solicitar tu lugar indicas cuántas personas van, y lo confirmamos según el cupo del espacio.",
    },
    {
      question: "¿Puedo proponer mi negocio o espacio?",
      answer:
        "Sí. Déjanos tus datos en la sección para negocios. Revisamos cada propuesta y te escribimos para platicar cómo podría funcionar.",
    },
  ],
};

/**
 * Enlace de WhatsApp a partir del número guardado.
 *
 * `wa.me` exige solo dígitos con código de país. El esquema de Sanity ya valida
 * el formato, pero se vuelve a limpiar aquí porque un número guardado antes de
 * esa validación seguiría en la base y rompería el enlace en silencio — se
 * abriría WhatsApp con un contacto vacío, que es peor que no tener el botón.
 */
export function whatsappLink(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/**
 * El antetítulo de la lista de la portada.
 *
 * Decía «Esta semana» siempre que hubiera algo publicado, sin mirar la fecha.
 * Medido en producción el 20 de agosto de 2026: la experiencia más próxima
 * empezaba el 14 de septiembre —25 días después— y la portada seguía
 * anunciando «Esta semana» encima de dos tarjetas fechadas en septiembre. El
 * comentario del código ya decía «solo si de verdad hay algo esta semana»; la
 * condición no lo hacía.
 *
 * Importa porque el sitio promete cadencia semanal en la marca («Monterrey ·
 * Cada semana») y en el paso 01. Si el antetítulo la afirma cuando el catálogo
 * no la sostiene, la primera vez que alguien compare la etiqueta con la fecha
 * de la tarjeta deja de creerse las dos.
 *
 * Siete días desde ahora, no la semana del calendario: quien lee «esta semana»
 * un domingo no se refiere a que quedan unas horas de domingo.
 */
export function antetituloDeLaLista(
  experiencias: readonly { startDateTime: string }[],
  ahora: Date = new Date(),
): "Esta semana" | "Próximas fechas" {
  const limite = ahora.getTime() + 7 * 24 * 60 * 60 * 1000;
  const hayAlgoEstaSemana = experiencias.some((e) => {
    const inicio = new Date(e.startDateTime).getTime();
    // Una fecha ilegible no puede sostener la promesa, así que no la cuenta.
    return Number.isFinite(inicio) && inicio <= limite;
  });
  return hayAlgoEstaSemana ? "Esta semana" : "Próximas fechas";
}

/**
 * EL RECORRIDO, EN UN SOLO SITIO.
 *
 * Estos cinco pasos los cuentan dos pantallas: el capítulo «Cómo funciona» de
 * la portada y la página `/como-funciona` que cuelga del menú. Estaban escritos
 * dos veces, y pasó lo que pasa siempre: la portada se actualizó a cinco pasos
 * y la página se quedó en tres. Durante un rato el sitio se contradijo a sí
 * mismo según por dónde entraras.
 *
 * Ahora hay una sola lista. Cada pantalla la compone a su manera —la portada en
 * zigzag, la página como índice— pero las dos leen de aquí.
 *
 * `ruptura` marca el paso donde el recorrido se detiene a decir que solicitar
 * no es estar confirmado. Es el único punto donde alguien puede llevarse una
 * idea equivocada y presentarse a una clase donde no lo esperan, así que va
 * señalado en los datos y no en cada maquetación.
 */
export interface PasoDelRecorrido {
  numero: string;
  titulo: string;
  texto: string;
  /**
   * El verbo del paso, para la lámina que acompaña al recorrido.
   *
   * No es copy nuevo: es el verbo que ya encabeza cada título, aislado. La
   * lámina necesita una palabra que se lea a dos metros mientras el texto de al
   * lado se lee de cerca, y repetir el título entero ahí sería decirlo dos veces
   * en la misma pantalla.
   */
  clave: string;
  ruptura?: boolean;
}

export const RECORRIDO: PasoDelRecorrido[] = [
  {
    numero: "01",
    titulo: "Encuentra algo que quieras vivir",
    clave: "Encuentra",
    texto: "Explora las experiencias disponibles.",
  },
  {
    numero: "02",
    titulo: "Solicita tu lugar",
    clave: "Solicita",
    texto: "Deja tus datos. No necesitas crear una cuenta.",
  },
  {
    numero: "03",
    titulo: "Sunny revisa disponibilidad",
    clave: "Revisa",
    texto: "La solicitud llega y se revisa si todavía existe lugar.",
    ruptura: true,
  },
  {
    numero: "04",
    titulo: "Recibe tu confirmación",
    clave: "Confirma",
    texto: "Sunny se comunica por WhatsApp.",
  },
  {
    numero: "05",
    titulo: "Vive la experiencia",
    clave: "Vive",
    texto: "Llegas al espacio y formas parte de la experiencia.",
  },
];
