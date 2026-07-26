export function SetupRequired() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-6 py-16">
      <div className="w-full max-w-xl rounded-2xl border border-carbon/10 bg-warm-white p-10 shadow-sm">
        <p className="font-serif text-3xl italic">Sunny Project</p>
        <h1 className="mt-4 text-2xl font-semibold">Falta configurar Supabase</h1>
        <p className="mt-3 text-gray">
          Esta aplicación necesita las credenciales de Supabase para funcionar. Copia{" "}
          <code className="rounded bg-carbon/8 px-1.5 py-0.5 text-sm">.env.example</code> a{" "}
          <code className="rounded bg-carbon/8 px-1.5 py-0.5 text-sm">.env.local</code> y completa al menos:
        </p>
        <ul className="mt-4 space-y-1 text-sm text-carbon">
          <li>
            <code className="rounded bg-carbon/8 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            <code className="rounded bg-carbon/8 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
          <li>
            <code className="rounded bg-carbon/8 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code>
          </li>
        </ul>
        <p className="mt-4 text-sm text-gray">
          Después aplica las migraciones en <code className="rounded bg-carbon/8 px-1.5 py-0.5">supabase/migrations</code> y
          ejecuta el seed. Consulta el README para instrucciones completas.
        </p>
      </div>
    </main>
  );
}
