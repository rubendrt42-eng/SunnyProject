import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center py-24">
      <Container className="max-w-md text-center">
        <p className="font-serif text-6xl italic text-orange-ink">404</p>
        <h1 className="mt-4 text-subtitle">No encontramos esta página</h1>
        <p className="mt-2 text-gray">
          Puede que el enlace esté roto o que la experiencia ya no esté disponible.
        </p>
        <LinkButton href="/experiencias" className="mt-8">
          Explorar experiencias
        </LinkButton>
      </Container>
    </main>
  );
}
