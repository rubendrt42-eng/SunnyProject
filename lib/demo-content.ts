const DEMO_TAG = /\s*\[Demostraci[oó]n\]\s*$/i;

/**
 * Marca de contenido de demostración.
 *
 * Antes dependía **solo** del sufijo «[Demostración]» en el título, y eso es
 * frágil de una forma peligrosa: el día que alguien edite el título para
 * quitar el sufijo —o cargue una experiencia real copiando una de demo— el
 * badge desaparece **por accidente, no por decisión**. Es justo lo contrario
 * de lo que hace falta antes de abrir a usuarios reales: un interruptor del
 * que alguien se haga responsable.
 *
 * Ahora manda la columna `is_demo` cuando existe, y el sufijo queda como
 * respaldo para las filas cargadas antes de la migración. Mismo patrón
 * defensivo que `lib/experience-flags.ts`: correcto antes y después de
 * aplicarla, sin inventarse nada.
 *
 * Migración preparada en `supabase/migrations/20260201000300_is_demo.sql`,
 * todavía **sin aplicar**.
 */
type MaybeDemo = { title: string; is_demo?: boolean | null };

export function isDemoExperience(experience: string | MaybeDemo): boolean {
  if (typeof experience === "string") return DEMO_TAG.test(experience);

  // `null` cuenta como "no es de demostración": la columna existe y alguien
  // decidió que no lo es. Solo `undefined` —la columna aún no existe— cae al
  // sufijo del título.
  if (experience.is_demo !== undefined) return experience.is_demo === true;

  return DEMO_TAG.test(experience.title);
}

/** Quita la etiqueta «[Demostración]» del texto: la interfaz la muestra como badge. */
export function displayTitle(title: string): string {
  return title.replace(DEMO_TAG, "").trim();
}
