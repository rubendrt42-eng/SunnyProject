import { env } from "@/lib/env";

/**
 * LO QUE GOOGLE ENTIENDE SIN LEER LA PÁGINA.
 *
 * Un buscador lee el texto y adivina. Esto se lo dice sin adivinanza: qué
 * organización es, cómo se llama, dónde vive y en qué redes está. Es lo que
 * permite que aparezca la ficha de marca a la derecha de los resultados en
 * vez de un enlace azul suelto.
 *
 * SOLO SE DECLARA LO QUE SE PUEDE COMPROBAR.
 *
 * Nada de dirección, teléfono ni horarios inventados, y nada de `LocalBusiness`
 * mientras no haya una dirección real que poner: un dato estructurado falso es
 * peor que ninguno —Google lo contrasta con la página y con otras fuentes, y
 * cuando no cuadra deja de fiarse de todo lo demás—.
 *
 * Los canales salen de Sanity y cada uno se incluye SOLO si tiene valor. Hoy
 * hay Instagram; el día que Emmy ponga el correo o el WhatsApp, entran solos.
 */
export function DatosEstructurados({
  nombre,
  descripcion,
  instagram,
  correo,
}: {
  nombre: string;
  descripcion: string;
  instagram?: string;
  correo?: string;
}) {
  /*
    `sameAs` quiere la dirección limpia del perfil. La que hay guardada viene
    de pulsar «compartir» en Instagram y arrastra `utm_source` y un `stkn`,
    que es un token de sesión: identifica a quien copió el enlace, no al
    perfil. Para Google eso no es la misma página que el perfil, y el token
    además puede caducar.
  */
  const limpiar = (u?: string) => {
    const v = u?.trim();
    if (!v) return undefined;
    try {
      const url = new URL(v);
      url.search = "";
      url.hash = "";
      return url.toString().replace(/\/$/, "");
    } catch {
      return v;
    }
  };
  const redes = [limpiar(instagram)].filter(Boolean);

  /*
    EL NOMBRE QUE GOOGLE ESCRIBE ENCIMA DEL RESULTADO.

    En la ficha de búsqueda aparecía «Vercel», con su logotipo, encima del
    título de la página. No era un error de Google: la canónica apuntaba a
    `sunny-mvp.vercel.app`, y a falta de una declaración explícita Google
    deduce el nombre del dominio — y el dueño de `vercel.app` es Vercel.

    Arreglar la canónica es la mitad. La otra mitad es decirlo sin que haya
    que deducirlo, y lo que Google lee para eso es un `WebSite` con `name`.

    Va en todas las páginas porque el componente vive en el layout. No
    estorba: Google solo toma el nombre del sitio de la portada.
  */
  const datos: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${env.siteUrl}/#sitio`,
        name: nombre,
        url: env.siteUrl,
        inLanguage: "es-MX",
        publisher: { "@id": `${env.siteUrl}/#organizacion` },
      },
      {
        "@type": "Organization",
        "@id": `${env.siteUrl}/#organizacion`,
        name: nombre,
        url: env.siteUrl,
        description: descripcion,
        // El mismo dibujo que sale en la pestaña del navegador.
        logo: `${env.siteUrl}/icon.png`,
        ...(redes.length ? { sameAs: redes } : {}),
        ...(correo?.trim() ? { email: correo.trim() } : {}),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // El contenido lo componemos nosotros a partir de campos de texto de
      // Sanity; se serializa con `JSON.stringify`, que escapa las comillas.
      // Se cierra además la secuencia `</script>` por si alguien la escribe
      // dentro de un campo.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(datos).replace(/</g, "\\u003c"),
      }}
    />
  );
}
