import type { SiteSettings } from "@/lib/sanity/types";

/**
 * LOS TEXTOS DE MARCA DEL SITIO.
 *
 * Son los que Emmy puede reescribir desde Sanity. Aquí vive la versión
 * aprobada y, mientras ella no publique la suya, la que se sirve.
 *
 * CÓMO ESTÁ ESCRITO ESTE COPY
 *
 * La versión anterior estaba construida con una fórmula que se repetía en cada
 * capítulo: dos frases enfrentadas, la segunda desmintiendo o elevando a la
 * primera. «No se trata de X, se trata de Y.» «Puedes llegar solo. Eso no
 * significa que te vas a ir igual.» «Cada semana, algo nuevo. Y alguien
 * nuevo.» Suena a que dice algo, y no dice nada: se podían leer los seis
 * capítulos seguidos sin enterarse de que hay una persona que elige qué entra,
 * de que los espacios son estudios y cafés de la ciudad, ni de qué pasa
 * después de solicitar.
 *
 * Y prometía de más. «Eso no significa que te vas a ir igual» promete una
 * transformación. «La conexión puede quedarse» promete amistad. «Y alguien
 * nuevo» promete que vas a conocer a alguien. Sunny no puede cumplir ninguna
 * de las tres: lo que hace es seleccionar experiencias y apartar lugares.
 *
 * LA REGLA DE ESTA VERSIÓN
 *
 * Cada capítulo aporta información que no está en los demás. Si una frase se
 * puede borrar sin que se pierda un dato, sobra. Y ninguna frase promete un
 * resultado que dependa de las personas que lleguen ese día.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  // ── 01 · El manifiesto ──────────────────────────────────────────────────
  heroEyebrow: "Monterrey · Cada semana",
  heroTitle: 'Tu próximo "qué buen plan" puede empezar aquí.',
  heroTitleAccent: "qué buen plan",
  heroSubtitle:
    "Sunny selecciona experiencias en estudios, cafés, clubes y otros espacios de Monterrey. " +
    "Cada semana entran nuevas.",

  // ── 02 · Lo que hay ahora ───────────────────────────────────────────────
  bloqueExperiencias: {
    titulo: "Lo que está pasando estos días.",
    nota: "Emmy las publica conforme cierra fechas con cada espacio.",
  },

  // ── 03 · Qué es Sunny ───────────────────────────────────────────────────
  //
  // El capítulo que antes decía «se trata de encontrar nuevas formas de vivir»
  // y no explicaba nada. Es el único sitio del recorrido donde cabe decir que
  // hay una selección, quién la hace y qué clase de espacios entran.
  bloqueSunny: {
    titulo: "Sunny no es un directorio de eventos.",
    acento: "Es una selección.",
    texto:
      "Emmy elige cada experiencia y cada espacio que entra: estudios, cafés, clubes, talleres y conceptos " +
      "locales de Monterrey. Algunas las organiza Sunny —los Sunny Originals—; el resto salen de espacios que " +
      "ya existen y que a lo mejor no conocías.",
    nota:
      "Clases, talleres, catas, sesiones de movimiento y planes en espacios de la ciudad. La lista cambia cada semana.",
    cita: "Estudios, cafés y clubes de Monterrey que apartan algunos lugares para que llegue gente nueva.",
  },

  // ── 04 · Cómo funciona ──────────────────────────────────────────────────
  bloqueRecorrido: {
    titulo: "Encontraste algo que quieres hacer.",
    acento: "Esto es lo que sigue.",
  },

  // ── 05 · Comunidad ──────────────────────────────────────────────────────
  //
  // La frase que sostiene el capítulo es literal, no una metáfora: la
  // comunidad de Sunny no vive en un chat ni en un perfil, vive en que dos
  // personas se apuntaron a lo mismo. Decirlo así explica el producto; decir
  // «la conexión puede quedarse» prometía una amistad que Sunny no organiza.
  bloqueComunidad: {
    titulo: "La comunidad se forma",
    acento: "alrededor de las experiencias.",
    texto:
      "Sunny reúne a gente con ganas de probar cosas. Las experiencias pasan en espacios de Monterrey y puedes " +
      "llegar solo, con alguien, o simplemente porque viste algo que te llamó la atención.",
    cita: "No hay perfiles, ni matching, ni grupos de chat. El punto de encuentro es la experiencia.",
  },

  // ── 06 · Para negocios ──────────────────────────────────────────────────
  //
  // «Tienes el espacio. Sunny lleva a las personas» describía una agencia de
  // captación. Lo que Sunny hace es otra cosa y se puede decir sin prometer
  // clientes: el espacio aparta lugares, Sunny publica la experiencia, y quien
  // llega llega por curiosidad.
  bloqueNegocios: {
    titulo: "Apartas algunos lugares.",
    acento: "Llega gente que no te conocía.",
    texto:
      "Sunny trabaja con estudios, cafés, clubes y talleres de Monterrey. Armamos juntos una experiencia, tú " +
      "apartas algunos lugares y nosotros la publicamos y la difundimos. No es publicidad pagada ni un " +
      "directorio: quien llega, llega porque le dio curiosidad tu espacio.",
  },

  // ── 07 · Cierre ─────────────────────────────────────────────────────────
  //
  // «Cada semana, algo nuevo. Y alguien nuevo» prometía que ibas a conocer a
  // alguien. El cierre solo tiene que devolver al catálogo.
  bloqueCierre: {
    titulo: "Las próximas experiencias",
    acento: "ya están publicadas.",
  },

  // ── Marca y contacto ────────────────────────────────────────────────────
  seoTitle: "The Sunny Project — Experiencias en Monterrey",
  seoDescription:
    "Sunny selecciona experiencias en estudios, cafés, clubes y espacios de Monterrey. Ves lo que hay, " +
    "solicitas tu lugar y te confirmamos por WhatsApp.",
  // No encierra a Sunny en «bienestar»: también entran cafés, talleres y
  // conceptos que no son de movimiento, y el pie sale en todas las páginas.
  footerDescripcion: "Experiencias seleccionadas en estudios, cafés, clubes y espacios de Monterrey.",

  /**
   * LAS PREGUNTAS.
   *
   * Antes casi todas describían límites técnicos del MVP —no hay cuenta, no se
   * cobra, no hay pase— y ninguna decía qué clase de experiencias hay ni si
   * puedes ir solo, que son las dos que de verdad se hacen antes de solicitar.
   *
   * SOBRE EL PRECIO
   *
   * «¿Cuánto cuesta? Nada» afirmaba que toda experiencia es y será gratuita.
   * El producto no sostiene eso: no hay campo de precio ni cobro en el sitio,
   * así que lo único verificable es que **solicitar** no cuesta. La respuesta
   * dice exactamente eso y deja el costo del espacio, si lo hubiera, en la
   * página de cada experiencia.
   */
  faq: [
    {
      question: "¿Qué tipo de experiencias hay?",
      answer:
        "Clases, talleres, catas, sesiones de movimiento y planes en estudios, cafés y clubes de Monterrey. " +
        "La lista cambia cada semana.",
    },
    {
      question: "¿Puedo ir solo?",
      answer:
        "Sí. Solicitas tu lugar por tu cuenta y llegas por tu cuenta; no hace falta apuntarse con nadie. " +
        "Si prefieres ir acompañado, al solicitar indicas cuántas personas van.",
    },
    {
      question: "¿Tiene costo?",
      answer:
        "Solicitar tu lugar no tiene costo: Sunny no cobra por usar el sitio ni por confirmarte. Si una " +
        "experiencia tuviera algún costo del espacio, viene dicho en su página.",
    },
    {
      question: "¿Cómo sé si mi lugar quedó confirmado?",
      answer:
        "Te escribimos por WhatsApp al número que dejaste. Hasta que llegue ese mensaje, tu lugar no está " +
        "apartado. Si ya no había cupo, también te avisamos.",
    },
    {
      question: "¿Necesito crear una cuenta?",
      answer: "No. Dejas tu nombre, tu WhatsApp y tu correo al solicitar, y con eso basta.",
    },
    {
      question: "¿Qué pasa si una experiencia está agotada?",
      answer:
        "Sigue visible pero ya no admite solicitudes. Las demás experiencias publicadas siguen abiertas.",
    },
    {
      question: "¿Dónde veo las nuevas?",
      answer:
        "En la sección de experiencias. Se actualiza cuando Emmy publica algo, y las fechas que ya pasaron " +
        "desaparecen solas.",
    },
    {
      question: "Tengo un espacio, ¿cómo participo?",
      answer:
        "Escríbenos desde la sección para negocios. Emmy revisa cada propuesta y te contesta para platicar " +
        "cómo podría funcionar.",
    },
  ],
};

/**
 * MEZCLA LOS TEXTOS DE EMMY CON LOS DE AQUÍ, CAMPO POR CAMPO.
 *
 * EL FALLO QUE CORRIGE
 *
 * Antes se hacía con `{ ...DEFAULT_SETTINGS, ...settings }`. Parece que
 * funciona y no funciona: GROQ no omite los campos vacíos, los devuelve como
 * `null`. Así que un documento de Sanity donde Emmy no ha escrito la frase
 * destacada llega como `heroTitleAccent: null`, el spread lo pone encima del
 * valor por defecto, y el sitio pierde la frase amarilla del titular. Vaciar
 * un campo en el Studio no dejaba el texto por defecto: dejaba un hueco.
 *
 * Esto es exactamente lo que hacía falta arreglar para que borrar una frase
 * sin querer no rompa la composición del hero.
 *
 * Aquí un valor de Sanity solo gana si **tiene contenido**: `null`, `undefined`,
 * la cadena vacía y la lista vacía no pisan nada. Los bloques se mezclan por
 * dentro, así que Emmy puede reescribir el titular de un capítulo y dejarse el
 * párrafo, y se sirve su titular con el párrafo de aquí.
 */
function tieneContenido(valor: unknown): boolean {
  if (valor === null || valor === undefined) return false;
  if (typeof valor === "string") return valor.trim().length > 0;
  if (Array.isArray(valor)) return valor.length > 0;
  return true;
}

export function mezclarAjustes(base: SiteSettings, deSanity: Partial<SiteSettings> | null): SiteSettings {
  if (!deSanity) return base;
  const salida = { ...base } as Record<string, unknown>;

  for (const [clave, valor] of Object.entries(deSanity)) {
    if (!tieneContenido(valor)) continue;

    // Los bloques de capítulo se mezclan POR DENTRO: un titular reescrito no
    // debe llevarse por delante el párrafo que no se tocó. Solo ellos —se
    // reconocen por el prefijo— porque `heroImage` también es un objeto y ahí
    // media imagen de Sanity encima de media imagen por defecto no significa
    // nada.
    const actual = salida[clave];
    if (clave.startsWith("bloque") && typeof actual === "object" && actual !== null) {
      const mezcla = { ...(actual as unknown as Record<string, unknown>) };
      for (const [k, v] of Object.entries(valor as unknown as Record<string, unknown>)) {
        if (tieneContenido(v)) mezcla[k] = v;
      }
      salida[clave] = mezcla;
    } else {
      salida[clave] = valor;
    }
  }

  return salida as unknown as SiteSettings;
}

/**
 * Enlace de WhatsApp a partir del número guardado.
 *
 * `wa.me` exige solo dígitos con código de país. El esquema de Sanity ya valida
 * el formato, pero se vuelve a limpiar aquí porque un número guardado antes de
 * esa validación seguiría en la base y rompería el enlace en silencio — se
 * abriría WhatsApp con un contacto vacío, que es peor que no tener el botón.
 */
export function whatsappLink(whatsapp: string, message?: string): string {
  const digits = whatsapp.replace(/\D/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

/**
 * El antetítulo de la lista de la portada.
 *
 * Decía «Esta semana» siempre que hubiera algo publicado, sin mirar la fecha.
 * Medido en producción el 20 de agosto de 2026: la experiencia más próxima
 * empezaba el 14 de septiembre —25 días después— y la portada seguía
 * anunciando «Esta semana» encima de dos tarjetas fechadas en septiembre.
 *
 * Importa porque el sitio promete cadencia semanal en la marca («Monterrey ·
 * Cada semana»). Si el antetítulo la afirma cuando el catálogo no la sostiene,
 * la primera vez que alguien compare la etiqueta con la fecha de la tarjeta
 * deja de creerse las dos.
 *
 * Siete días desde ahora, no la semana del calendario: quien lee «esta semana»
 * un domingo no se refiere a que quedan unas horas de domingo.
 */
export function antetituloDeLaLista(
  experiencias: readonly { startDateTime: string }[],
  ahora: Date = new Date(),
): "Esta semana" | "Próximas fechas" {
  const limite = ahora.getTime() + 7 * 24 * 60 * 60 * 1000;
  const hayAlgoEstaSemana = experiencias.some((e) => {
    const inicio = new Date(e.startDateTime).getTime();
    // Una fecha ilegible no puede sostener la promesa, así que no la cuenta.
    return Number.isFinite(inicio) && inicio <= limite;
  });
  return hayAlgoEstaSemana ? "Esta semana" : "Próximas fechas";
}

/**
 * EL RECORRIDO, EN UN SOLO SITIO.
 *
 * Lo cuentan dos pantallas —el capítulo de la portada y la página
 * `/como-funciona`— y estaban escritas dos veces. Pasó lo que pasa siempre:
 * una se actualizó y la otra no, y durante un rato el sitio se contradecía
 * según por dónde entraras. Ahora hay una sola lista.
 *
 * SON CUATRO PASOS, Y LA REVISIÓN SIGUE CONTADA
 *
 * Había un quinto paso, «Sunny revisa disponibilidad», entre solicitar y
 * recibir la confirmación. Es verdad que ocurre, pero **no es un paso de quien
 * lee**: es algo que pasa del otro lado mientras espera, y contarlo aparte
 * alargaba el recorrido sin darle nada.
 *
 * La revisión no desapareció del sitio: se cuenta dentro del paso 03, que es
 * donde importa, junto al aviso de que solicitar no es estar confirmado. El
 * sentido operativo real —descubres, solicitas, Sunny revisa el cupo, Sunny
 * confirma por WhatsApp, vas— está entero; lo que cambió es cuántas casillas
 * tiene que leer una persona para entenderlo.
 */
export interface PasoDelRecorrido {
  numero: string;
  titulo: string;
  /** Una línea. Lo que se lee de reojo al pasar. */
  texto: string;
  /**
   * La explicación de verdad.
   *
   * Cada paso tenía una sola frase y se leía como un índice: quien llegaba sin
   * saber qué es Sunny seguía sin saberlo al terminar. Esto responde lo que de
   * verdad se pregunta — qué dejo, quién me contesta, cuándo sé que tengo
   * lugar, qué llevo, qué pasa si no hay cupo.
   */
  detalle: string;
  /**
   * El verbo del paso, para la lámina. No es copy nuevo: es el que ya encabeza
   * el título, aislado, porque la lámina necesita una palabra que se lea a dos
   * metros mientras el texto de al lado se lee de cerca.
   */
  clave: string;
  /** El paso donde se corrige la idea equivocada más cara del producto. */
  ruptura?: boolean;
}

export const RECORRIDO: PasoDelRecorrido[] = [
  {
    numero: "01",
    titulo: "Encuentra algo que quieras hacer",
    clave: "Encuentra",
    texto: "Mira lo que hay publicado.",
    detalle:
      "Cada experiencia trae la fecha, la hora, en qué parte de la ciudad es y quién la da. Ábrela y lee de qué " +
      "va antes de decidir: cuánto dura, qué se hace y si hay que llevar algo. Las que ya pasaron desaparecen " +
      "solas, así que lo que ves sigue en pie.",
  },
  {
    numero: "02",
    titulo: "Solicita tu lugar",
    clave: "Solicita",
    texto: "Deja tus datos. No hay cuenta que crear.",
    detalle:
      "Tu nombre, tu WhatsApp, tu correo y cuántas personas van. Nada más: no hay registro, no hay contraseña y " +
      "solicitar no tiene costo. Si hay algo que debamos saber —que llegas con alguien, una lesión, una duda— " +
      "hay un campo para escribirlo.",
  },
  {
    numero: "03",
    titulo: "Recibe tu confirmación",
    clave: "Confirma",
    texto: "Sunny revisa el cupo y te escribe.",
    ruptura: true,
    detalle:
      "Tu solicitud llega a Sunny, que la revisa contra el cupo real del espacio. Después te escribimos por " +
      "WhatsApp al número que dejaste: si hay lugar, queda apartado ahí mismo; si ya se llenó, también te " +
      "avisamos. No hay lista de espera automática.",
  },
  {
    numero: "04",
    titulo: "Vive la experiencia",
    clave: "Vive",
    texto: "Llegas al espacio y ya está.",
    detalle:
      // Sin nombrar «pase» ni «folio»: negarlos obliga a escribirlos, y
      // escribirlos le mete a quien lee un concepto que en este producto no
      // existe. Hay una prueba que lo vigila.
      "Vas al lugar y a la hora que te confirmamos. No tienes que imprimir nada ni enseñar nada al llegar: tu " +
      "nombre ya está en la lista del espacio. De ahí en adelante la experiencia la hacen el lugar y las " +
      "personas que llegaron.",
  },
];
