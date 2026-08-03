"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center py-24">
      <Container className="max-w-md text-center">
        <p className="eyebrow">Algo salió mal</p>
        <h1 className="mt-2 text-subtitle">No pudimos cargar esta página</h1>
        <p className="mt-2 text-gray">Intenta de nuevo. Si el problema sigue, vuelve más tarde.</p>
        <Button onClick={reset} className="mt-6">
          Intentar de nuevo
        </Button>
      </Container>
    </main>
  );
}
