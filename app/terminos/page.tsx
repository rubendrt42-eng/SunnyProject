import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Términos — Sunny Project" };

export default function TerminosPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-2xl">
        <h1 className="font-serif text-4xl italic">Términos de uso</h1>
        <p className="mt-2 text-sm text-gray">Última actualización: proyecto de demostración.</p>

        <div className="mt-10 space-y-8 text-carbon">
          <section>
            <h2 className="text-lg font-semibold">Elegibilidad</h2>
            <p className="mt-2 text-gray">
              Sunny Project está disponible únicamente para personas mayores de 18 años residentes en Monterrey y su
              área metropolitana. Al reservar una experiencia confirmas que cumples con este requisito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">El pase semanal</h2>
            <p className="mt-2 text-gray">
              Cada usuario tiene derecho a un pase gratuito por semana calendario (lunes a domingo). El pase es
              personal y no transferible. No se acumulan pases no utilizados de semanas anteriores.
            </p>
            <p className="mt-2 text-gray">
              Algunas experiencias admiten acompañantes (hasta tres lugares por reservación, según lo que defina cada
              experiencia). En ese caso, los lugares de los acompañantes se descuentan del cupo de la experiencia, los
              acompañantes no requieren cuenta ni consumen un pase propio, y la persona que reserva es responsable de su
              grupo. Cancelar una reservación cancela todos los lugares de ese grupo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Reservaciones y cancelaciones</h2>
            <p className="mt-2 text-gray">
              Una reservación confirmada, una asistencia o una inasistencia consumen tu pase semanal. Puedes cancelar
              sin costo hasta 12 horas antes del inicio de la experiencia. Pasado ese plazo, la reservación no se
              puede cancelar desde la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Conducta en las experiencias</h2>
            <p className="mt-2 text-gray">
              Al asistir a una experiencia te comprometes a respetar las políticas del negocio anfitrión y las
              restricciones específicas indicadas en cada experiencia.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Cambios y disponibilidad</h2>
            <p className="mt-2 text-gray">
              Sunny Project y los negocios participantes pueden cancelar una experiencia en cualquier momento. Si
              esto ocurre, recuperarás tu pase semanal automáticamente y te lo notificaremos por correo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Sin pagos ni membresías</h2>
            <p className="mt-2 text-gray">
              Esta versión de Sunny Project no incluye pagos, suscripciones ni pases adicionales. El servicio es
              completamente gratuito mientras validamos el producto.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
