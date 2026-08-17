/**
 * Identidad del proyecto de Sanity, en un solo sitio.
 *
 * El id de proyecto y el dataset NO son secretos: viajan en cada petición que
 * el navegador hace a la API de Sanity, y el dataset `production` está en modo
 * público a propósito porque solo contiene el contenido público del sitio
 * (experiencias y textos). Nunca se guarda aquí una solicitud, un teléfono ni
 * un correo — eso va a Google Sheets, ver MVP_SETUP.md.
 *
 * Se leen de variables de entorno con un valor por defecto para que el Studio
 * y el sitio funcionen sin configuración extra en local, pero se puedan
 * apuntar a otro dataset (por ejemplo uno de pruebas) sin tocar código.
 */

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "gp6ztiei";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/**
 * Versión de la API, fijada a una fecha.
 *
 * Sanity versiona su API por fecha: fijarla significa que un cambio futuro en
 * la API no puede romper el sitio de un día para otro. Subirla es una decisión
 * consciente, no un accidente.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-08-01";
