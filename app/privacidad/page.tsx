import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Privacidad — Sunny Project" };

export default function PrivacidadPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-2xl">
        <h1 className="font-serif text-4xl italic">Aviso de privacidad</h1>
        <p className="mt-2 text-sm text-gray">Última actualización: proyecto de demostración.</p>

        <div className="mt-10 space-y-8 text-carbon">
          <section>
            <h2 className="text-lg font-semibold">Qué información recopilamos</h2>
            <p className="mt-2 text-gray">
              Cuando creas una cuenta y completas tu perfil recopilamos tu nombre completo, correo electrónico,
              ciudad, WhatsApp (opcional), intereses (opcional) y la confirmación de que tienes 18 años o más. No
              solicitamos ni almacenamos tu fecha de nacimiento completa.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Cómo usamos tu información</h2>
            <p className="mt-2 text-gray">
              Usamos tus datos para gestionar tu pase semanal, confirmar reservaciones, enviarte correos relacionados
              con tus experiencias (confirmación, cancelación) y compartir la lista de asistentes con el negocio
              correspondiente para validar tu llegada.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Con quién compartimos tu información</h2>
            <p className="mt-2 text-gray">
              Compartimos tu nombre y folio con el negocio anfitrión de cada experiencia que reserves, únicamente
              para fines de validación de asistencia. No vendemos tu información a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Seguridad</h2>
            <p className="mt-2 text-gray">
              Tu información se almacena en Supabase con controles de acceso a nivel de fila (Row Level Security).
              Solo tú y el equipo administrador de Sunny Project pueden acceder a tus reservaciones.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Tus derechos</h2>
            <p className="mt-2 text-gray">
              Puedes actualizar tu información desde &quot;Mi cuenta&quot; en cualquier momento. Para solicitar la
              eliminación de tu cuenta, contáctanos a través del correo indicado en el pie de página.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
