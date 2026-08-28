import { defineField, defineType } from "sanity";
// Ver la nota en experience.ts: en @sanity/icons v5 el icono viene de su
// propia subruta, no del índice raíz.
import { CogIcon } from "@sanity/icons/Cog";

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

/**
 * Un capítulo de la portada.
 *
 * Cinco capítulos tienen la misma anatomía —titular a dos voces, párrafo, y a
 * veces una nota o una frase destacada— así que comparten forma. En el Studio
 * Emmy ve UN apartado por capítulo, no dieciocho campos sueltos con nombres
 * parecidos donde es imposible saber cuál sale dónde.
 *
 * Cada capítulo declara abajo qué hace con cada pieza, porque «nota» significa
 * una cosa en «Qué es Sunny» y otra en «Experiencias».
 */
function bloqueDeCapitulo(opciones: {
  name: string;
  title: string;
  description: string;
  campos: { acento?: string; texto?: string; nota?: string; cita?: string };
}) {
  const { campos } = opciones;
  return defineField({
    name: opciones.name,
    title: opciones.title,
    type: "object",
    group: "portada",
    description: opciones.description,
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({
        name: "titulo",
        title: "Titular",
        type: "string",
        description: "La primera parte del titular. Se dibuja en la tipografía de siempre.",
        validation: (Rule) => Rule.max(90).warning("Los titulares largos parten en demasiadas líneas."),
      }),
      ...(campos.acento
        ? [
            defineField({
              name: "acento",
              title: "Segunda parte del titular",
              type: "string",
              description: campos.acento,
              validation: (Rule) => Rule.max(70).warning("Los titulares largos parten en demasiadas líneas."),
            }),
          ]
        : []),
      ...(campos.texto
        ? [
            defineField({
              name: "texto",
              title: "Párrafo",
              type: "text",
              rows: 4,
              description: campos.texto,
              validation: (Rule) => Rule.max(400).warning("Más de 400 caracteres se lee largo en el celular."),
            }),
          ]
        : []),
      ...(campos.nota
        ? [defineField({ name: "nota", title: "Nota", type: "text", rows: 2, description: campos.nota })]
        : []),
      ...(campos.cita
        ? [defineField({ name: "cita", title: "Frase destacada", type: "text", rows: 2, description: campos.cita })]
        : []),
    ],
    preview: {
      select: { title: "titulo", subtitle: "acento" },
    },
  });
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
    // ── 01 · El manifiesto ───────────────────────────────────────────────
    defineField({
      name: "heroEyebrow",
      title: "Línea de contexto",
      type: "string",
      group: "portada",
      description: "La línea pequeña de arriba del todo. Hoy dice «Monterrey · Cada semana».",
      validation: (Rule) => Rule.max(40).warning("En el celular no caben más de unos 40 caracteres."),
    }),

    defineField({
      name: "heroTitle",
      title: "Título principal",
      type: "string",
      group: "portada",
      description:
        "Lo primero que se lee al entrar. Si escribes aquí la frase destacada tal cual, el sitio la parte en " +
        "líneas y la resalta en su sitio dentro de la oración.",
      validation: (Rule) =>
        Rule.required().max(70).warning("Más de 70 caracteres ocupa media pantalla en el celular."),
    }),

    defineField({
      name: "heroTitleAccent",
      title: "Frase destacada en amarillo",
      type: "string",
      group: "portada",
      description:
        "La parte del título que se pinta en amarillo y en cursiva. Escríbela EXACTAMENTE como aparece dentro " +
        "del título —sin las comillas— y el sitio la resaltará ahí mismo. Si no aparece en el título, se " +
        "dibuja debajo como una segunda línea. Puedes dejarla vacía: el título se lee entero en blanco.",
      validation: (Rule) => Rule.max(45).warning("Una frase corta resalta más que una larga."),
    }),

    defineField({
      name: "heroImage",
      title: "Fotografía de fondo",
      type: "image",
      group: "portada",
      options: { hotspot: true },
      description:
        "La fotografía que va detrás del título, a pantalla completa. Sin ella el fondo es carbón liso. " +
        "Elige una donde el centro no tenga detalle importante: encima va el título.",
      fields: [
        defineField({
          name: "alt",
          title: "Descripción de la imagen",
          type: "string",
          description: "Para quien no puede ver la foto. Describe qué se ve.",
          validation: (Rule) => Rule.min(10).error("Hace falta describir la imagen para que el sitio sea accesible."),
        }),
      ],
    }),

    defineField({
      name: "heroSubtitle",
      title: "Nota de la esquina",
      type: "text",
      rows: 3,
      group: "portada",
      description:
        "La línea pequeña de la esquina de abajo, debajo de la raya. Explica qué es Sunny a quien llega sin " +
        "contexto. Va en voz baja: no compite con el título.",
      validation: (Rule) => Rule.max(200).warning("Es una nota al margen; más de 200 caracteres pesa demasiado."),
    }),

    // ── Los capítulos ────────────────────────────────────────────────────
    bloqueDeCapitulo({
      name: "bloqueExperiencias",
      title: "Capítulo · Lo que hay ahora",
      description: "El bloque que encabeza la lista de experiencias de la portada.",
      campos: { nota: "La línea del extremo derecho, junto al enlace al catálogo." },
    }),

    bloqueDeCapitulo({
      name: "bloqueSunny",
      title: "Capítulo · Qué es Sunny",
      description: "El capítulo que explica el proyecto. Es donde alguien entiende que hay una selección.",
      campos: {
        acento: "Se dibuja en naranja y en cursiva, seguido del titular.",
        texto: "El párrafo que explica qué hace Sunny y quién elige.",
        nota: "Ficha «Qué vas a encontrar»: qué clase de experiencias hay.",
        cita: "Ficha «Quién participa»: qué clase de espacios entran.",
      },
    }),

    bloqueDeCapitulo({
      name: "bloqueRecorrido",
      title: "Capítulo · Cómo funciona",
      description:
        "Solo la entrada del capítulo. Los cuatro pasos NO se editan aquí: describen cómo funciona de verdad " +
        "el producto y cambiarlos podría prometer algo que no ocurre.",
      campos: { acento: "Se dibuja en naranja y en cursiva, debajo del titular." },
    }),

    bloqueDeCapitulo({
      name: "bloqueComunidad",
      title: "Capítulo · Comunidad",
      description: "El capítulo de fondo oscuro. El titular es el elemento visual, así que conviene que sea corto.",
      campos: {
        acento: "Se dibuja en amarillo y en cursiva, seguido del titular.",
        texto: "El párrafo que explica cómo se junta la gente.",
        cita: "La frase con raya amarilla al lado.",
      },
    }),

    bloqueDeCapitulo({
      name: "bloqueNegocios",
      title: "Capítulo · Para negocios",
      description: "La propuesta a los espacios, en la portada. La página /para-negocios repite este mismo mensaje.",
      campos: {
        acento: "Se dibuja en naranja y en cursiva, seguido del titular.",
        texto: "El párrafo que explica la colaboración.",
      },
    }),

    bloqueDeCapitulo({
      name: "bloqueCierre",
      title: "Capítulo · Cierre",
      description: "El bloque amarillo del final, justo antes de las preguntas.",
      campos: { acento: "Se dibuja en cursiva, debajo del titular." },
    }),

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
      description: "La frase que describe Sunny en el pie de TODAS las páginas.",
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
