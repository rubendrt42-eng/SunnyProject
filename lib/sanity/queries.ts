import { sanityClient } from "./client";
import type { ExperienceCardData, ExperienceDetail, SiteSettings } from "./types";

/**
 * Todas las consultas del sitio a Sanity, en un solo archivo.
 *
 * SOBRE LA EXPIRACIÓN Y LA ZONA HORARIA — la parte que más se equivoca
 *
 * El filtro es `endDateTime > now()`, evaluado **por Sanity en el servidor**.
 * Eso es correcto y no tiene problema de zonas horarias, y conviene entender
 * por qué para no «arreglarlo» más adelante y romperlo:
 *
 * Sanity guarda los campos `datetime` como un instante absoluto en UTC. Emmy
 * escribe «20 de agosto, 8:00 pm» en el Studio, su navegador sabe que está en
 * Monterrey, y lo que se almacena es `2026-08-21T02:00:00Z`. `now()` también es
 * un instante absoluto. Comparar dos instantes absolutos **no depende de
 * ninguna zona horaria** — son dos números.
 *
 * Donde la zona horaria sí importa es al MOSTRAR la fecha: formatear ese
 * mismo instante sin fijar `America/Monterrey` haría que una clase de las 8 pm
 * apareciera como «21 de agosto, 2:00» en un servidor que corre en UTC. Eso se
 * resuelve en `lib/dates.ts`, que fija la zona al formatear, no aquí.
 *
 * Y `now()` se evalúa en Sanity a propósito, no en el navegador: si se
 * calculara en el cliente, alguien con el reloj mal configurado vería
 * experiencias que ya pasaron, o dejaría de ver las de hoy.
 *
 * SOBRE LOS BORRADORES
 *
 * El cliente usa `perspective: "published"`, así que lo que Emmy tiene a medio
 * escribir no llega al sitio. No hace falta filtrar `!(_id in path("drafts.**"))`
 * a mano en cada consulta.
 */

/** Proyección de imagen compartida. La relación de aspecto y el `lqip` evitan saltos de layout al cargar. */
const IMAGE_PROJECTION = `
  "image": mainImage{
    "url": asset->url,
    "alt": coalesce(alt, ""),
    "aspectRatio": asset->metadata.dimensions.aspectRatio,
    "lqip": asset->metadata.lqip
  }
`;

const CARD_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  hostName,
  locationName,
  startDateTime,
  endDateTime,
  status,
  "featured": coalesce(featured, false),
  ${IMAGE_PROJECTION}
`;

/**
 * Las experiencias vigentes, de la más próxima a la más lejana.
 *
 * «Vigente» significa que su hora de fin todavía no llegó. Una experiencia que
 * ya pasó desaparece de aquí sola, sin que nadie la retire — y **sigue
 * existiendo en Sanity**, así que Emmy puede reutilizarla cambiándole la fecha.
 */
const UPCOMING_QUERY = `
  *[
    _type == "experience"
    && defined(slug.current)
    && defined(endDateTime)
    && endDateTime > now()
  ] | order(startDateTime asc) {
    ${CARD_FIELDS}
  }
`;

const BY_SLUG_QUERY = `
  *[_type == "experience" && slug.current == $slug][0]{
    ${CARD_FIELDS},
    fullDescription,
    address,
    "requirements": coalesce(requirements, [])
  }
`;

const SETTINGS_QUERY = `
  *[_type == "siteSettings"][0]{
    heroTitle,
    "heroImage": heroImage{
      "url": asset->url,
      "alt": coalesce(alt, ""),
      "aspectRatio": asset->metadata.dimensions.aspectRatio,
      "lqip": asset->metadata.lqip
    },
    heroSubtitle,
    aboutShortText,
    instagramUrl,
    whatsapp,
    contactEmail,
    "faq": coalesce(faq[]{question, answer}, [])
  }
`;

/**
 * Cuánto puede tardar el sitio en reflejar un cambio de Emmy.
 *
 * Sesenta segundos. No hace falta tiempo real: publicar una clase no es una
 * operación de bolsa. Y una revalidación por minuto mantiene el sitio servido
 * desde caché para casi todas las visitas, que es lo que lo hace abrir rápido
 * en un celular con mala señal.
 */
export const SANITY_REVALIDATE_SECONDS = 60;

/**
 * Envoltura tolerante a fallos para toda consulta a Sanity.
 *
 * Si el CMS no responde —caída, red, credenciales— el sitio **no revienta**:
 * registra el error y devuelve el valor de reserva, con lo que la página se
 * dibuja en su estado vacío («Próximamente nuevas experiencias») en vez de
 * mostrar un 500.
 *
 * También protege el build. `generateStaticParams` consulta Sanity, y sin esto
 * un CMS inalcanzable en ese momento tumba el despliegue entero — un sitio que
 * ya funcionaba deja de poder desplegarse por una caída de un tercero. Con la
 * envoltura, el build sale adelante y las páginas se generan a la primera
 * visita.
 *
 * Se registra el error en vez de tragárselo en silencio: un catálogo vacío
 * porque Sanity falla y un catálogo vacío porque no hay nada publicado se ven
 * igual en pantalla, y hace falta poder distinguirlos en los registros.
 */
async function safeFetch<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[sanity] falló la consulta «${label}»:`, error);
    return fallback;
  }
}

/**
 * La excepción a la regla de arriba: cuando el valor de reserva mentiría.
 *
 * Para una lista, devolver `[]` cuando Sanity falla es una degradación honesta:
 * la página dice «Próximamente nuevas experiencias» y nadie se lleva una idea
 * falsa. Para **una** experiencia no: el `null` de reserva es indistinguible de
 * «este documento no existe», y la página lo convierte en `notFound()`.
 *
 * Medido sirviendo el sitio contra un Sanity que responde 500: cada URL de
 * experiencia devolvía **404**. O sea que una caída de un tercero le decía al
 * visitante que su enlace está roto —cuando la experiencia existe y sigue en
 * pie— y a los buscadores que retiren esa dirección. Un enlace compartido por
 * WhatsApp, que es como se mueve este sitio, quedaba marcado como muerto por
 * unos minutos de caída ajena.
 *
 * Así que aquí el error sube, y la respuesta pasa a ser un 500. No es bonito
 * —medido: 21 bytes, sin la pantalla de error con estilo, porque el fallo
 * ocurre generando la página bajo demanda y no llega a la frontera de
 * `app/error.tsx`— pero es cierto, y un 500 le dice al buscador que vuelva a
 * intentarlo en vez de retirar la dirección.
 *
 * El alcance es estrecho: las experiencias ya pregeneradas se siguen sirviendo
 * de caché durante la caída. Medido con Sanity devolviendo 500, una experiencia
 * pregenerada respondía 200 con su contenido completo. Solo cae en el 500 una
 * dirección que todavía no esté en caché.
 *
 * DURANTE EL BUILD NO SUBE
 *
 * `generateStaticParams` devuelve los slugs y Next **pregenera cada uno**, así
 * que esta consulta también corre al compilar. Dejar subir el error ahí tumba
 * el despliegue entero: medido, `Export encountered an error on
 * /experiencias/[slug]/page … exiting the build`. Un sitio que ya funcionaba
 * dejaría de poder desplegarse por unos minutos de caída ajena, que es peor que
 * el problema que se está arreglando.
 *
 * Así que al compilar se devuelve el valor de reserva —la página no se
 * pregenera y se construye en la primera visita, cuando Sanity ya responda— y
 * en una petición real el error sube.
 */
async function fetchOrThrow<T>(label: string, run: () => Promise<T>, duranteElBuild: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`[sanity] falló la consulta «${label}»:`, error);
    if (process.env.NEXT_PHASE === "phase-production-build") return duranteElBuild;
    throw error;
  }
}


export async function getUpcomingExperiences(): Promise<ExperienceCardData[]> {
  return safeFetch(
    "experiencias vigentes",
    () =>
      sanityClient.fetch<ExperienceCardData[]>(
        UPCOMING_QUERY,
        {},
        { next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["experiences"] } },
      ),
    [],
  );
}

/**
 * Una experiencia por su dirección, **sin filtrar por fecha**.
 *
 * A propósito: si alguien tiene el enlace guardado o compartido por WhatsApp de
 * una experiencia que ya pasó, es mejor que vea la página diciendo que ya
 * ocurrió que un 404 seco. La página decide qué mostrar; la consulta solo trae
 * el dato.
 */
export async function getExperienceBySlug(slug: string): Promise<ExperienceDetail | null> {
  // `null` aquí significa una sola cosa: la consulta funcionó y no hay tal
  // documento. Si la consulta falla, sube el error — ver `fetchOrThrow`.
  return fetchOrThrow(
    `experiencia ${slug}`,
    () =>
      sanityClient.fetch<ExperienceDetail | null>(
        BY_SLUG_QUERY,
        { slug },
        { next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["experiences", `experience:${slug}`] } },
      ),
    null,
  );
}

/**
 * Los textos del sitio.
 *
 * Devuelve `null` si el documento todavía no existe, en vez de reventar. El
 * sitio tiene que poder desplegarse antes de que Emmy haya escrito nada — cada
 * consumidor usa sus propios textos por defecto.
 */
export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch(
    "textos del sitio",
    () =>
      sanityClient.fetch<SiteSettings | null>(
        SETTINGS_QUERY,
        {},
        { next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["siteSettings"] } },
      ),
    null,
  );
}

/** Las direcciones de todas las experiencias, para generar las páginas de detalle en el build. */
export async function getAllExperienceSlugs(): Promise<string[]> {
  return safeFetch(
    "direcciones de experiencias",
    () =>
      sanityClient.fetch<string[]>(
        `*[_type == "experience" && defined(slug.current)].slug.current`,
        {},
        { next: { revalidate: SANITY_REVALIDATE_SECONDS, tags: ["experiences"] } },
      ),
    [],
  );
}
