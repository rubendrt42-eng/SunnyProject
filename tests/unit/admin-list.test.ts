import { describe, expect, it } from "vitest";
import { ADMIN_LIST_PAGE_SIZE, paginate, searchRows } from "@/lib/admin-list";

const filas = [
  { nombre: "Pádel Mix-In", negocio: "Club Norte Pádel", zona: "Valle Oriente" },
  { nombre: "Mat Pilates Intro", negocio: "Studio Norte", zona: "San Pedro" },
  { nombre: "Coffee Tasting", negocio: "Casa Clara", zona: null },
];
const campos = (f: (typeof filas)[number]) => [f.nombre, f.negocio, f.zona];

describe("searchRows", () => {
  it("sin consulta devuelve todo", () => {
    expect(searchRows(filas, undefined, campos)).toHaveLength(3);
    expect(searchRows(filas, "   ", campos)).toHaveLength(3);
  });

  it("encuentra sin acentos y sin distinguir mayúsculas", () => {
    // Quien busca escribe rápido, no correcto: "padel" tiene que encontrar
    // "Pádel". Es el caso que más se repite en una interfaz en español.
    for (const q of ["padel", "PÁDEL", "Padel", "pádel"]) {
      expect(searchRows(filas, q, campos).map((f) => f.nombre)).toEqual(["Pádel Mix-In"]);
    }
  });

  it("busca en todos los campos indicados, no solo en el nombre", () => {
    expect(searchRows(filas, "san pedro", campos).map((f) => f.nombre)).toEqual(["Mat Pilates Intro"]);
    expect(searchRows(filas, "casa clara", campos).map((f) => f.nombre)).toEqual(["Coffee Tasting"]);
  });

  it("tolera campos nulos sin romperse", () => {
    expect(() => searchRows(filas, "valle", campos)).not.toThrow();
    expect(searchRows(filas, "valle", campos)).toHaveLength(1);
  });

  it("sin coincidencias devuelve lista vacía, no todo", () => {
    expect(searchRows(filas, "natación", campos)).toEqual([]);
  });
});

describe("paginate", () => {
  const muchas = Array.from({ length: 60 }, (_, i) => i + 1);

  it("corta a la primera página por defecto", () => {
    const p = paginate(muchas, undefined);
    expect(p.rows).toHaveLength(ADMIN_LIST_PAGE_SIZE);
    expect(p.rows[0]).toBe(1);
    expect(p.page).toBe(1);
    expect(p.total).toBe(60);
    expect(p.totalPages).toBe(3);
    expect([p.from, p.to]).toEqual([1, 25]);
  });

  it("la última página lleva el resto", () => {
    const p = paginate(muchas, "3");
    expect(p.rows).toEqual([51, 52, 53, 54, 55, 56, 57, 58, 59, 60]);
    expect([p.from, p.to]).toEqual([51, 60]);
  });

  it("una página fuera de rango cae en la última en vez de mostrar vacío", () => {
    // Pasa de verdad: se borra un registro estando en la última página y el
    // enlace guardado apunta a una página que ya no existe. Mostrar una lista
    // vacía haría pensar que se perdieron los datos.
    expect(paginate(muchas, "99").page).toBe(3);
    expect(paginate(muchas, "99").rows).toHaveLength(10);
  });

  it("una página inválida o negativa cae en la primera", () => {
    for (const mala of ["0", "-4", "abc", ""]) {
      expect(paginate(muchas, mala).page).toBe(1);
    }
  });

  it("con lista vacía no inventa páginas ni rangos", () => {
    const p = paginate([], undefined);
    expect(p.rows).toEqual([]);
    expect(p.total).toBe(0);
    expect(p.totalPages).toBe(1);
    expect([p.from, p.to]).toEqual([0, 0]);
  });
});
