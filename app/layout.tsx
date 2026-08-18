import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AppChrome } from "@/components/motion/AppChrome";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["italic", "normal"] });

/**
 * Los metadatos del sitio entero: lo que sale en Google y en el enlace que
 * alguien pega en WhatsApp.
 *
 * Decían «cupos limitados» y «un pase gratuito por semana» — el producto
 * anterior, en el único texto que se propaga fuera del sitio y que nadie
 * revisa porque no se ve en pantalla.
 */
export const metadata: Metadata = {
  title: "The Sunny Project — Experiencias en Monterrey",
  description:
    "Experiencias de bienestar, movimiento y comunidad en Monterrey. Solicitas tu lugar, nosotros te confirmamos. Sin cuentas y sin pagar nada.",
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
 *
 * También se retiró `SessionWelcomeToast`, el aviso de «sesión iniciada» que
 * aparecía al volver del callback de autenticación. En este MVP no hay
 * autenticación, así que nunca podía dispararse — pero sí cargaba la librería
 * de animación en todas las páginas del sitio para no hacer nada.
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-ivory text-carbon">
        <Header />
        <AppChrome>
          <div className="flex flex-1 flex-col">{children}</div>
        </AppChrome>
        <Footer />
      </body>
    </html>
  );
}
