import type { StructureResolver } from "sanity/structure";

/**
 * El menú que ve Emmy al abrir el Studio.
 *
 * Sin esto, Sanity muestra su lista automática de tipos de contenido: útil
 * para un desarrollador, confuso para quien solo quiere publicar la clase del
 * jueves. Aquí hay exactamente dos entradas y ninguna más.
 *
 * «Textos del sitio» se abre como un documento fijo y no como una lista. Es la
 * mitad que hace de verdad que el singleton sea único: sin esto Emmy vería un
 * botón de «crear nuevo» y el día que lo pulsara habría dos documentos de
 * ajustes, con la consulta del sitio trayendo uno de los dos sin criterio.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("The Sunny Project")
    .items([
      S.listItem()
        .title("Experiencias")
        .schemaType("experience")
        .child(
          S.documentTypeList("experience")
            .title("Experiencias")
            // Las próximas arriba: es el orden en que se trabaja.
            .defaultOrdering([{ field: "startDateTime", direction: "asc" }]),
        ),

      S.divider(),

      S.listItem()
        .title("Textos del sitio")
        .schemaType("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
