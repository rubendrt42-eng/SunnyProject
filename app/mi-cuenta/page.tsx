import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/profile";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AccountForm } from "@/components/account/AccountForm";
import { isProfileComplete } from "@/lib/auth";
import Link from "next/link";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi cuenta — Sunny Project" };

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; bienvenido?: string }>;
}) {
  const { destino } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/acceso?next=/mi-cuenta");

  // Solo rutas internas, igual que `next` en /acceso y en el callback.
  const volver = destino && destino.startsWith("/") && !destino.startsWith("//") ? destino : null;
  const falta = !isProfileComplete(user.profile ?? null);

  return (
    <main className="py-14 sm:py-20">
      <Container className="max-w-xl">
        <h1 className="text-title">{falta ? "Falta un paso" : "Mi cuenta"}</h1>

        {/* Quien acaba de entrar y no tiene el perfil completo llega aquí
            derivado desde el callback, no por su cuenta. Sin una frase que lo
            explique, aterrizar en «Mi cuenta» en vez de donde ibas parece un
            error del sitio. */}
        {falta && (
          <p className="mt-3 text-body-l text-gray">
            Necesitamos tu nombre y tu confirmación para poder guardar un lugar a tu nombre. Es una sola vez.
          </p>
        )}

        <div className="mt-8 rounded-xl border border-carbon/10 bg-warm-white p-6">
          <p className="text-sm font-medium text-gray">Correo</p>
          <p className="mt-1">{user.email}</p>
        </div>

        <div className="mt-6">
          {user.profile && <AccountForm profile={user.profile} />}
        </div>

        {!falta && volver && (
          <Link
            href={volver}
            className="mt-6 inline-block text-small font-medium text-carbon underline decoration-carbon/30 underline-offset-4 hover:decoration-carbon"
          >
            Continuar a donde ibas
          </Link>
        )}

        {user.profile && (
          <p className="mt-6 text-xs text-gray">Miembro desde {formatDate(user.profile.created_at)}</p>
        )}

        <form action={signOutAction} className="mt-10 border-t border-carbon/10 pt-6">
          <Button type="submit" variant="outline">
            Cerrar sesión
          </Button>
        </form>
      </Container>
    </main>
  );
}
