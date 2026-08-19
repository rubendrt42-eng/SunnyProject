import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Una experiencia cuya fecha ya pasó no se ofrece para compartir.
 *
 * QUÉ PASABA
 *
 * La página de detalle sigue viva después de la fecha —a propósito: alguien
 * llega por un enlace viejo de WhatsApp y merece entender qué pasó en vez de
 * un 404—. Pero el bloque de compartir era incondicional, así que decía:
 *
 *     ¿Le va a alguien que conoces?   [Compartir]  [Copiar enlace]
 *     ...
 *     Esta experiencia ya ocurrió
 *
 * Recomendarle a un amigo una fecha de hace siete semanas no le sirve a nadie,
 * y WhatsApp es justo el canal por el que crece Sunny: el sitio estaría
 * repartiendo enlaces muertos por su mejor vía de difusión.
 *
 * Medido en producción sobre `test-experiencia-pasada`, con fecha de fin siete
 * semanas atrás: la página respondía 200, sin formulario y con la etiqueta «Ya
 * ocurrió» correcta, y aun así pintaba el bloque de compartir.
 *
 * QUÉ PROTEGE
 *
 * Que el bloque siga atado al estado. Agotada **sí** se comparte: sigue siendo
 * una experiencia vigente, con su fecha por delante, y quien reciba el enlace
 * ve el estado real. Lo que no tiene arreglo es la fecha pasada.
 */
const RUTA = "app/experiencias/[slug]/page.tsx";

describe("no se comparte una experiencia que ya ocurrió", () => {
  const fuente = readFileSync(RUTA, "utf8");

  it("el bloque de compartir está condicionado a que no haya pasado", () => {
    const i = fuente.indexOf("<ShareExperience");
    expect(i, "ya no se encuentra el bloque de compartir").toBeGreaterThan(-1);

    // Se mira hacia atrás desde el componente hasta el cierre del bloque
    // anterior: la guarda tiene que estar en medio.
    const antes = fuente.slice(Math.max(0, i - 700), i);
    expect(
      antes,
      "el bloque de compartir volvió a ser incondicional: una fecha pasada se puede reenviar por WhatsApp",
    ).toMatch(/!yaPaso\s*&&/);
  });

  it("una experiencia agotada sí se puede compartir", () => {
    // La guarda no puede depender de `sePuedeSolicitar`, que también es falso
    // cuando está agotada.
    const i = fuente.indexOf("<ShareExperience");
    const antes = fuente.slice(Math.max(0, i - 700), i);

    expect(
      antes,
      "condicionar el compartir a `sePuedeSolicitar` esconde también las agotadas, que sí son vigentes",
    ).not.toMatch(/sePuedeSolicitar\s*&&/);
  });

  it("la página de una fecha pasada sigue existiendo y explica qué pasó", () => {
    expect(fuente, "un 404 deja a quien llega por un enlace viejo sin entender nada").toMatch(
      /Esta experiencia ya ocurrió/,
    );
    expect(fuente).toMatch(/Ver experiencias actuales/);
  });
});
