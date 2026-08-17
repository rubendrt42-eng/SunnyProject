import type { SchemaTypeDefinition } from "sanity";
import { experience } from "./experience";
import { siteSettings } from "./siteSettings";

/**
 * Todos los tipos de contenido del proyecto.
 *
 * Son dos a propósito. Cada tipo nuevo es una pantalla más que Emmy tiene que
 * entender, y el objetivo declarado de este MVP es que administrar el sitio le
 * cueste minutos, no una capacitación.
 */
export const schemaTypes: SchemaTypeDefinition[] = [experience, siteSettings];
