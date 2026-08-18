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
  heroTitle: "Descubre algo nuevo. Vívelo con alguien.",
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
