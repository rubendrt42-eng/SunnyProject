import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";

/**
 * Cliente de Sanity de SOLO LECTURA para el sitio público.
 *
 * No lleva token. Es deliberado y es la mitad de la política de seguridad del
 * MVP: el dataset `production` es público porque solo contiene el contenido
 * público del sitio, así que leer no necesita credencial. Y como no hay token,
 * este cliente **no puede escribir** aunque alguien lo importara por error en
 * un componente de cliente.
 *
 * Los datos personales —solicitudes, nombres, teléfonos, correos— nunca pasan
 * por aquí. Van a Google Sheets desde el servidor. Ver MVP_SETUP.md.
 *
 * `useCdn: true` sirve desde la red de distribución de Sanity, que es más
 * rápida y más barata. La contrapartida es que puede devolver contenido de
 * hasta ~60 segundos atrás; el control real de frescura lo hace la
 * revalidación de Next en cada página, no este ajuste.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
