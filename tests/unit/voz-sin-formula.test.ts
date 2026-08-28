import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, RECORRIDO } from "@/lib/lean-content";

/**
 * EL COPY NO PUEDE VOLVER A LA FÓRMULA.
 *
 * La versión anterior del sitio estaba escrita con un molde que se repetía en
 * todos los capítulos: dos frases enfrentadas, la segunda desmintiendo o
 * elevando a la primera.
 *
 *     «No se trata solo de encontrar planes. Se trata de encontrar nuevas
 *      formas de vivir.»
 *     «Puedes llegar solo. Eso no significa que te vas a ir igual.»
 *     «Una experiencia puede durar una hora. La conexión puede quedarse.»
 *     «Cada semana, algo nuevo. Y alguien nuevo.»
 *
 * Suenan a que dicen algo y no dicen nada, y encima **prometen resultados que
 * Sunny no puede cumplir**: una transformación personal, una amistad, conocer
 * a alguien. Lo que Sunny hace es seleccionar experiencias y apartar lugares.
 *
 * Esta prueba no juzga estilo —no sabría— sino que vigila las construcciones
 * concretas que se retiraron y el vocabulario que encerraba mal el proyecto.
 * Es barata y evita que vuelvan de una en una sin que nadie lo note.
 */
/**
 * Se recorre lo que las rutas públicas ALCANZAN, no la carpeta entera.
 *
 * En el árbol siguen existiendo componentes de la versión avanzada —`Hero`,
 * `ForBusinessSection`— que nadie renderiza y que conservan el copy viejo.
 * Reprobar por ellos sería obligar a editar código muerto; ignorarlos sin más
 * dejaría el molde entrar de vuelta el día que alguien los enchufe. Siguiendo
 * los imports desde las rutas reales pasa lo correcto en los dos casos: hoy no
 * cuentan, y en cuanto uno se monte en una página, cuenta.
 *
 * Es la misma técnica que usa `solo-fotografia-autorizada.test.ts`.
 */
const RAICES_PUBLICAS = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/experiencias/page.tsx",
  "app/experiencias/[slug]/page.tsx",
  "app/como-funciona/page.tsx",
  "app/para-negocios/page.tsx",
  "app/preguntas-frecuentes/page.tsx",
  "app/privacidad/page.tsx",
];

function resolver(especificador: string): string | null {
  if (!especificador.startsWith("@/")) return null;
  const base = especificador.slice(2);
  for (const cand of [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`]) {
    if (existsSync(cand)) return cand;
  }
  return null;
}

function alcanzables(raices: string[]): string[] {
  const vistos = new Set<string>();
  const pila = [...raices];
  while (pila.length) {
    const archivo = pila.pop()!;
    if (vistos.has(archivo) || !existsSync(archivo)) continue;
    vistos.add(archivo);
    for (const m of readFileSync(archivo, "utf8").matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
      const destino = resolver(m[1]);
      if (destino && !vistos.has(destino)) pila.push(destino);
    }
  }
  return [...vistos];
}

/** Frases y moldes retirados, con el motivo por el que se fueron. */
const PROHIBIDAS: { patron: RegExp; motivo: string }[] = [
  { patron: /no se trata (?:solo )?de[^.]{0,60}\.\s*se trata de/i, motivo: "el molde «No se trata de X. Se trata de Y.»" },
  { patron: /eso no significa que/i, motivo: "«Eso no significa que…» promete una transformación" },
  { patron: /la conexión puede quedarse/i, motivo: "promete una amistad que Sunny no organiza" },
  { patron: /y alguien nuevo/i, motivo: "promete que vas a conocer a alguien" },
  { patron: /zona de confort/i, motivo: "lenguaje motivacional genérico" },
  { patron: /nuevas formas de vivir/i, motivo: "eslogan sin información" },
  { patron: /sin letra chica/i, motivo: "vocabulario de fintech" },
  { patron: /salir de la rutina/i, motivo: "eslogan genérico de wellness" },
  { patron: /comunidad que busca crecer/i, motivo: "eslogan sin información" },
  { patron: /experiencias de bienestar, movimiento y comunidad/i, motivo: "encierra a Sunny en wellness" },
];

/**
 * Promesas de gratuidad que el producto no sostiene.
 *
 * No hay campo de precio ni cobro en el sitio, así que lo único verificable es
 * que **solicitar** no cuesta. Afirmar que toda experiencia es gratis es una
 * promesa sobre los espacios, que Sunny no controla.
 */
const PROMESAS_DE_PRECIO = [
  /todas las experiencias son gratuitas/i,
  /sin pagar nada/i,
  /¿cuánto cuesta\?[\s\S]{0,20}nada\./i,
];

/** Los comentarios EXPLICAN por qué se retiró cada frase, así que la nombran. */
function sinComentarios(fuente: string): string {
  return fuente.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
}

describe("la voz del sitio", () => {
  const archivos = alcanzables(RAICES_PUBLICAS);

  it("recorre un árbol de archivos real", () => {
    expect(archivos.length).toBeGreaterThan(15);
  });

  it("no reintroduce las construcciones que se retiraron", () => {
    const hallazgos: string[] = [];
    for (const archivo of archivos) {
      if (archivo.endsWith("voz-sin-formula.test.ts")) continue;
      const texto = sinComentarios(readFileSync(archivo, "utf8"));
      for (const { patron, motivo } of PROHIBIDAS) {
        if (patron.test(texto)) hallazgos.push(`${archivo}: ${motivo}`);
      }
    }
    expect(hallazgos, "Copy retirado que volvió:\n" + hallazgos.join("\n")).toEqual([]);
  });

  it("no promete que toda experiencia es gratuita", () => {
    const hallazgos: string[] = [];
    for (const archivo of archivos) {
      if (archivo.endsWith("voz-sin-formula.test.ts")) continue;
      const texto = sinComentarios(readFileSync(archivo, "utf8"));
      for (const patron of PROMESAS_DE_PRECIO) {
        if (patron.test(texto)) hallazgos.push(`${archivo}: ${patron}`);
      }
    }
    expect(
      hallazgos,
      "El sitio no cobra, pero tampoco sabe si un espacio cobra: no hay campo de " +
        "precio. Lo verificable es que SOLICITAR no cuesta.\n" + hallazgos.join("\n"),
    ).toEqual([]);
  });

  it("mantiene intacto el aviso de que solicitar no es estar confirmado", () => {
    // Es el único punto donde alguien puede llevarse una idea equivocada y
    // presentarse a una clase donde no lo esperan. El paso marcado como
    // `ruptura` tiene que seguir diciéndolo.
    const ruptura = RECORRIDO.find((p) => p.ruptura);
    expect(ruptura, "Ningún paso del recorrido está marcado como la ruptura.").toBeDefined();
    expect(ruptura!.detalle).toMatch(/no antes|cuando recibes|hasta que|queda apartado ahí mismo/i);

    const recorrido = readFileSync("components/lean/Recorrido.tsx", "utf8");
    expect(recorrido).toContain("Solicitar no es estar confirmado");
  });

  it("explica de qué clase de espacios habla Sunny, no solo que son «locales»", () => {
    // El diagnóstico encontró que se podían leer los siete capítulos sin
    // enterarse de que los espacios son estudios, cafés y clubes. Si eso se
    // vuelve a perder, el sitio deja de explicar qué es.
    const todo = [
      DEFAULT_SETTINGS.heroSubtitle,
      DEFAULT_SETTINGS.bloqueSunny.texto ?? "",
      DEFAULT_SETTINGS.bloqueNegocios.texto ?? "",
    ].join(" ");
    for (const palabra of ["estudios", "cafés", "clubes"]) {
      expect(todo.toLocaleLowerCase("es")).toContain(palabra);
    }
  });

  it("nombra la curaduría en el capítulo que explica Sunny", () => {
    const sunny = `${DEFAULT_SETTINGS.bloqueSunny.titulo} ${DEFAULT_SETTINGS.bloqueSunny.acento ?? ""} ${DEFAULT_SETTINGS.bloqueSunny.texto ?? ""}`;
    expect(sunny).toMatch(/selecci|elige|curad/i);
  });
});
