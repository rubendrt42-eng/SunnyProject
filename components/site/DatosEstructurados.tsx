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

  const datos: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: nombre,
    url: env.siteUrl,
    description: descripcion,
    ...(redes.length ? { sameAs: redes } : {}),
    ...(correo?.trim() ? { email: correo.trim() } : {}),
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
