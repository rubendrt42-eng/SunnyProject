import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";
import type { SanityImage } from "./types";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * URL de una imagen de Sanity al ancho que hace falta.
 *
 * Se pide a Sanity la transformación en vez de dejar que Next descargue el
 * original y lo reescale: los archivos que sube Emmy desde su teléfono pueden
 * pesar varios megas y medir 4000 px, y traerlos enteros para mostrar una
 * tarjeta de 400 px es el error de rendimiento más caro que se puede cometer en
 * un sitio con CMS.
 *
 * `auto("format")` sirve WebP o AVIF según lo que acepte el navegador, sin que
 * haya que decidirlo aquí.
 */
export function sanityImageUrl(image: SanityImage, width: number): string {
  return builder.image(image.url).width(width).quality(78).auto("format").fit("max").url();
}

/**
 * Placeholder difuminado, si Sanity lo generó.
 *
 * Evita el salto visual de un hueco gris a la foto. Sanity calcula el `lqip`
 * —una miniatura diminuta en base64— al subir la imagen, así que no cuesta nada
 * pedirlo.
 */
export function blurProps(image: SanityImage): { placeholder: "blur"; blurDataURL: string } | Record<string, never> {
  return image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
}
