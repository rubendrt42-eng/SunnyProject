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
    .title("Sun‑i project®")
    .items([
      /*
        AQUÍ ESTABA «EXPERIENCIAS», Y SE RETIRA DEL MENÚ.

        El catálogo de experiencias abiertas al público venía del proyecto
        anterior. La portada de Sun‑i no lo enlaza, y la pestaña «Solicitudes»
        de la hoja de cálculo —donde caían sus formularios— ya no existe: sin
        ella el formulario no tiene dónde escribir.

        Dejar la sección en el Studio sería invitar a publicar experiencias que
        no salen en ninguna parte y cuyas solicitudes se perderían.

        NO SE BORRA NADA. El tipo de contenido sigue definido y las seis
        experiencias cargadas siguen en el dataset con sus fotografías: si el
        catálogo vuelve, se recupera devolviendo estas líneas. Lo único que
        cambia es que Emmy ya no lo ve.
      */
      S.listItem()
        .title("Textos del sitio")
        .schemaType("siteSettings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
