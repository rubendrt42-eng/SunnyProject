import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";

/**
 * Configuración del Sanity Studio de The Sunny Project.
 *
 * El Studio NO va embebido en el sitio de Next. Se despliega aparte con
 * `pnpm studio:deploy`, que lo publica en una dirección propia de Sanity
 * (`*.sanity.studio`). Dos razones:
 *
 * 1. Emmy entra a una dirección independiente del sitio público, que es lo que
 *    se pidió. Si el sitio se cae o se redespliega, su panel sigue en pie.
 * 2. El Studio es un bundle grande. Embebido, viaja en el mismo proyecto que
 *    la portada y compite por el presupuesto de rendimiento de un sitio cuya
 *    prioridad es abrir rápido en un celular.
 *
 * El esquema vive en `sanity/schemas/` y está versionado en Git — no se define
 * desde ninguna herramienta externa. Para cambiarlo se edita el código y se
 * vuelve a desplegar.
 */
export default defineConfig({
  name: "the-sunny-project",
  title: "The Sunny Project",

  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    // Consola de consultas GROQ. Es una herramienta de desarrollo; no molesta
    // a Emmy porque vive en su propia pestaña y no en el menú de contenido.
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,

    /**
     * Quita «Textos del sitio» del botón global de «crear nuevo».
     *
     * Es un documento único: poder crear un segundo desde el atajo global
     * dejaría dos, y la consulta del sitio traería uno de los dos al azar.
     * Se sigue pudiendo editar desde su entrada del menú.
     */
    templates: (prev) => prev.filter((template) => template.schemaType !== "siteSettings"),
  },

  document: {
    /** Mismo motivo: sin «duplicar» ni «borrar» en el documento único. */
    actions: (prev, { schemaType }) =>
      schemaType === "siteSettings"
        ? prev.filter(({ action }) => action !== "unpublish" && action !== "delete" && action !== "duplicate")
        : prev,
  },
});
