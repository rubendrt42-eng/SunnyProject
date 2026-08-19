import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { getSiteSettings } from "@/lib/sanity/queries";
import { whatsappLink } from "@/lib/lean-content";

export const metadata: Metadata = {
  title: "Privacidad — The Sunny Project",
  description: "Qué datos recogemos cuando solicitas un lugar, para qué los usamos y dónde quedan guardados.",
};

/**
 * Aviso de privacidad, reescrito para describir lo que **de verdad** pasa.
 *
 * ⚠️ PENDIENTE DE VALIDACIÓN DEL CLIENTE
 *
 * Este documento describe con exactitud el tratamiento técnico de los datos,
 * porque eso sí se puede verificar leyendo el código. Lo que **no** contiene, y
 * hace falta para que sea un aviso de privacidad completo conforme a la LFPDPPP
 * mexicana, es la identidad del responsable:
 *
 *   - razón social o nombre de la persona responsable
 *   - domicilio
 *   - correo o medio para ejercer derechos ARCO
 *   - plazo de conservación de los datos
 *
 * Nada de eso se inventó. Un aviso de privacidad con un domicilio falso es peor
 * que no tenerlo: deja de ser un documento y pasa a ser una afirmación falsa
 * sobre quién responde por los datos de una persona.
 *
 * QUÉ DECÍA ANTES
 *
 * Describía cuentas de usuario, perfiles, folios compartidos con negocios
 * anfitriones y un panel de administración. Nada de eso existe en esta versión.
 * Y no mencionaba lo único que sí ocurre: que los datos se escriben en una hoja
 * de cálculo de Google.
 */
/**
 * Se revalida como el resto del sitio: el canal para ejercer derechos sale del
 * documento de contenido, así que tiene que reflejarse sin volver a desplegar.
 */
export const revalidate = 60;

export default async function PrivacidadPage() {
  const settings = await getSiteSettings();
  const whatsapp = settings?.whatsapp?.trim();
  const correo = settings?.contactEmail?.trim();
  return (
    <main className="py-14 sm:py-24">
      <Container className="max-w-2xl">
        <p className="eyebrow">Legal</p>
        <h1 className="mt-3 text-display text-balance">Privacidad</h1>
        <p className="mt-5 text-body-l text-gray">
          Corto, porque lo que hacemos con tus datos también es corto.
        </p>

        <div className="mt-12 flex flex-col gap-10">
          <section>
            <h2 className="text-subtitle">Qué datos recogemos</h2>
            <p className="mt-3 text-gray">
              Solo los que escribes tú en un formulario. No hay cuentas, no hay contraseñas y no te pedimos nada para
              navegar el sitio.
            </p>
            <p className="mt-4 text-carbon">Cuando solicitas un lugar en una experiencia:</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-gray">
              <Punto>Tu nombre</Punto>
              <Punto>Tu WhatsApp</Punto>
              <Punto>Tu correo</Punto>
              <Punto>Cuántas personas van</Punto>
              <Punto>Los comentarios que decidas escribir</Punto>
            </ul>
            <p className="mt-4 text-carbon">Si envías el formulario para negocios:</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-gray">
              <Punto>El nombre del negocio y de la persona de contacto</Punto>
              <Punto>WhatsApp y correo</Punto>
              <Punto>Instagram, zona y tipo de experiencia, si los llenas</Punto>
              <Punto>El mensaje que escribas</Punto>
            </ul>
          </section>

          <section>
            <h2 className="text-subtitle">Para qué los usamos</h2>
            <ul className="mt-3 flex flex-col gap-1.5 text-gray">
              <Punto>Revisar tu solicitud y ver si hay disponibilidad</Punto>
              <Punto>Contactarte por WhatsApp o correo para confirmarte o avisarte que no hay cupo</Punto>
              <Punto>Organizar tu participación en la experiencia con el espacio anfitrión</Punto>
              <Punto>Atender propuestas de negocios y espacios</Punto>
            </ul>
            <p className="mt-4 text-gray">
              No usamos tus datos para publicidad, no los vendemos y no los compartimos con terceros más allá de lo
              necesario para organizar la experiencia que solicitaste.
            </p>
          </section>

          <section>
            <h2 className="text-subtitle">Dónde quedan guardados</h2>
            <p className="mt-3 text-gray">
              En una hoja de cálculo privada de Google, a la que solo tiene acceso el equipo de The Sunny Project. El
              sitio no tiene base de datos de usuarios ni guarda tu información en el navegador.
            </p>
          </section>

          <section>
            <h2 className="text-subtitle">Tus derechos</h2>
            {/*
              EL CANAL SALE DEL CONTENIDO, NO ESTÁ ESCRITO AQUÍ

              Decía «escríbenos por el mismo WhatsApp por el que te contactamos».
              Eso solo sirve para quien ya recibió respuesta: alguien que mandó
              una solicitud y nunca tuvo contestación —o cuya solicitud se perdió
              porque la hoja no estaba configurada— se queda sin ninguna vía para
              pedir sus datos, corregirlos o borrarlos.

              No se inventa un contacto. Se lee el del documento de contenido, el
              mismo que usa el pie, y en cuanto Emmy llene el campo de WhatsApp o
              el de correo esta página deja de tener el hueco sola. Mientras no
              haya ninguno, se dice la verdad —la conversación existente— en vez
              de prometer un canal que no existe.
            */}
            <p className="mt-3 text-gray">
              Puedes pedirnos que te digamos qué datos tuyos tenemos, que los corrijamos o que los borremos.{" "}
              {whatsapp || correo ? (
                <>
                  Escríbenos{" "}
                  {whatsapp && (
                    <a className="link-draw font-medium text-carbon" href={whatsappLink(whatsapp)}>
                      por WhatsApp
                    </a>
                  )}
                  {whatsapp && correo ? " o " : null}
                  {correo && (
                    <a className="link-draw font-medium text-carbon" href={`mailto:${correo}`}>
                      a {correo}
                    </a>
                  )}{" "}
                  y lo resolvemos.
                </>
              ) : (
                <>Escríbenos por el mismo WhatsApp por el que te contactamos y lo resolvemos.</>
              )}
            </p>
          </section>

          <section>
            <h2 className="text-subtitle">Cambios</h2>
            <p className="mt-3 text-gray">
              The Sunny Project está en una etapa temprana. Si cambiamos la forma de tratar los datos, actualizamos esta
              página.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}

function Punto({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span aria-hidden className="text-orange-ink">
        •
      </span>
      <span>{children}</span>
    </li>
  );
}
