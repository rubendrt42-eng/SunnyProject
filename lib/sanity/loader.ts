"use client";

/**
 * CARGADOR DE IMÁGENES DE SANITY PARA `next/image`.
 *
 * QUÉ RESUELVE: LAS FOTOS SE COMPRIMÍAN DOS VECES
 *
 * Antes se le pasaba a `next/image` una URL de Sanity **ya transformada**. Next
 * no sabe que eso ya venía optimizado: se la descarga, la vuelve a codificar
 * con su propia calidad y sirve el resultado. Cada fotografía pasaba por dos
 * compresiones con pérdida encadenadas —Sanity al 78 %, después Vercel al
 * 75 %— y llegaba blanda y con artefactos.
 *
 * Con este cargador Next ya no reescala nada: solo decide QUÉ ANCHO necesita
 * para cada pantalla y pide esa versión directamente a Sanity. Una sola
 * codificación, y la hace quien tiene el original.
 *
 * POR QUÉ VIVE EN SU PROPIO ARCHIVO CON «use client»
 *
 * `next/image` es un componente de cliente. Una función no se puede pasar como
 * prop desde un componente de servidor —el build falla con «Functions cannot be
 * passed directly to Client Components»— salvo que venga de un módulo de
 * cliente, porque entonces lo que viaja es una referencia al módulo y no una
 * clausura.
 *
 * POR QUÉ NO USA `@sanity/image-url`
 *
 * Esto se ejecuta en el navegador. Construir la URL a mano son cinco líneas y
 * evita mandarle al usuario una librería entera para concatenar parámetros.
 *
 * `fit=max` no amplía: si a una fuente de 735 px se le piden 1920, devuelve
 * 735. Es lo correcto —no tiene sentido gastar bytes en píxeles inventados—
 * pero significa que **el techo de nitidez es el archivo que sube Emmy**.
 * Ninguna configuración arregla una fotografía pequeña.
 */
export function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  // 90, no 78: con una sola compresión la diferencia de peso entre ambas es
  // pequeña en AVIF y WebP, y la de nitidez se ve.
  url.searchParams.set("q", String(quality ?? 90));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
