import { defineField, defineType } from "sanity";

/**
 * LOS TEXTOS DE LA PORTADA.
 *
 * Siete apartados plegables, uno por sección y en el mismo orden en que se ven
 * al bajar por la página. Cerrados ocupan siete renglones; Emmy abre el que
 * quiere tocar y ve solo esos campos.
 *
 * QUÉ NO ESTÁ AQUÍ, Y ES A PROPÓSITO
 *
 * El orden de las secciones, los colores, la maquetación y las fotografías. Un
 * gestor administra CONTENIDO; cada campo que se abre a edición libre es una
 * manera nueva de que la portada quede rota sin que nadie lo haya querido.
 *
 * TODO ES OPCIONAL
 *
 * Lo que se deje vacío cae en el texto que hay hoy en `lib/sunni-content.ts`,
 * que está escrito y revisado. Vaciar un campo nunca deja un hueco.
 */

/** Los iconos disponibles. Si Emmy añade una fila, elige uno de esta lista. */
const ICONOS = [
  "Droplets", "Zap", "Target", "Leaf", "ShoppingBag", "Sparkles",
  "Dumbbell", "GraduationCap", "Building2", "Home", "BedDouble", "HeartPulse",
].map((v) => ({ title: v, value: v }));

const itemDeLista = (conIcono: boolean) => ({
  type: "object" as const,
  fields: [
    defineField({ name: "nombre", title: "Nombre", type: "string", validation: (R) => R.required() }),
    defineField({ name: "texto", title: "Descripción", type: "text", rows: 2 }),
    ...(conIcono
      ? [
          defineField({
            name: "icono",
            title: "Icono",
            type: "string",
            options: { list: ICONOS },
            description: "Elige de la lista. Si lo dejas vacío sale un icono genérico.",
          }),
        ]
      : []),
  ],
  preview: { select: { title: "nombre", subtitle: "texto" } },
});

const campo = (name: string, title: string, description: string, tipo: "string" | "text" = "string", rows = 3) =>
  defineField({ name, title, type: tipo, description, ...(tipo === "text" ? { rows } : {}) });

export const portada = defineType({
  name: "portadaSunni",
  title: "Portada",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    // ── 01 ──────────────────────────────────────────────────────────────
    defineField({
      name: "hero",
      title: "1 · Inicio",
      type: "object",
      options: { collapsible: true, collapsed: true },
      description: "Lo primero que se ve al entrar.",
      fields: [
        campo("badge", "Línea pequeña de arriba", "Hoy dice «Everyday wellness brand»."),
        campo("titulo", "Titular, primera parte", "Hoy dice «A little more»."),
        campo("tituloAcento", "Palabra en coral", "La parte del titular que se pinta en coral. Hoy «Sun‑i»."),
        campo("tituloFin", "Titular, última parte", "Hoy dice «in your everyday»."),
        campo("texto", "Párrafo", "El párrafo que explica la marca, debajo del titular.", "text", 5),
      ],
    }),

    // ── 02 ──────────────────────────────────────────────────────────────
    defineField({
      name: "queHacemos",
      title: "2 · Qué hacemos",
      type: "object",
      options: { collapsible: true, collapsed: true },
      description: "La sección de fondo crema con los dos bloques, justo debajo del inicio.",
      fields: [
        campo("eyebrow", "Antetítulo", "La línea coral en versalitas. Hoy «What is Sun‑i»."),
        campo("titulo", "Titular", "Hoy dice «Hoy Sun‑i llega de dos maneras»."),
        defineField({
          name: "bloques",
          title: "Los dos bloques",
          type: "array",
          description: "Vending y Experiences. Van del mismo tamaño a propósito: es lo que dice, sin repetirlo, que el vending no es la marca entera.",
          of: [
            {
              type: "object",
              fields: [
                defineField({ name: "rotulo", title: "Rótulo coral", type: "string" }),
                defineField({ name: "titulo", title: "Titular del bloque", type: "string" }),
                defineField({ name: "texto", title: "Párrafo", type: "text", rows: 3 }),
                defineField({ name: "enlace", title: "Texto del enlace", type: "string" }),
              ],
              preview: { select: { title: "rotulo", subtitle: "titulo" } },
            },
          ],
          validation: (R) => R.max(2).warning("La sección está pensada para dos bloques."),
        }),
      ],
    }),

    // ── 03 ──────────────────────────────────────────────────────────────
    defineField({
      name: "vending",
      title: "3 · Sun‑i Vending",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        campo("eyebrow", "Antetítulo", "Hoy «Sun‑i Vending»."),
        campo("titulo", "Titular", "El titular grande junto a la fotografía de la unidad."),
        campo("texto", "Párrafo", "Qué es la unidad y qué hacemos nosotros.", "text", 4),
        campo("nota", "Aclaración", "La línea en gris que recuerda que el vending no es la marca entera.", "text", 2),
        campo("frase", "Frase en coral", "La frase grande en coral. Hoy «Choose your good mood here»."),
        campo("moodsTitulo", "Título de la lista", "Hoy «Elige según lo que necesitas»."),
        defineField({
          name: "moods",
          title: "Qué hay dentro",
          type: "array",
          description: "Las categorías de producto. Cada una con su icono.",
          of: [itemDeLista(true)],
        }),
        campo("cta", "Texto del botón", "El botón que abre el formulario."),
      ],
    }),

    // ── 04 ──────────────────────────────────────────────────────────────
    defineField({
      name: "experiencias",
      title: "4 · Sun‑i Experiences",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        campo("eyebrow", "Antetítulo", "Hoy «Sun‑i Experiences»."),
        campo("titulo", "Titular", "El titular grande de la sección."),
        campo("texto", "Párrafo", "Qué sesiones llevamos y a dónde.", "text", 4),
        defineField({
          name: "tipos",
          title: "Las sesiones",
          type: "array",
          description: "Cada una con su descripción. Salen en la columna de la derecha, en este orden.",
          of: [itemDeLista(false)],
        }),
        campo("cta", "Texto del botón", "El botón que abre el formulario."),
      ],
    }),

    // ── 05 ──────────────────────────────────────────────────────────────
    defineField({
      name: "espacios",
      title: "5 · Dónde vive Sun‑i",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        campo("eyebrow", "Antetítulo", "Hoy «Where Sun‑i lives»."),
        campo("titulo", "Titular", "Hoy «Espacios donde Sun‑i encaja»."),
        defineField({
          name: "items",
          title: "Los espacios",
          type: "array",
          description: "La lista hace todo el trabajo de esta sección: sin párrafo, para que se lea de un vistazo.",
          of: [itemDeLista(true)],
        }),
        campo("cta", "Texto del botón", "El botón que abre el formulario."),
      ],
    }),

    // ── 06 ──────────────────────────────────────────────────────────────
    defineField({
      name: "marcas",
      title: "6 · For Brands",
      type: "object",
      options: { collapsible: true, collapsed: true },
      description: "Pequeña a propósito: es una tercera puerta, no un tercer negocio.",
      fields: [
        campo("eyebrow", "Antetítulo", "Hoy «For brands»."),
        campo("titulo", "Titular", "Hoy «Partner with Sun‑i»."),
        campo("texto", "Párrafo", "Con qué marcas trabajamos.", "text", 3),
        defineField({
          name: "formas",
          title: "Formas de colaborar",
          type: "array",
          of: [{ type: "string" }],
          options: { layout: "tags" },
          description: "Sin beneficios prometidos: solo qué clase de colaboración existe.",
        }),
        campo("cta", "Texto del botón", "El botón que abre el formulario."),
      ],
    }),

    // ── 07 ──────────────────────────────────────────────────────────────
    defineField({
      name: "cierre",
      title: "7 · Cierre",
      type: "object",
      options: { collapsible: true, collapsed: true },
      description: "El bloque naranja del final, el momento de máximo contraste de la página.",
      fields: [
        campo("titulo", "Titular", "Hoy «Bring Sun‑i to your space»."),
        campo("texto", "Párrafo", "La invitación final.", "text", 3),
        campo(
          "condiciones",
          "Condiciones",
          "La línea pequeña del final. OJO: son condiciones comerciales, no copy. Cámbialas solo si de verdad cambian.",
        ),
        campo("cta", "Botón principal", "Abre el formulario de vending."),
        campo("ctaMarcas", "Botón secundario", "Abre el formulario de marcas."),
      ],
    }),
  ],
});
