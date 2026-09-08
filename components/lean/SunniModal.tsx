"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/**
 * EL FORMULARIO DE CONTACTO DE SUN-I, EN TRES VARIANTES.
 *
 * Una máquina en tu espacio, una experiencia para tu equipo, o tu marca dentro
 * de la curaduría. Son tres conversaciones distintas y por eso cambian las
 * etiquetas, pero es un solo componente: la mitad de los campos son los mismos
 * y mantener tres formularios paralelos es la forma más segura de que uno se
 * quede sin el arreglo que reciben los otros dos.
 *
 * LO QUE ESTE SÍ HACE
 *
 * Guarda. En la versión que se armó en Lovable los tres formularios enseñan
 * una pantalla de «gracias» sin mandar nada a ninguna parte —está anotado como
 * pendiente en su propia especificación— así que cada contacto real se perdía.
 * Este escribe en la hoja de cálculo por `/api/sun-i`.
 */
export type VarianteSunni = "vending" | "experiences" | "brands";

interface Campo {
  name: string;
  label: string;
  tipo?: "text" | "email" | "tel" | "textarea" | "select";
  requerido?: boolean;
  opciones?: string[];
  /** Ocupa media fila en pantallas anchas. */
  medio?: boolean;
  placeholder?: string;
}

const VARIANTES: Record<
  VarianteSunni,
  { titulo: string; intro: string; pie: string; boton: string; exito: string; exitoTexto: string; campos: Campo[] }
> = {
  vending: {
    titulo: "Bring Sun‑i to your space",
    intro: "Cuéntanos de tu espacio. Instalamos, surtimos y operamos: tú solo abres la puerta.",
    pie: "Sin costo de instalación · Sin contratos eternos",
    boton: "Quiero Sun‑i",
    exito: "Thanks — the sun is coming to you",
    exitoTexto: "Tu espacio ya está en nuestro radar. Te escribimos muy pronto.",
    campos: [
      { name: "nombre", label: "Tu nombre", requerido: true },
      { name: "espacio", label: "Nombre del espacio", requerido: true },
      {
        name: "categoria",
        label: "Tipo de espacio",
        tipo: "select",
        opciones: ["Gym / Studio", "Universidad", "Escuela", "Oficina / Corporativo", "Residencial", "Hotel", "Coworking", "Clínica / Wellness", "Otro"],
      },
      { name: "email", label: "Email", tipo: "email", requerido: true, medio: true },
      { name: "telefono", label: "Teléfono", tipo: "tel", medio: true },
      { name: "ciudad", label: "Ciudad", requerido: true },
      {
        name: "personas",
        label: "Personas que pasan al día",
        tipo: "select",
        opciones: ["Menos de 50", "50–200", "200–500", "500–1000", "Más de 1000"],
      },
      {
        name: "interes",
        label: "¿Para cuándo?",
        tipo: "select",
        opciones: ["Lo antes posible", "En 1–3 meses", "Solo estoy explorando"],
      },
      { name: "mensaje", label: "Cuéntanos de tu espacio", tipo: "textarea" },
    ],
  },
  experiences: {
    titulo: "Experiencias Sun‑i",
    intro:
      "Cuéntanos qué quieres activar. Diseñamos la sesión, llevamos al facilitador y el material: tú solo invitas a tu gente.",
    pie: "Facilitador incluido · Material incluido",
    boton: "Enviar solicitud",
    exito: "Thanks — the sun is coming to you",
    exitoTexto: "Recibimos tu solicitud. Te escribimos muy pronto con los siguientes pasos.",
    campos: [
      {
        name: "interes",
        label: "¿Qué experiencia buscas?",
        tipo: "select",
        opciones: ["Mindfulness", "Yoga", "Movilidad", "Ejercicio funcional", "Activación de comunidad", "Otra"],
      },
      {
        name: "categoria",
        label: "¿Qué tipo de espacio tienes?",
        tipo: "select",
        opciones: ["Oficina", "Institución", "Escuela", "Universidad", "Otro tipo de espacio"],
      },
      {
        name: "personas",
        label: "¿Cuántas personas?",
        tipo: "select",
        opciones: ["1–25", "26–50", "51–100", "101–250", "Más de 250"],
      },
      { name: "nombre", label: "Tu nombre", requerido: true, medio: true },
      { name: "email", label: "Email", tipo: "email", requerido: true, medio: true },
      { name: "espacio", label: "Nombre del espacio", requerido: true, medio: true },
      { name: "ciudad", label: "Ciudad", requerido: true, medio: true },
      { name: "mensaje", label: "¿Qué quieres lograr con esta experiencia?", tipo: "textarea" },
    ],
  },
  brands: {
    titulo: "Partner with Sun‑i",
    intro: "Si tu marca comparte nuestra filosofía de everyday wellness, hay un lugar para ti dentro del ecosistema.",
    pie: "Curaduría real · Comunidades con intención",
    boton: "Let's collaborate",
    exito: "Thanks — let's make good days",
    exitoTexto: "Recibimos la información de tu marca. Te contactamos muy pronto.",
    campos: [
      { name: "nombre", label: "Tu nombre", requerido: true, medio: true },
      { name: "espacio", label: "Marca o empresa", requerido: true, medio: true },
      { name: "email", label: "Email", tipo: "email", requerido: true, medio: true },
      { name: "telefono", label: "Teléfono", tipo: "tel", medio: true },
      { name: "web", label: "Website o Instagram", placeholder: "@tumarca" },
      {
        name: "categoria",
        label: "Categoría de producto",
        tipo: "select",
        opciones: ["Snacks", "Bebidas", "Hidratación", "Suplementos funcionales", "Self-care", "Beauty", "Wellness tech", "Otra"],
      },
      {
        name: "interes",
        label: "Tipo de colaboración",
        tipo: "select",
        opciones: ["Product placement", "Sampling", "Activaciones", "Co‑branding", "Lanzamiento de producto", "Aún no lo sé"],
      },
      { name: "mensaje", label: "Cuéntanos sobre tu marca", tipo: "textarea" },
    ],
  },
};

/* ── El contexto: cualquier botón del sitio puede abrir la variante que toque ── */

const ContextoSunni = createContext<(v: VarianteSunni) => void>(() => {});

/** Abre el formulario. Devuelve una función a la que se le pasa la variante. */
export function useAbrirSunni() {
  return useContext(ContextoSunni);
}

export function SunniModalProvider({ children }: { children: React.ReactNode }) {
  const [variante, setVariante] = useState<VarianteSunni | null>(null);
  const abrir = useCallback((v: VarianteSunni) => setVariante(v), []);

  return (
    <ContextoSunni.Provider value={abrir}>
      {children}
      {variante && <SunniModal variante={variante} onClose={() => setVariante(null)} />}
    </ContextoSunni.Provider>
  );
}

/* ── El diálogo ── */

function SunniModal({ variante, onClose }: { variante: VarianteSunni; onClose: () => void }) {
  const v = VARIANTES[variante];
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", alPulsar);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // El foco entra al panel: quien navega con teclado no puede quedarse fuera
    // tabulando por la página de atrás mientras el diálogo está abierto.
    panel.current?.focus();
    return () => {
      document.removeEventListener("keydown", alPulsar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [onClose]);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const datos = new FormData(e.currentTarget);
    const cuerpo: Record<string, unknown> = { tipo: variante };
    for (const [k, valor] of datos.entries()) cuerpo[k] = valor;

    try {
      const res = await fetch("/api/sun-i", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "No pudimos enviar tu solicitud. Inténtalo de nuevo.");
        return;
      }
      setEnviado(true);
    } catch {
      setError("No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/45 backdrop-blur-sm"
      />

      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sunni-modal-titulo"
        className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-warm-white p-6 shadow-2xl outline-none sm:rounded-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar formulario"
          className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-pill text-gray transition-colors hover:bg-cream hover:text-ink"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        {enviado ? (
          <div className="py-6 text-center">
            <div
              aria-hidden
              className="mx-auto flex size-14 items-center justify-center rounded-pill text-2xl"
              style={{ backgroundImage: "var(--gradient-sun)" }}
            >
              ☀︎
            </div>
            <h2 id="sunni-modal-titulo" className="mt-5 font-display text-2xl font-bold text-ink">
              {v.exito}
            </h2>
            <p className="mt-3 text-body text-gray">{v.exitoTexto}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-7 inline-flex min-h-11 items-center rounded-pill border border-coral/45 px-6 font-medium text-coral-ink transition-colors hover:bg-coral/8"
            >
              Back to the sun
            </button>
          </div>
        ) : (
          <>
            <h2 id="sunni-modal-titulo" className="pr-10 font-display text-2xl font-bold text-ink">
              {v.titulo}
            </h2>
            <p className="mt-2 text-small text-gray">{v.intro}</p>

            <form onSubmit={enviar} className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {v.campos.map((c) => (
                <div key={c.name} className={c.medio ? "sm:col-span-1" : "sm:col-span-2"}>
                  <label
                    htmlFor={`sunni-${c.name}`}
                    className="block text-[0.68rem] font-semibold tracking-[0.14em] text-gray uppercase"
                  >
                    {c.label}
                    {c.requerido && <span className="ml-1 text-coral-ink">*</span>}
                  </label>
                  {c.tipo === "textarea" ? (
                    <textarea
                      id={`sunni-${c.name}`}
                      name={c.name}
                      rows={3}
                      className="mt-2 w-full rounded-lg border border-ink/12 bg-warm-white px-4 py-3 text-body text-ink transition-colors focus:border-coral focus:outline-none"
                    />
                  ) : c.tipo === "select" ? (
                    <select
                      id={`sunni-${c.name}`}
                      name={c.name}
                      defaultValue=""
                      className="mt-2 h-12 w-full rounded-lg border border-ink/12 bg-warm-white px-4 text-body text-ink transition-colors focus:border-coral focus:outline-none"
                    >
                      <option value="">Elige una opción</option>
                      {c.opciones?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={`sunni-${c.name}`}
                      name={c.name}
                      type={c.tipo ?? "text"}
                      required={c.requerido}
                      placeholder={c.placeholder}
                      className="mt-2 h-12 w-full rounded-lg border border-ink/12 bg-warm-white px-4 text-body text-ink transition-colors focus:border-coral focus:outline-none"
                    />
                  )}
                </div>
              ))}

              {/*
                Campo trampa. Va oculto: una persona no lo ve y lo deja vacío,
                un script que rellena todo lo llena y se delata. Es la
                protección antispam más barata que hay y no molesta a nadie.
              */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] size-0"
              />

              {error && (
                <p role="alert" className="sm:col-span-2 text-small font-medium text-coral-ink">
                  {error}
                </p>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="press inline-flex min-h-12 w-full items-center justify-center rounded-pill px-7 font-display font-semibold text-ink transition-[filter] hover:brightness-[1.03] disabled:opacity-60 sm:w-auto"
                  style={{ backgroundImage: "var(--gradient-sun)" }}
                >
                  {enviando ? "Enviando…" : v.boton}
                </button>
                <p className="mt-3 text-[0.72rem] text-gray">{v.pie}</p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
