import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/profile";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AccountForm } from "@/components/account/AccountForm";
import { formatDate } from "@/lib/dates";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi cuenta — Sunny Project" };

export default async function MiCuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/acceso?next=/mi-cuenta");

  return (
    <main className="py-14 sm:py-20">
      <Container className="max-w-xl">
        <h1 className="font-serif text-4xl italic">Mi cuenta</h1>

        <div className="mt-8 rounded-2xl border border-carbon/10 bg-warm-white p-6">
          <p className="text-sm font-medium text-gray">Correo</p>
          <p className="mt-1">{user.email}</p>
        </div>

        <div className="mt-6">
          {user.profile && <AccountForm profile={user.profile} />}
        </div>

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
