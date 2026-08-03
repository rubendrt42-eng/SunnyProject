import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { EASE, MOTION, STAGGER, transition } from "@/lib/motion";

/**
 * El sistema de movimiento se deshizo una vez por el camino aburrido: nadie lo
 * rompió, simplemente cada componente nuevo escribió sus propios números y al
 * cabo de unos meses había 36 valores a mano en 22 archivos y dos escalas de
 * tiempo que no se conocían.
 *
 * Estas pruebas no comprueban que las animaciones se vean bien —eso no se
 * puede automatizar—. Comprueban que la próxima animación se escriba con el
 * sistema en vez de a mano, que es la parte que sí falla sola.
 */

function sourceFiles(): string[] {
  return execSync('git ls-files "app/**/*.tsx" "components/**/*.tsx"', { encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

describe("escala de movimiento", () => {
  it("todas las duraciones son positivas y están ordenadas de menor a mayor", () => {
    const values = Object.values(MOTION);
    expect(values.every((v) => v > 0)).toBe(true);
    // El orden importa: la escala se lee de arriba abajo como «de lo que no se
    // mueve a lo que recorre más distancia» (ver lib/motion.ts).
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it("nada dura más de 1.2s salvo el contador, donde la duración ES el efecto", () => {
    for (const [name, value] of Object.entries(MOTION)) {
      if (name === "count") continue;
      expect(value, `MOTION.${name}`).toBeLessThanOrEqual(0.6);
    }
    expect(MOTION.count).toBeLessThanOrEqual(1.2);
  });

  it("los escalonados son más cortos que la animación que escalonan", () => {
    expect(STAGGER.word).toBeLessThan(MOTION.enter);
    expect(STAGGER.item).toBeLessThan(MOTION.settle);
  });

  it("`transition()` siempre incluye la curva, que es justo lo que se olvidaba a mano", () => {
    expect(transition("panel")).toEqual({ duration: MOTION.panel, ease: EASE });
    expect(transition("scrim", 0.2)).toEqual({ duration: MOTION.scrim, ease: EASE, delay: 0.2 });
    // Sin delay no se emite la clave, para no ensuciar el objeto con `delay: 0`.
    expect(transition("panel")).not.toHaveProperty("delay");
  });
});

describe("el sistema es de uso obligatorio", () => {
  it("ningún componente vuelve a escribir la curva a mano", () => {
    const offenders = sourceFiles().filter((f) => readFileSync(f, "utf8").includes("0.22, 1, 0.36, 1"));
    expect(offenders, "usa EASE de @/lib/motion en vez de la curva literal").toEqual([]);
  });

  it("ningún componente vuelve a escribir una duración de Tailwind a mano", () => {
    // `duration-[var(--motion-…)]` sí vale; `duration-300` no. La diferencia
    // es si el número tiene un nombre y un sitio donde vive.
    const raw = /(?<![\w-])duration-\d+(?![\w-])/;
    const offenders = sourceFiles().filter((f) => raw.test(readFileSync(f, "utf8")));
    expect(offenders, "usa duration-[var(--motion-…)]; los valores viven en globals.css").toEqual([]);
  });

  it("todo lo que se desplaza desde JavaScript consulta prefers-reduced-motion", () => {
    /**
     * Esta es la prueba que más ha encontrado. El bloque global de
     * `prefers-reduced-motion` en globals.css anula `transition-duration` y
     * `animation-duration` de CSS — y nada más. Un `transform` animado por
     * `motion/react` no es ninguna de las dos cosas, así que se lo salta
     * entero.
     *
     * Es un fallo silencioso perfecto: el ajuste está puesto, el bloque global
     * existe, y aun así la pantalla se mueve. Sin esta prueba se encontraron
     * ocho componentes así, incluido el que envuelve todas las tarjetas de
     * experiencia.
     *
     * La regla: si declaras `x`, `y`, `scale` o `height` en un `initial`,
     * `animate` o `exit`, tienes que ofrecer una versión quieta.
     */
    const displaces = /(?:initial|animate|exit)=\{\{[^}]*\b(?:x|y|scale|height):/;
    const animated = sourceFiles().filter((f) => {
      const src = readFileSync(f, "utf8");
      return src.includes("motion/react") && displaces.test(src);
    });
    expect(animated.length).toBeGreaterThan(0);

    const missing = animated.filter((f) => !readFileSync(f, "utf8").includes("useReducedMotion"));
    expect(missing, "quien anima un transform desde JS tiene que comprobarlo por su cuenta").toEqual([]);
  });
});
