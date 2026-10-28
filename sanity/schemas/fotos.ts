import { defineField, defineType } from "sanity";

/**
 * LAS IMÁGENES DE LA PORTADA.
 *
 * Vivían en el repositorio, así que cambiar una fotografía pedía un commit.
 * Aquí se suben y se cambian sin tocar el código.
 *
 * MISMA REGLA QUE LOS TEXTOS: lo que se deje vacío conserva la imagen que ya
 * hay. Borrar una foto en Sanity nunca deja un hueco.
 *
 * DOS COSAS QUE CONVIENE SABER ANTES DE SUBIR
 *
 * 1. Cada hueco tiene una forma fija, y la foto se recorta para caber. El
 *    recorte no es al azar: el punto que se marque con el selector de Sanity
 *    («hotspot») es el que se respeta al recortar, así que se marca la cara
 *    o el objeto que no puede perderse.
 *
 * 2. La nitidez la pone el archivo original. Sanity nunca amplía: si se sube
 *    una foto de 600 px donde caben 1400, se verá blanda y ninguna opción lo
 *    arregla. Mejor pasarse de grande que quedarse corto.
 */

/** Un hueco de imagen: la foto, su recorte y el texto que la describe. */
const hueco = (nombre: string, titulo: string, forma: string, nota: string) =>
  defineField({
    name: nombre,
    title: titulo,
    type: "image",
    // El selector de recorte: sin esto Sanity recorta por el centro y las
    // caras acaban cortadas.
    options: { hotspot: true },
    description: `${nota} Se muestra en formato ${forma}.`,
    fields: [
      defineField({
        name: "alt",
        title: "Descripción de la imagen",
        type: "string",
        description:
          "Para quien no puede verla: lectores de pantalla y buscadores. " +
          "Describe qué se ve, no repitas el titular. Si lo dejas vacío se usa la descripción actual.",
      }),
    ],
  });

export const fotos = defineType({
  name: "fotosSunni",
  title: "Imágenes",
  type: "object",
  options: { collapsible: false },
  fields: [
    hueco("clase", "1 · Inicio", "vertical (3:4)", "La fotografía grande, al lado del titular de arriba."),
    hueco("maquina", "3 · Sun‑i Vending", "vertical (4:5)", "La unidad, a la izquierda del texto."),
    hueco("circulo", "4 · Sun‑i Experiences", "horizontal (16:10)", "Debajo del botón. Solo se ve en computadora, no en celular."),
    hueco("parque", "5 · Dónde vive Sun‑i", "vertical (3:4)", "A la derecha de «Espacios donde Sun‑i encaja»."),

    /*
      Aquí había un campo de solo lectura que servía de nota. En el Studio se
      ve como un recuadro gris que no se puede escribir: parece un campo roto.
      El aviso vive ahora en la descripción de cada dibujo, que es donde se
      lee justo antes de subir el archivo.
    */
    hueco(
      "personajeCara",
      "Dibujo · la cara",
      "PNG con fondo transparente",
      "Sale dos veces: en «Qué hacemos» y en Experiences. ⚠️ Tiene que ser PNG sin fondo; un JPG saldría con un recuadro blanco alrededor.",
    ),
    hueco(
      "personajeSol",
      "Dibujo · el sol",
      "PNG con fondo transparente",
      "Sale dos veces: en Vending y en el cierre amarillo. ⚠️ Tiene que ser PNG sin fondo; un JPG saldría con un recuadro blanco alrededor.",
    ),
  ],
});
