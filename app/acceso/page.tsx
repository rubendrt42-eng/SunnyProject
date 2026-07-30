import type { Metadata } from "next";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = { title: "Acceso — Sunny Project" };

/**
 * El mensaje genérico decía «Intenta de nuevo», que es el consejo equivocado
 * para la causa más frecuente: abrir el enlace en un navegador distinto al
 * que pidió el acceso. Reintentar desde el mismo sitio repite el fallo.
 */
const ERROR_MESSAGES: Record<string, string> = {
  expired: "El enlace expiró o ya se usó. Pide uno nuevo abajo.",
  generic:
    "Si abriste el enlace desde el correo, prueba a copiarlo y pegarlo en el navegador donde pediste el acceso: algunas apps abren los enlaces en un navegador propio y ahí la sesión no se guarda.",
};

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  // `startsWith("/")` alone would still accept a protocol-relative URL like
  // "//evil.com" (browsers treat that as https://evil.com) — every current
  // caller of `next` is already safe against that (origin is always
  // hardcoded elsewhere), but this closes it here too as defense in depth.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/mi-pase";
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.generic) : null;

  return (
    <main className="flex flex-1 items-center py-16 sm:py-24">
      <Container className="max-w-md">
        <p className="eyebrow">Entra a Sunny</p>
        <h1 className="mt-3 text-title">Accede con tu correo</h1>
        <p className="mt-2 text-gray">Usamos un enlace mágico, sin contraseñas.</p>

        {errorMessage && (
          <div role="alert" className="mt-6 rounded-xl border border-orange/30 bg-orange/10 p-4 text-sm text-carbon">
            <p className="font-medium">No pudimos validar el acceso</p>
            <p className="mt-1 text-carbon/80">{errorMessage}</p>
          </div>
        )}

        <div className="mt-8">
          <MagicLinkForm next={safeNext} />
        </div>
      </Container>
    </main>
  );
}
