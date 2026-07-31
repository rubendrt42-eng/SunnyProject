/**
 * Búsqueda y paginación compartidas para las listas del panel.
 *
 * Cuatro de las seis páginas —experiencias, negocios, solicitudes y
 * usuarios— pedían todas las filas y las pintaban de golpe, sin campo de
 * búsqueda. Con los 6 registros de hoy no molesta; con doscientas
 * experiencias acumuladas tras un año, la única forma de llegar a una fila
 * concreta era recorrer la lista con la vista.
 *
 * Esto filtra y pagina EN MEMORIA, después de la consulta. Resuelve el
 * problema real —que es pintar cientos de filas y no poder encontrar una— pero
 * no reduce lo que se le pide a la base. Cuando el volumen lo justifique, el
 * siguiente paso es llevar el rango a la consulta, como ya hace
 * `getAdminReservations` con `ADMIN_PAGE_SIZE`.
 */

/** Filas por página en las listas del panel. */
export const ADMIN_LIST_PAGE_SIZE = 25;

/**
 * Filtra por texto libre sobre los campos indicados. Sin acentos y sin
 * distinguir mayúsculas, porque "Pádel" y "padel" tienen que encontrarse
 * igual: quien busca escribe rápido, no correcto.
 */
export function searchRows<T>(rows: T[], query: string | undefined, fields: (row: T) => (string | null | undefined)[]): T[] {
  const needle = normalize(query ?? "");
  if (!needle) return rows;
  return rows.filter((row) =>
    fields(row).some((value) => value && normalize(value).includes(needle)),
  );
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export interface Paged<T> {
  rows: T[];
  page: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
}

/** Recorta a la página pedida. Una página fuera de rango cae en la última. */
export function paginate<T>(rows: T[], rawPage: string | number | undefined, size = ADMIN_LIST_PAGE_SIZE): Paged<T> {
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const asked = typeof rawPage === "string" ? Number.parseInt(rawPage, 10) : (rawPage ?? 1);
  const page = Math.min(Math.max(Number.isFinite(asked) && asked > 0 ? asked : 1, 1), totalPages);
  const from = (page - 1) * size;
  return { rows: rows.slice(from, from + size), page, totalPages, total, from: total === 0 ? 0 : from + 1, to: Math.min(from + size, total) };
}
