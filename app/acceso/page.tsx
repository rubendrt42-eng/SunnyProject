import type { Metadata } from "next";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Acceso — Sunny Project" };

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/mi-pase";

  return (
    <main className="flex flex-1 items-center py-16 sm:py-24">
      <Container className="max-w-md">
        <p className="font-serif text-3xl italic">Entra a Sunny</p>
        <h1 className="mt-2 text-2xl font-semibold">Accede con tu correo</h1>
        <p className="mt-2 text-gray">Usamos un enlace mágico, sin contraseñas.</p>
        <div className="mt-8">
          <MagicLinkForm next={safeNext} />
        </div>
      </Container>
    </main>
  );
}
