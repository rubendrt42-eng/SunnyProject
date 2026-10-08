import { defineField, defineType } from "sanity";

/**
 * LOS TEXTOS QUE NO SON LA PORTADA: menú, pie y formularios.
 *
 * Emmy entró a Sanity buscando el menú y el pie y no estaban: vivían escritos
 * dentro de los componentes. Esta pestaña los trae, con la misma regla que
 * «Portada» — **todo es opcional, y lo que se deje vacío cae en el texto que
 * ya hay en el código**. Vaciar un campo nunca deja un hueco.
 *
 * LAS DIRECCIONES DE LOS ENLACES NO SE EDITAN.
 *
 * Solo la palabra que se lee. Un menú donde se puede escribir el destino a
 * mano es un menú que apunta a páginas que no existen en cuanto alguien se
 * equivoca de guion. Los destinos son las seis anclas de la portada y la
 * página de privacidad, y esos no cambian sin tocar el código de todas
 * formas.
 */

/** Una etiqueta de enlace: se edita el texto, nunca el destino. */
const etiquetaDeEnlace = (nombre: string, titulo: string, destino: string) =>
  defineField({
    name: nombre,
    title: titulo,
    type: "string",
    description: `Lleva a ${destino}. Solo cambia la palabra, el destino es fijo.`,
  });

/** Los seis textos de cada uno de los tres formularios. */
const bloqueDeFormulario = (nombre: string, titulo: string, nota: string) =>
  defineField({
    name: nombre,
    title: titulo,
    type: "object",
    options: { collapsible: true, collapsed: true },
    description: nota,
    fields: [
      defineField({ name: "titulo", title: "Título del formulario", type: "string" }),
      defineField({ name: "intro", title: "Texto de entrada", type: "text", rows: 3 }),
      defineField({
        name: "pie",
        title: "Línea de abajo",
        type: "string",
        description: "La letra chica bajo el botón.",
      }),
      defineField({ name: "boton", title: "Texto del botón", type: "string" }),
      defineField({
        name: "exito",
        title: "Título al enviar",
        type: "string",
        description: "Lo que se lee cuando la solicitud se envió bien.",
      }),
      defineField({ name: "exitoTexto", title: "Texto al enviar", type: "text", rows: 2 }),
    ],
  });

export const interfaz = defineType({
  name: "interfazSunni",
  title: "Menú, pie y formularios",
  type: "object",
  options: { collapsible: false },
  fields: [
    defineField({
      name: "navegacion",
      title: "Menú de arriba",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        etiquetaDeEnlace("enlace1", "Primer enlace", "«What is Sun-i»"),
        etiquetaDeEnlace("enlace2", "Segundo enlace", "«Vending»"),
        etiquetaDeEnlace("enlace3", "Tercer enlace", "«Experiences»"),
        etiquetaDeEnlace("enlace4", "Cuarto enlace", "«For Brands»"),
        defineField({
          name: "boton",
          title: "Botón de la cabecera",
          type: "string",
          description: "Abre el formulario. Es la conversión principal del sitio.",
        }),
      ],
    }),

    defineField({
      name: "heroBotones",
      title: "Botones de la primera pantalla",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "principal", title: "Botón principal", type: "string" }),
        defineField({ name: "secundario", title: "Botón secundario", type: "string" }),
      ],
    }),

    defineField({
      name: "pie",
      title: "Pie de página",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "tituloExplora", title: "Título de la primera columna", type: "string" }),
        defineField({ name: "tituloAyuda", title: "Título de la segunda columna", type: "string" }),
        defineField({ name: "tituloContacto", title: "Título de la columna de contacto", type: "string" }),
        etiquetaDeEnlace("enlace1", "Primer enlace", "«What is Sun-i»"),
        etiquetaDeEnlace("enlace2", "Segundo enlace", "«Vending»"),
        etiquetaDeEnlace("enlace3", "Tercer enlace", "«Experiences»"),
        etiquetaDeEnlace("enlace4", "Cuarto enlace", "«For Brands»"),
        etiquetaDeEnlace("privacidad", "Enlace de privacidad", "la página de privacidad"),
        defineField({
          name: "derechos",
          title: "Línea final",
          type: "string",
          description: "Va después de «© año Sun-i project®». El año se pone solo.",
        }),
      ],
    }),

    bloqueDeFormulario(
      "vending",
      "Formulario · Vending",
      "El que se abre desde «Bring Sun-i» y desde los botones de Vending.",
    ),
    bloqueDeFormulario(
      "experiences",
      "Formulario · Experiences",
      "El que se abre desde los botones de Experiences.",
    ),
    bloqueDeFormulario("brands", "Formulario · For Brands", "El que se abre desde «Let's collaborate»."),
  ],
});
