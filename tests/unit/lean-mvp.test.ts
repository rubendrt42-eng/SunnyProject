import { afterEach, describe, expect, it, vi } from "vitest";
import { businessRequestSchema, rateLimit, spotRequestSchema } from "@/lib/mvp-validation";
import { whatsappLink } from "@/lib/lean-content";
import { formatDateTime, isPast } from "@/lib/dates";

describe("validación de la solicitud de lugar", () => {
  const valida = {
    experienceId: "abc123",
    experienceName: "Yoga al atardecer",
    name: "Ana Martínez",
    whatsapp: "8112345678",
    email: "ana@ejemplo.com",
    numberOfPeople: 2,
  };

  it("acepta una solicitud bien formada", () => {
    expect(spotRequestSchema.safeParse(valida).success).toBe(true);
  });

  it("limpia el WhatsApp escrito como lo escribe la gente", () => {
    // Nadie teclea su número sin espacios. Rechazarlo sería hacerle pelear con
    // el formulario por nada.
    for (const escrito of ["81 1234 5678", "(81) 1234-5678", "+52 81 1234 5678", "81-1234-5678"]) {
      const r = spotRequestSchema.safeParse({ ...valida, whatsapp: escrito });
      expect(r.success, escrito).toBe(true);
      if (r.success) expect(r.data.whatsapp).toMatch(/^\d{10,15}$/);
    }
  });

  it("rechaza un WhatsApp demasiado corto", () => {
    expect(spotRequestSchema.safeParse({ ...valida, whatsapp: "8112" }).success).toBe(false);
  });

  it("normaliza el correo a minúsculas", () => {
    const r = spotRequestSchema.safeParse({ ...valida, email: "  ANA@Ejemplo.COM " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("ana@ejemplo.com");
  });

  it("rechaza un correo con error de escritura", () => {
    expect(spotRequestSchema.safeParse({ ...valida, email: "ana@" }).success).toBe(false);
  });

  it("acepta el número de personas como texto, que es como llega del formulario", () => {
    // Un `<select>` devuelve siempre string. Sin la coerción, toda solicitud
    // fallaría la validación en el servidor.
    const r = spotRequestSchema.safeParse({ ...valida, numberOfPeople: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.numberOfPeople).toBe(3);
  });

  it("rechaza grupos irreales", () => {
    expect(spotRequestSchema.safeParse({ ...valida, numberOfPeople: 0 }).success).toBe(false);
    expect(spotRequestSchema.safeParse({ ...valida, numberOfPeople: 50 }).success).toBe(false);
  });

  it("rechaza la solicitud si el campo trampa viene lleno", () => {
    // Una persona no ve ese campo; un robot que rellena todo, sí.
    expect(spotRequestSchema.safeParse({ ...valida, website: "http://spam.example" }).success).toBe(false);
    expect(spotRequestSchema.safeParse({ ...valida, website: "" }).success).toBe(true);
  });
});

describe("validación de la solicitud de negocio", () => {
  const valida = {
    businessName: "Studio Norte",
    contactName: "Luis Pérez",
    whatsapp: "8187654321",
    email: "hola@studionorte.mx",
  };

  it("acepta lo mínimo: negocio, contacto, WhatsApp y correo", () => {
    expect(businessRequestSchema.safeParse(valida).success).toBe(true);
  });

  it("los campos opcionales pueden venir vacíos", () => {
    const r = businessRequestSchema.safeParse({ ...valida, instagram: "", location: "", message: "" });
    expect(r.success).toBe(true);
  });

  it("rechaza la solicitud si el campo trampa viene lleno", () => {
    expect(businessRequestSchema.safeParse({ ...valida, website: "x" }).success).toBe(false);
  });
});

describe("límite de frecuencia", () => {
  it("deja pasar cinco intentos y frena el sexto", () => {
    const ip = `prueba-${Math.random()}`;
    for (let i = 0; i < 5; i++) expect(rateLimit(ip).ok, `intento ${i + 1}`).toBe(true);
    expect(rateLimit(ip).ok).toBe(false);
  });

  it("cuenta por IP, no en global", () => {
    // Sin esto, la primera persona que enviara cinco solicitudes bloquearía a
    // todas las demás.
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    for (let i = 0; i < 5; i++) rateLimit(a);
    expect(rateLimit(a).ok).toBe(false);
    expect(rateLimit(b).ok).toBe(true);
  });
});

describe("enlace de WhatsApp", () => {
  it("quita el signo de más y los espacios del código de país", () => {
    expect(whatsappLink("+52 81 1234 5678")).toBe("https://wa.me/528112345678");
  });

  it("arma el enlace con el número limpio", () => {
    expect(whatsappLink("8112345678")).toBe("https://wa.me/8112345678");
    expect(whatsappLink("(81) 1234-5678")).toBe("https://wa.me/8112345678");
  });

  it("codifica el mensaje previo si se pasa", () => {
    expect(whatsappLink("8112345678", "Hola Sunny")).toBe("https://wa.me/8112345678?text=Hola%20Sunny");
  });
});

/**
 * La expiración es la regla que más fácil se rompe con un error de zona
 * horaria, y la que más se nota si falla: una experiencia que ya pasó
 * quedándose visible, o la de esta noche desapareciendo a media tarde.
 *
 * Lo que protegen estas pruebas es la propiedad importante: **`endDateTime`
 * viene de Sanity como instante absoluto en UTC**, así que compararlo con la
 * hora actual no depende de en qué zona corra el servidor. Se fija el reloj a
 * momentos peligrosos alrededor de la medianoche de Monterrey para
 * demostrarlo.
 *
 * Monterrey está en UTC−6, así que la medianoche local es las 06:00 UTC del
 * día siguiente. Ahí es donde un cálculo hecho con la fecha local del servidor
 * se equivocaría de día.
 */
describe("expiración alrededor de la medianoche en Monterrey", () => {
  afterEach(() => vi.useRealTimers());

  /** Una clase que termina a las 23:30 del 20 de agosto, hora de Monterrey. */
  const terminaAntesDeMedianoche = "2026-08-21T05:30:00.000Z";
  /** Una clase que termina a las 00:30 del 21 de agosto, hora de Monterrey. */
  const terminaDespuesDeMedianoche = "2026-08-21T06:30:00.000Z";

  it("a las 23:00 de Monterrey, ninguna de las dos ha pasado", () => {
    vi.setSystemTime(new Date("2026-08-21T05:00:00.000Z"));
    expect(isPast(terminaAntesDeMedianoche)).toBe(false);
    expect(isPast(terminaDespuesDeMedianoche)).toBe(false);
  });

  it("a las 23:45 de Monterrey, la primera ya pasó y la segunda no", () => {
    // El minuto crítico: sigue siendo día 20 en Monterrey pero ya es día 21 en
    // UTC. Un cálculo por fecha local se equivocaría aquí.
    vi.setSystemTime(new Date("2026-08-21T05:45:00.000Z"));
    expect(isPast(terminaAntesDeMedianoche)).toBe(true);
    expect(isPast(terminaDespuesDeMedianoche)).toBe(false);
  });

  it("a las 01:00 de Monterrey del día siguiente, las dos pasaron", () => {
    vi.setSystemTime(new Date("2026-08-21T07:00:00.000Z"));
    expect(isPast(terminaAntesDeMedianoche)).toBe(true);
    expect(isPast(terminaDespuesDeMedianoche)).toBe(true);
  });

  it("la fecha se muestra en horario de Monterrey, no en UTC", () => {
    // Sin fijar la zona, una clase de las 23:30 del día 20 aparecería como
    // «21 de agosto, 5:30» — el día equivocado y la hora equivocada.
    const mostrado = formatDateTime(terminaAntesDeMedianoche);
    expect(mostrado).toContain("20 de agosto");
    expect(mostrado).toContain("11:30");
  });
});
