import type { Metadata } from "next";
import { Suspense } from "react";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AppChrome } from "@/components/motion/AppChrome";
import { SessionWelcomeToast } from "@/components/site/SessionWelcomeToast";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["italic", "normal"] });

export const metadata: Metadata = {
  title: "Sunny Project — Descubre algo nuevo para sentirte bien",
  description:
    "Experiencias de wellness, movimiento, cafés y recovery con cupos limitados en Monterrey. Un pase gratuito por semana.",
};

/**
 * EL SITIO NO DEPENDE DE NINGUNA BASE DE DATOS PARA DIBUJARSE
 *
 * Aquí vivía una condición que, si faltaban las credenciales de Supabase,
 * sustituía **el sitio entero** por una pantalla de «Falta configurar
 * Supabase». Tenía sentido en la versión avanzada, donde sin base de datos no
 * hay sesiones ni reservaciones y era mejor decirlo que reventar.
 *
 * En esta versión no: el MVP no usa Supabase. El contenido viene de Sanity y
 * las solicitudes van a una hoja de cálculo. Una comprobación de algo que no se
 * usa solo podía hacer una cosa —tumbar la portada en el primer despliegue
 * limpio— y eso fue exactamente lo que hizo.
 *
 * La lección para quien venga: lo que se pone en el layout raíz corre en
 * **todas** las rutas. Una condición aquí no es una precaución local, es una
 * llave de paso de todo el sitio.
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-ivory text-carbon">
        <Suspense fallback={null}>
          <SessionWelcomeToast />
        </Suspense>
        <Header />
        <AppChrome>
          <div className="flex flex-1 flex-col">{children}</div>
        </AppChrome>
        <Footer />
      </body>
    </html>
  );
}
