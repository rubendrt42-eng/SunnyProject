import { defineField, defineType } from "sanity";
// Ver la nota en experience.ts: en @sanity/icons v5 el icono viene de su
// propia subruta, no del índice raíz.
import { CogIcon } from "@sanity/icons/Cog";

/**
 * Los textos del sitio que Emmy puede cambiar sin tocar código.
 *
 * SE FUERON ONCE CAMPOS, Y ERA URGENTE
 *
 * Este documento tenía los textos de la portada de The Sunny Project: el
 * titular, la frase destacada, la fotografía de fondo y seis bloques de
 * capítulo. La portada de Sun-i project® no usa ninguno.
 *
 * Quedarse en el Studio sin salir en la web es la peor forma de estar: Emmy
 * los veía, podía escribir en ellos, y no pasaba nada. Encima `heroTitle` era
 * obligatorio, así que el documento mostraba un aviso de validación por un
 * campo que el sitio ya no lee.
 *
 * Lo que queda es lo que de verdad se dibuja, verificado siguiendo los
 * imports desde las rutas públicas.
 *
 * PENDIENTE
 *
 * Los textos de la portada de Sun-i viven hoy en `lib/sunni-content.ts`, en
 * código. Pasarlos aquí es un trabajo aparte y con su propia decisión: hacerlo
 * mal significa otros veinte campos sueltos que nadie sabe dónde salen.
 *
 * Documento único: no hay «crear otro». Se fuerza con un id fijo desde la
 * estructura del Studio (ver sanity/structure.ts), porque un singleton
 * duplicado es una de las formas más silenciosas de romper un sitio con CMS
 * — la consulta trae uno de los dos y nadie sabe cuál.
 *
 * LO QUE DELIBERADAMENTE NO ESTÁ AQUÍ
 *
 * El CMS administra CONTENIDO, no diseño. No hay campos para colores,
 * tipografías, orden de secciones ni creación de páginas. Esa frontera es lo
 * que impide que el sitio se degrade con el uso: cada campo que se abre a
 * edición libre es una manera nueva de que la portada quede rota sin que nadie
 * lo haya querido.
 */
/**
 * Revisa el número de WhatsApp que se guarda en los ajustes del sitio.
 *
 * POR QUÉ NO BASTA CON «ENTRE 10 Y 15 DÍGITOS»
 *
 * `wa.me` exige el número **con código de país**. Sin él, WhatsApp abre con un
 * contacto vacío o con el aviso de que el número no es correcto — y ese enlace
 * sale en el pie de TODAS las páginas.
 *
 * La regla anterior aceptaba 10 dígitos. Un número mexicano se escribe con 10
 * dígitos: 8112345678. Es exactamente lo que cualquiera teclea, pasaba la
 * validación sin una sola queja, y dejaba el enlace roto en todo el sitio. La
 * descripción del campo sí pedía el código de país; la regla no lo exigía, y
 * lo que manda es la regla.
 *
 * Ahora el mínimo son 11 dígitos, que es lo menos que suma cualquier código de
 * país más su número nacional (México 52+10=12, Estados Unidos 1+10=11,
 * España 34+9=11). Y cuando llegan exactamente 10 se dice qué falta y cómo
 * arreglarlo, en vez de repetir el formato.
 */
export function revisarWhatsapp(valor: string): true | string {
  if (!/^\d+$/.test(valor)) return "Solo números: sin espacios, guiones, paréntesis ni el signo +.";
  if (valor.length === 10) return `Falta el código de país. Para México va 52 delante: 52${valor}`;
  if (valor.length < 11 || valor.length > 15) {
    return "Entre 11 y 15 dígitos, contando el código de país (52 para México).";
  }
  return true;
}

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Textos del sitio",
  type: "document",
  icon: CogIcon,

  groups: [
    { name: "contacto", title: "Marca y contacto", default: true },
    { name: "faq", title: "Preguntas frecuentes" },
  ],

  fields: [
    // ── Marca ────────────────────────────────────────────────────────────
    defineField({
      name: "seoTitle",
      title: "Título en Google y al compartir",
      type: "string",
      group: "contacto",
      description: "Lo que se lee en la pestaña del navegador y en los resultados de búsqueda de la portada.",
      validation: (Rule) => Rule.max(60).warning("Google corta los títulos a partir de unos 60 caracteres."),
    }),

    defineField({
      name: "seoDescription",
      title: "Descripción en Google y al compartir",
      type: "text",
      rows: 3,
      group: "contacto",
      description: "El párrafo que sale debajo del título en Google y en la vista previa de WhatsApp.",
      validation: (Rule) => Rule.max(160).warning("Google corta las descripciones a partir de unos 160 caracteres."),
    }),

    defineField({
      name: "footerDescripcion",
      title: "Descripción del pie",
      type: "text",
      rows: 2,
      group: "contacto",
      description: "La frase que describe Sun‑i en el pie de TODAS las páginas.",
      validation: (Rule) => Rule.max(160).warning("El pie es estrecho; más de 160 caracteres ocupa cuatro líneas."),
    }),

    defineField({
      name: "instagramUrl",
      title: "Instagram",
      type: "url",
      group: "contacto",
      description: "Dirección completa del perfil. Por ejemplo: https://instagram.com/thesunnyproject",
      validation: (Rule) => Rule.uri({ scheme: ["https"] }),
    }),

    defineField({
      name: "whatsapp",
      title: "WhatsApp",
      type: "string",
      group: "contacto",
      description:
        "Número con código de país y sin espacios ni signos. Por ejemplo: 528112345678. Se usa para armar el enlace de WhatsApp.",
      validation: (Rule) => Rule.custom((value) => (value ? revisarWhatsapp(value) : true)),
    }),

    defineField({
      name: "contactEmail",
      title: "Correo de contacto",
      type: "string",
      group: "contacto",
      description: "El correo que se muestra públicamente en el sitio.",
      validation: (Rule) => Rule.email(),
    }),

    defineField({
      name: "faq",
      title: "Preguntas frecuentes",
      type: "array",
      group: "faq",
      description: "Las dudas que se responden al final del sitio. Se muestran en el orden en que las pongas aquí.",
      of: [
        {
          type: "object",
          name: "faqItem",
          title: "Pregunta",
          fields: [
            defineField({
              name: "question",
              title: "Pregunta",
              type: "string",
              validation: (Rule) => Rule.required().min(5),
            }),
            defineField({
              name: "answer",
              title: "Respuesta",
              type: "text",
              rows: 3,
              validation: (Rule) => Rule.required().min(10),
            }),
          ],
          preview: {
            select: { title: "question", subtitle: "answer" },
          },
        },
      ],
    }),
  ],

  preview: {
    prepare: () => ({ title: "Textos del sitio" }),
  },
});
