/**
 * Analítica del MVP lean.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO Y NO SE LLAMA DIRECTO A VERCEL
 *
 * Para que medir no dependa de tener Vercel Analytics activo. Si el paquete no
 * está o el proyecto no lo tiene habilitado, `trackEvent` no hace nada y el
 * sitio sigue funcionando igual. Nada de lo que ve una persona depende de que
 * la analítica esté disponible.
 *
 * QUÉ SE MIDE Y POR QUÉ SOLO ESO
 *
 * Cinco eventos, uno por cada paso del único embudo que importa:
 * ver el sitio → ver una experiencia → pulsar «solicitar» → enviar → (o
 * enviar el formulario de negocios).
 *
 * Sin esto, un lanzamiento no enseña nada: no se sabe cuánta gente entra, ni
 * en qué paso se cae. Y con tráfico planeado desde Instagram, ese dato es la
 * diferencia entre corregir con información y adivinar.
 *
 * No hay panel de métricas ni eventos «por si acaso». Cada evento que se añade
 * es un dato que alguien tiene que interpretar después.
 */

export type LeanEvent =
  /** Alguien abrió la página de una experiencia. */
  | "experience_view"
  /** Alguien pulsó «Solicitar mi lugar» y llegó al formulario. */
  | "request_spot_click"
  /** Alguien envió el formulario de solicitud. */
  | "request_spot_submit"
  /** Un negocio envió el formulario de «crear una experiencia con Sunny». */
  | "business_form_submit"
  /**
   * Alguien compartió una experiencia.
   *
   * En Monterrey, para este público, compartir por WhatsApp es el canal de
   * crecimiento real. Sin este evento no hay forma de saber si funciona, y
   * decidir a ciegas sobre lo que más puede mover la aguja no tiene sentido.
   */
  | "share_experience";

type EventProps = Record<string, string | number | boolean | null>;

/**
 * Registra un evento, si hay algo que lo registre.
 *
 * Vercel Analytics expone `window.va` cuando su script está cargado. Se
 * comprueba en tiempo de ejecución en vez de importar el paquete para que el
 * sitio no arrastre una dependencia que puede no usarse, y para que este
 * archivo sirva igual si algún día se cambia de herramienta.
 */
export function trackEvent(event: LeanEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;

  const va = (window as unknown as { va?: (cmd: string, ...args: unknown[]) => void }).va;
  if (typeof va !== "function") return;

  try {
    va("event", { name: event, data: props });
  } catch {
    // Medir nunca puede romper la página. Si falla, se pierde el dato y ya.
  }
}
