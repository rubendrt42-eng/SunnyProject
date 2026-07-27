import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { isSupabaseConfigured } from "@/lib/env";
import { SetupRequired } from "@/components/setup-required";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AppChrome } from "@/components/motion/AppChrome";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["italic", "normal"] });

export const metadata: Metadata = {
  title: "Sunny Project — Descubre algo nuevo para sentirte bien",
  description:
    "Experiencias de wellness, movimiento, cafés y recovery con cupos limitados en Monterrey. Un pase gratuito por semana.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();

  return (
    <html lang="es" className={`${manrope.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-ivory text-carbon">
        {configured ? (
          <>
            <Header />
            <AppChrome>
              <div className="flex flex-1 flex-col">{children}</div>
            </AppChrome>
            <Footer />
          </>
        ) : (
          <SetupRequired />
        )}
      </body>
    </html>
  );
}
