import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/Button";
import { FaqList } from "@/components/site/FaqList";
import { getSiteSettings } from "@/lib/sanity/queries";
import { DEFAULT_SETTINGS, mezclarAjustes } from "@/lib/lean-content";

export const metadata: Metadata = {
  title: "Preguntas sobre las experiencias — Sun‑i project®",
  description:
    "Dudas sobre el calendario de experiencias abiertas al público de Sun‑i: qué hay, si puedes ir solo, qué cuesta y cómo sabes que tu lugar quedó confirmado.",
};

/** 60 segundos. Tiene que ser literal: Next lo analiza de forma estática. */
export const revalidate = 60;

/**
 * Las preguntas frecuentes, **con una sola fuente**.
 *
 * Antes esta página tenía su propia lista escrita a mano en el código, con once
 * preguntas del producto anterior: pase semanal, folios, cancelación a 12
 * horas, acompañantes que no gastan su pase. La portada, mientras tanto, leía
 * las suyas de Sanity. Dos listas distintas respondiendo lo mismo de dos formas
 * incompatibles, y solo una de ellas editable por Emmy.
 *
 * Ahora las dos leen `siteSettings.faq`. Si Emmy cambia una respuesta, cambia
 * en los dos sitios. Y si el documento todavía no existe, ambas caen en el
 * mismo valor de reserva de `DEFAULT_SETTINGS` — que no es texto de relleno,
 * es la versión escrita y revisada del producto real.
 */
export default async function FaqPage() {
  const s = mezclarAjustes(DEFAULT_SETTINGS, await getSiteSettings());
  const faq = s.faq;

  return (
    <main className="py-14 sm:py-24">
      <Container className="max-w-3xl">
        <p className="eyebrow">Experiencias abiertas al público</p>
        <h1 className="mt-3 text-display text-balance">Preguntas frecuentes</h1>
        {/*
          EL ENCUADRE, QUE ANTES FALTABA.

          Estas preguntas son del CALENDARIO de experiencias abiertas al
          público, no del negocio principal de Sun‑i. Sin esta línea, alguien
          que llega desde la portada —donde Sun‑i es vending y experiencias
          para espacios— pulsa «preguntas frecuentes» en el pie y encuentra
          otra empresa: cupos, WhatsApp, solicitar un lugar.

          La página no cambia. Lo que cambia es que ahora dice de qué habla.
        */}
        <p className="mt-4 max-w-[56ch] text-body text-gray">
          Sobre el calendario de experiencias que publicamos para apuntarse.{" "}
          <Link
            href="/#vending"
            className="font-medium text-coral-ink underline decoration-coral/35 underline-offset-4 transition-colors hover:decoration-coral"
          >
            ¿Buscas Sun‑i para tu espacio?
          </Link>
        </p>
        {/*
          La invitación a escribir solo se dibuja si hay WhatsApp en Sanity.
          Prometer que contestamos por un canal que no existe es peor que no
          decir nada — y el canal lo pone Emmy, no el código.
        */}
        {s.whatsapp?.trim() && (
          <p className="mt-5 text-body-l text-gray">Si no está aquí, escríbenos por WhatsApp.</p>
        )}

        <div className="mt-10">
          <FaqList items={faq.map((item) => ({ q: item.question, a: item.answer }))} />
        </div>

        <div className="mt-12">
          <LinkButton href="/experiencias" variant="secondary" arrow>
            Ver experiencias
          </LinkButton>
        </div>
      </Container>
    </main>
  );
}
