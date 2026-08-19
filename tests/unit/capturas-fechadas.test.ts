import { existsSync, readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Las capturas de QA no pueden leerse como si fueran el sitio de hoy.
 *
 * QUÉ PASABA
 *
 * `qa/screenshots/` guarda 27 imágenes de la auditoría del 18 de agosto, que los
 * documentos citan por nombre como evidencia. Cuarenta commits después muestran
 * un sitio que ya no existe — y no es solo que esté viejo: llevan cosas que hoy
 * están expresamente prohibidas en el proyecto.
 *
 * Verificado abriendo `home-desktop-1280.png` y recortando el pie:
 *
 *     Contacto: @sunnyproject.mx  ·  hola@sunnyproject.mx
 *     «Experiencias curadas de wellness [...] Un pase gratuito por semana.»
 *
 * Es decir, **datos de contacto inventados** y el vocabulario del producto
 * anterior, en imágenes que cualquiera puede abrir creyendo que así se ve el
 * sitio. Más el hero fotográfico sin licencia, el contador «2 experiencias
 * disponibles» y un enlace a una página que no existe.
 *
 * QUÉ PROTEGE
 *
 * Que exista el aviso que separa las dos tandas y nombra lo que la vieja
 * muestra. No se borran las imágenes: son la evidencia que justifica los
 * hallazgos de la auditoría, y borrarlas dejaría los documentos apuntando al
 * vacío.
 */
const DIR = "qa/screenshots";
const AVISO = `${DIR}/README.md`;

describe("las capturas de QA dicen de cuándo son", () => {
  it("existe el aviso que separa las dos tandas", () => {
    expect(existsSync(AVISO), `falta ${AVISO}`).toBe(true);
  });

  it("el aviso nombra lo prohibido que muestran las viejas", () => {
    const texto = readFileSync(AVISO, "utf8");
    for (const señal of ["sunnyproject.mx", "pase", "membresía", "no está autorizada"]) {
      expect(texto, `el aviso ya no menciona «${señal}»`).toContain(señal);
    }
  });

  it("hay al menos una captura fechada del sitio actual", () => {
    const fechadas = readdirSync(DIR).filter((f) => /^\d{4}-\d{2}-\d{2}-.*\.png$/.test(f));
    expect(fechadas.length, "no queda ninguna captura fechada").toBeGreaterThan(0);
  });

  it("el sitio de hoy no publica ningún contacto inventado", () => {
    // El ancla de todo lo anterior: si algún día aparece un contacto en el
    // código, será porque alguien lo puso a mano — y eso es lo que no puede
    // pasar. El canal real vive en el documento de contenido.
    // Sin comentarios: el propio archivo explica por escrito qué correos
    // publicaba antes, y esas menciones no son código.
    const footer = readFileSync("components/site/Footer.tsx", "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ")
      .replace(/\/\/[^\n]*/g, " ");

    expect(footer, "hay un correo escrito a mano en el pie").not.toMatch(
      /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i,
    );
  });
});
