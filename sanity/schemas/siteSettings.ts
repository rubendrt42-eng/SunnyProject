import { defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons";

/**
 * Los textos del sitio que Emmy puede cambiar sin tocar código.
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
    { name: "portada", title: "Portada", default: true },
    { name: "contacto", title: "Contacto" },
    { name: "faq", title: "Preguntas frecuentes" },
  ],

  fields: [
    defineField({
      name: "heroTitle",
      title: "Titular de la portada",
      type: "string",
      group: "portada",
      description:
        "Lo primero que se lee al entrar al sitio. Corto y directo. " +
        "Si lo escribes en DOS frases separadas por un punto, la segunda se " +
        "dibuja en amarillo Sunny debajo de la primera — que es lo que le da " +
        "carácter a la portada. Ejemplo: «Descubre algo nuevo. Vívelo con " +
        "alguien.» Si escribes una sola frase, se ve toda en blanco.",
      validation: (Rule) => Rule.required().max(70),
    }),

    defineField({
      name: "heroImage",
      title: "Fotografía de la portada",
      description:
        "Opcional. Si la dejas vacía, la portada usa una composición gráfica de Sunny. En cuanto subas una foto, se usa esa.",
      type: "image",
      group: "portada",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo de la fotografía",
          description:
            "Describe brevemente lo que aparece en la foto. Ayuda a personas que utilizan lectores de pantalla.",
          type: "string",
          validation: (Rule) =>
            Rule.required().warning("Sin esta descripción, quien use un lector de pantalla no sabrá qué se ve."),
        }),
      ],
    }),

    defineField({
      name: "heroSubtitle",
      title: "Subtítulo de la portada",
      type: "text",
      rows: 2,
      group: "portada",
      description: "Una o dos líneas debajo del titular, explicando qué es Sunny.",
      validation: (Rule) => Rule.required().max(200),
    }),

    defineField({
      name: "aboutShortText",
      title: "Qué es The Sunny Project",
      type: "text",
      rows: 5,
      group: "portada",
      description: "El párrafo de la sección «Qué es Sunny». Cuenta la idea y de dónde viene.",
      validation: (Rule) => Rule.required().min(60),
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
