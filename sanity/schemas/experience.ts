import { defineField, defineType } from "sanity";
import { CalendarIcon } from "@sanity/icons";

/**
 * Una experiencia: la clase, sesión o plan que un negocio aliado ofrece.
 *
 * Este es el único documento que Emmy va a tocar todas las semanas, así que
 * está escrito para ella y no para un desarrollador: las etiquetas están en
 * español, cada campo tiene una descripción que dice qué hace en el sitio, y
 * los campos van agrupados para que el formulario no sea una pared de veinte
 * casillas.
 *
 * DECISIONES QUE CONVIENE NO DESHACER SIN PENSARLO
 *
 * - **`status` solo tiene dos valores.** No hay control automático de cupo en
 *   esta etapa: Emmy lleva la cuenta por su lado y marca «Agotada» cuando se
 *   llena. Añadir estados intermedios («casi lleno», «lista de espera») obliga
 *   a decidir qué hace el sitio con cada uno, y hoy no hay respuesta para eso.
 *
 * - **La fecha de fin es obligatoria** aunque parezca redundante. Es lo que
 *   hace que una experiencia desaparezca sola del sitio cuando ya pasó, sin
 *   que Emmy tenga que retirarla a mano. Sin ella no hay expiración
 *   automática.
 *
 * - **La fotografía es obligatoria.** Las tarjetas del sitio están diseñadas
 *   alrededor de la imagen; sin ella la composición se cae. Es más honesto
 *   impedir publicar que dibujar un hueco gris.
 */
export const experience = defineType({
  name: "experience",
  title: "Experiencia",
  type: "document",
  icon: CalendarIcon,

  groups: [
    { name: "principal", title: "Lo principal", default: true },
    { name: "cuando", title: "Cuándo y dónde" },
    { name: "detalle", title: "Detalles" },
  ],

  fields: [
    defineField({
      name: "title",
      title: "Nombre de la experiencia",
      type: "string",
      group: "principal",
      description: "Cómo se va a llamar en el sitio. Por ejemplo: «Yoga al atardecer».",
      validation: (Rule) => Rule.required().min(3).max(80).warning("Los nombres cortos se leen mejor en las tarjetas."),
    }),

    defineField({
      name: "slug",
      title: "Dirección en el sitio",
      type: "slug",
      group: "principal",
      description:
        "Se genera sola a partir del nombre. Es la parte final de la dirección web: /experiencias/yoga-al-atardecer. Si ya publicaste la experiencia, cambiarla rompe los enlaces que hayas compartido.",
      options: {
        source: "title",
        maxLength: 96,
        // Sin acentos ni eñes en la URL: se convierten en caracteres escapados
        // ilegibles al compartir el enlace por WhatsApp.
        slugify: (input) =>
          input
            .normalize("NFD")
            // Marcas diacríticas combinadas: es lo que queda después de
            // `normalize("NFD")` al separar «á» en «a» + acento.
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 96),
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "mainImage",
      title: "Fotografía",
      type: "image",
      group: "principal",
      description: "La imagen que aparece en la tarjeta y arriba de la página de la experiencia. Horizontal se ve mejor.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Descripción de la imagen",
          type: "string",
          description:
            "Qué se ve en la foto, en pocas palabras. Lo leen las personas que usan lector de pantalla y aparece si la imagen no carga. Por ejemplo: «Grupo haciendo yoga sobre el césped al atardecer».",
          validation: (Rule) =>
            Rule.required().min(10).error("Hace falta describir la imagen para que el sitio sea accesible."),
        }),
      ],
      validation: (Rule) => Rule.required().error("Sin fotografía la experiencia no se puede publicar."),
    }),

    defineField({
      name: "shortDescription",
      title: "Descripción corta",
      type: "text",
      rows: 2,
      group: "principal",
      description: "Una o dos líneas. Es lo que se lee en la tarjeta, antes de entrar.",
      validation: (Rule) => Rule.required().min(20).max(180),
    }),

    defineField({
      name: "status",
      title: "Disponibilidad",
      type: "string",
      group: "principal",
      description:
        "Cuando se llene, cámbiala a «Agotada». La experiencia sigue visible en el sitio pero ya no se pueden enviar solicitudes.",
      options: {
        list: [
          { title: "Disponible", value: "available" },
          { title: "Agotada", value: "sold_out" },
        ],
        layout: "radio",
      },
      initialValue: "available",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "featured",
      title: "Destacar en la portada",
      type: "boolean",
      group: "principal",
      description: "Las experiencias destacadas aparecen más grandes al inicio del listado.",
      initialValue: false,
    }),

    defineField({
      name: "startDateTime",
      title: "Cuándo empieza",
      type: "datetime",
      group: "cuando",
      description: "Fecha y hora de inicio, en horario de Monterrey.",
      options: { timeStep: 15 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "endDateTime",
      title: "Cuándo termina",
      type: "datetime",
      group: "cuando",
      description:
        "Fecha y hora de fin. Importante: cuando pase esta hora, la experiencia deja de aparecer en el sitio automáticamente. No se borra — sigue aquí y la puedes reutilizar cambiándole la fecha.",
      options: { timeStep: 15 },
      /**
       * Comparación con el campo de inicio hecha a mano y no con
       * `Rule.min(Rule.valueOfField(...))`: en campos `datetime` esa forma
       * compara cadenas y da falsos positivos en cuanto cambia el formato o la
       * zona. Convertir las dos a milisegundos y compararlas es aburrido y
       * funciona siempre.
       */
      validation: (Rule) =>
        Rule.required().custom((end, context) => {
          const start = (context.document as { startDateTime?: string } | undefined)?.startDateTime;
          if (!end || !start) return true;
          return new Date(end).getTime() > new Date(start).getTime()
            ? true
            : "La hora de fin tiene que ser posterior a la de inicio.";
        }),
    }),

    defineField({
      name: "locationName",
      title: "Nombre del lugar",
      type: "string",
      group: "cuando",
      description: "Cómo se llama el espacio. Por ejemplo: «Parque Rufino Tamayo» o «Studio Norte».",
      validation: (Rule) => Rule.required().min(3),
    }),

    defineField({
      name: "address",
      title: "Dirección",
      type: "string",
      group: "cuando",
      description: "Dirección para llegar. Se usa para el enlace al mapa.",
    }),

    defineField({
      name: "hostName",
      title: "Quién la imparte",
      type: "string",
      group: "detalle",
      description: "El negocio, estudio o persona que da la experiencia.",
    }),

    defineField({
      name: "fullDescription",
      title: "Descripción completa",
      type: "text",
      rows: 6,
      group: "detalle",
      description: "El texto largo que se lee dentro de la experiencia. Cuenta qué va a pasar y qué se lleva la persona.",
      validation: (Rule) => Rule.required().min(40),
    }),

    defineField({
      name: "requirements",
      title: "Qué necesita llevar",
      type: "array",
      of: [{ type: "string" }],
      group: "detalle",
      description: "Una línea por requisito. Por ejemplo: «Tapete de yoga», «Ropa cómoda», «Llegar 10 minutos antes».",
      options: { layout: "tags" },
    }),
  ],

  /**
   * La vista previa de la lista. Emmy va a ver docenas de estas, así que
   * muestra lo que necesita para distinguirlas de un golpe: nombre, fecha, y
   * si está agotada o ya pasó.
   */
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      start: "startDateTime",
      end: "endDateTime",
      status: "status",
    },
    prepare({ title, media, start, end, status }) {
      const fecha = start
        ? new Date(start).toLocaleString("es-MX", {
            timeZone: "America/Monterrey",
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit",
          })
        : "Sin fecha";

      const pasada = end ? new Date(end).getTime() < Date.now() : false;
      const marcas = [pasada ? "Ya pasó" : null, status === "sold_out" ? "Agotada" : null].filter(Boolean);

      return {
        title: title ?? "Sin nombre",
        subtitle: marcas.length ? `${fecha} · ${marcas.join(" · ")}` : fecha,
        media,
      };
    },
  },

  orderings: [
    {
      title: "Próximas primero",
      name: "startAsc",
      by: [{ field: "startDateTime", direction: "asc" }],
    },
    {
      title: "Más recientes primero",
      name: "startDesc",
      by: [{ field: "startDateTime", direction: "desc" }],
    },
  ],
});
