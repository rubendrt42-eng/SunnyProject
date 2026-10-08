import type { SchemaTypeDefinition } from "sanity";
import { siteSettings } from "./siteSettings";
import { portada } from "./portada";
import { interfaz } from "./interfaz";

/**
 * Todos los tipos de contenido del proyecto.
 *
 * Cada tipo registrado es una pantalla más que Emmy puede encontrarse, y el
 * objetivo de este MVP es que administrar el sitio le cueste minutos, no una
 * capacitación.
 *
 * YA NO SE REGISTRA `experience`.
 *
 * Se había retirado del menú del Studio al quitar el catálogo de la página,
 * pero seguía registrado, y un tipo registrado sale en el buscador: Emmy
 * encontraba seis experiencias que no se publican en ninguna parte y cuyos
 * formularios ya no tienen a dónde escribir.
 *
 * NO SE BORRA NADA. Los seis documentos siguen intactos en el dataset con sus
 * fotografías, y `./experience` sigue en el repositorio. Si el catálogo
 * vuelve, se recupera devolviendo el import y su lugar en esta lista.
 */
export const schemaTypes: SchemaTypeDefinition[] = [siteSettings, portada, interfaz];
