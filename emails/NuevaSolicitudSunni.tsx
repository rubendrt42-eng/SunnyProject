import { Body, Container, Head, Html, Preview, Section, Text, Hr, Link, Heading, Row, Column } from "@react-email/components";

/**
 * EL AVISO QUE LE LLEGA A EMMY CUANDO ALGUIEN LLENA UN FORMULARIO.
 *
 * No reutiliza `EmailShell` de `./components` a propósito: ese pie dice
 * «Sunny Project · sunnyproject.mx», que es la marca anterior. Lo usan las
 * plantillas de la versión avanzada (pases, cancelaciones) y cambiarlo aquí
 * las cambiaría a todas. Esta plantilla trae su propio marco con la identidad
 * de Sun-i: el degradado de amanecer arriba y el dominio correcto abajo.
 *
 * SE LEE COMO SE LLENÓ.
 *
 * Los tres formularios preguntan cosas distintas con las MISMAS claves: en
 * vending `interes` es «¿Para cuándo?» y en marcas es «Tipo de colaboración».
 * Un correo que dijera «Interés: Sampling» obligaría a adivinar. Así que cada
 * variante trae sus etiquetas y su orden, copiados de la pantalla —el orden
 * importa: quien contesta reconoce el formulario que llenó la persona—.
 *
 * Los campos vacíos no se imprimen. Casi todo es opcional, y una lista con
 * seis «—» esconde los tres datos que sí llegaron.
 */

/** Las tres variantes, con el nombre que llevan en el sitio. */
const TITULO = {
  vending: "Sun‑i Vending",
  experiences: "Sun‑i Experiences",
  brands: "For Brands",
} as const;

export type VarianteSunni = keyof typeof TITULO;

/**
 * Las etiquetas y el orden de cada variante, iguales a los de
 * `components/lean/SunniModal.tsx`. `tests/unit/aviso-de-solicitud.test.ts`
 * comprueba que sigan coincidiendo: si alguien renombra un campo en el
 * formulario y no aquí, la prueba lo dice.
 */
export const CAMPOS: Record<VarianteSunni, { name: keyof SolicitudSunni; label: string }[]> = {
  vending: [
    { name: "espacio", label: "Nombre del espacio" },
    { name: "categoria", label: "Tipo de espacio" },
    { name: "ciudad", label: "Ciudad" },
    { name: "personas", label: "Personas que pasan al día" },
    { name: "interes", label: "¿Para cuándo?" },
  ],
  experiences: [
    { name: "interes", label: "¿Qué experiencia buscas?" },
    { name: "categoria", label: "¿Qué tipo de espacio tienes?" },
    { name: "personas", label: "¿Cuántas personas?" },
    { name: "espacio", label: "Nombre del espacio" },
    { name: "ciudad", label: "Ciudad" },
  ],
  brands: [
    { name: "espacio", label: "Marca o empresa" },
    { name: "web", label: "Website o Instagram" },
    { name: "categoria", label: "Categoría de producto" },
    { name: "interes", label: "Tipo de colaboración" },
  ],
};

/** El último campo de los tres formularios, con su pregunta. */
export const PREGUNTA_MENSAJE: Record<VarianteSunni, string> = {
  vending: "Cuéntanos de tu espacio",
  experiences: "¿Qué quieres lograr con esta experiencia?",
  brands: "Cuéntanos sobre tu marca",
};

export interface SolicitudSunni {
  tipo: VarianteSunni;
  nombre: string;
  email: string;
  telefono?: string | null;
  espacio?: string | null;
  categoria?: string | null;
  ciudad?: string | null;
  personas?: string | null;
  interes?: string | null;
  web?: string | null;
  mensaje?: string | null;
}

const INK = "#252525";
const GRAY = "#74695e";
const CREAM = "#fff9f1";
const BLANCO = "#fffefc";
const CORAL = "#d63518";

function Dato({ label, value }: { label: string; value: string }) {
  return (
    <Row style={{ marginBottom: 14 }}>
      <Column>
        <Text style={{ margin: 0, fontSize: 12, color: GRAY, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          {label}
        </Text>
        <Text style={{ margin: "2px 0 0", fontSize: 16, color: INK, fontWeight: 600, lineHeight: "22px" }}>
          {value}
        </Text>
      </Column>
    </Row>
  );
}

export default function NuevaSolicitudSunni(s: SolicitudSunni) {
  const titulo = TITULO[s.tipo];
  const quien = s.espacio?.trim() || s.nombre;
  /*
    Se queda fuera lo vacío y lo que ya se dijo.

    El titular del correo ES el nombre del espacio (o de la marca), así que
    repetirlo tres líneas abajo bajo la etiqueta «Nombre del espacio» gasta la
    primera pantalla en un dato que ya se leyó. Sigue declarado en `CAMPOS`
    —de ahí sale el titular y ahí lo vigila la prueba de campos que no se
    caen—; lo que no se hace es imprimirlo dos veces.
  */
  const campos = CAMPOS[s.tipo].filter((c) => {
    const v = s[c.name];
    if (typeof v !== "string" || v.trim() === "") return false;
    return v.trim() !== quien;
  });

  return (
    <Html lang="es">
      <Head />
      {/* Lo que se lee en la lista del correo, antes de abrirlo. */}
      <Preview>{`${titulo} · ${quien}`}</Preview>
      <Body style={{ backgroundColor: CREAM, fontFamily: "Helvetica, Arial, sans-serif", margin: 0, padding: 0 }}>
        <Container style={{ backgroundColor: BLANCO, borderRadius: 16, maxWidth: 520, overflow: "hidden", padding: 0, margin: "24px auto" }}>
          {/*
            La línea de sol de la marca. El degradado no lo pintan todos los
            clientes de correo —Outlook, entre otros—, así que debajo va un
            `backgroundColor` del mismo amarillo: si falla el degradado queda
            una franja amarilla, no un hueco blanco.
          */}
          <Section
            style={{
              height: 5,
              backgroundColor: "#ffd77a",
              backgroundImage: "linear-gradient(90deg, #ffe47a 0%, #ffd77a 25%, #ffc17b 55%, #ffa876 100%)",
            }}
          >
            <Text style={{ margin: 0, fontSize: 0, lineHeight: "5px" }}>&nbsp;</Text>
          </Section>

          <Section style={{ padding: "28px 32px 32px" }}>
            <Text style={{ margin: 0, fontSize: 12, color: CORAL, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Nueva solicitud · {titulo}
            </Text>
            <Heading style={{ margin: "6px 0 0", fontSize: 26, lineHeight: "32px", color: INK, fontWeight: 700 }}>
              {quien}
            </Heading>

            <Hr style={{ borderColor: "#25252518", margin: "22px 0" }} />

            {/* Primero cómo contestarle. Es lo único que siempre hay. */}
            <Dato label="Contacto" value={s.nombre} />
            <Row style={{ marginBottom: 14 }}>
              <Column>
                <Text style={{ margin: 0, fontSize: 12, color: GRAY, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Email
                </Text>
                <Text style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600, lineHeight: "22px" }}>
                  <Link href={`mailto:${s.email}`} style={{ color: CORAL, textDecoration: "none" }}>
                    {s.email}
                  </Link>
                </Text>
              </Column>
            </Row>
            {s.telefono?.trim() ? <Dato label="Teléfono" value={s.telefono.trim()} /> : null}

            {campos.length > 0 ? <Hr style={{ borderColor: "#25252518", margin: "22px 0" }} /> : null}
            {campos.map((c) => (
              <Dato key={c.name} label={c.label} value={String(s[c.name]).trim()} />
            ))}

            {s.mensaje?.trim() ? (
              <Section style={{ marginTop: 8, backgroundColor: CREAM, borderRadius: 12, padding: "16px 18px" }}>
                <Text style={{ margin: 0, fontSize: 12, color: GRAY, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {PREGUNTA_MENSAJE[s.tipo]}
                </Text>
                <Text style={{ margin: "6px 0 0", fontSize: 15, color: INK, lineHeight: "22px", whiteSpace: "pre-wrap" }}>
                  {s.mensaje.trim()}
                </Text>
              </Section>
            ) : null}

            <Hr style={{ borderColor: "#25252518", margin: "24px 0 14px" }} />
            {/*
              No hay panel de administración en esta versión: la hoja de
              cálculo es el lugar donde se trabaja la solicitud. Se dice, para
              que el correo no parezca el único registro.
            */}
            <Text style={{ margin: 0, fontSize: 13, color: GRAY, lineHeight: "19px" }}>
              Responde a este correo para escribirle directo. La solicitud también quedó guardada en la hoja de
              cálculo, en la pestaña <strong style={{ color: INK }}>Sun‑i</strong>.
            </Text>
            <Text style={{ margin: "14px 0 0", fontSize: 12, color: GRAY }}>
              Sun‑i project® ·{" "}
              <Link href="https://www.suniproject.com" style={{ color: GRAY }}>
                suniproject.com
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
