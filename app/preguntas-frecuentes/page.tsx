import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { FaqList } from "@/components/site/FaqList";

export const metadata: Metadata = { title: "Preguntas frecuentes — Sunny Project" };

const FAQS = [
  { q: "¿Cuánto cuesta usar Sunny Project?", a: "Nada. Cada semana tienes un pase gratuito para reclamar un lugar en una experiencia disponible." },
  { q: "¿Cómo funciona el pase semanal?", a: "Tienes un pase por semana calendario (de lunes a domingo). Se renueva automáticamente cada lunes y no se acumula si no lo usas." },
  { q: "¿Puedo reservar más de una experiencia por semana?", a: "No. Solo puedes tener una reservación activa a la vez por semana." },
  { q: "¿Puedo llevar acompañantes?", a: "No, el pase es individual, personal y no transferible." },
  { q: "¿Qué pasa si no puedo asistir?", a: "Puedes cancelar desde \"Mi pase\" hasta 12 horas antes del inicio y recuperas tu pase para reservar otra experiencia esa misma semana." },
  { q: "¿Qué pasa si cancelo muy tarde?", a: "Si faltan menos de 12 horas, ya no puedes cancelar desde la app. Si no asistes, el equipo podrá marcarlo como inasistencia y tu pase de esa semana quedará consumido." },
  { q: "¿Necesito un código QR?", a: "No. Al llegar, solo presenta tu nombre y tu folio de reservación." },
  { q: "¿Puedo usar Sunny Project si soy menor de edad?", a: "No, por ahora Sunny Project es solo para personas mayores de 18 años." },
  { q: "¿Cómo publico mi negocio?", a: "Completa el formulario en \"Para negocios\". Nuestro equipo revisa cada solicitud y publica la experiencia por ti." },
  { q: "¿Hay planes de pago o membresías?", a: "No en esta etapa. Sunny Project es completamente gratuito mientras validamos el producto." },
];

export default function FaqPage() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <h1 className="font-serif text-4xl italic sm:text-5xl">Preguntas frecuentes</h1>
        <div className="mt-10">
          <FaqList items={FAQS} />
        </div>
      </Container>
    </main>
  );
}
