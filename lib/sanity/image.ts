import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";
import type { SanityImage } from "./types";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * 90, no 78.
 *
 * Con dos compresiones encadenadas bajar la calidad de la primera era una
 * defensa razonable contra el peso. Ahora solo hay una, así que puede ir alta:
 * en AVIF y WebP —que es lo que sirve `auto("format")`— la diferencia de peso
 * entre 78 y 90 es pequeña y la de nitidez se ve.
 */
const CALIDAD = 90;

/**
 * URL suelta de una imagen de Sanity a un ancho concreto.
 *
 * Queda para donde hace falta una URL y no un componente `<Image>`: las
 * imágenes de Open Graph y los metadatos, que los consume WhatsApp o Google y
 * no pasan por `next/image`.
 */
export function sanityImageUrl(image: SanityImage, width: number): string {
  return builder.image(image.url).width(width).quality(CALIDAD).auto("format").fit("max").url();
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
