import type { Metadata } from "next";
import { DM_Sans, Poppins } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AppChrome } from "@/components/motion/AppChrome";
import { SunniModalProvider } from "@/components/lean/SunniModal";
import { getSiteSettings } from "@/lib/sanity/queries";
import { DEFAULT_SETTINGS, mezclarAjustes } from "@/lib/lean-content";

/**
 * Las dos tipografías de Sun-i project®.
 *
 * Poppins para titulares —geométrica, redonda, con la personalidad optimista
 * de la marca— y DM Sans para el cuerpo, que es más neutra y aguanta párrafos
 * largos sin cansar.
 *
 * SE FUE LA SERIF, Y NO POR GUSTO
 *
 * La marca anterior contrastaba Manrope con Newsreader en cursiva, y ese
 * duelo era media personalidad del sitio. La identidad de Sun-i prohíbe
 * expresamente la tipografía serif, así que el contraste ahora lo hacen el
 * peso y la escala dentro de la misma familia geométrica. `--font-serif`
 * apunta a Poppins para que las veinticinco marcas de acento que ya existían
 * en el catálogo sigan leyéndose como acento en vez de romperse.
 */
const poppins = Poppins({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  style: ["normal", "italic"],
});
const dmSans = DM_Sans({ variable: "--font-body", subsets: ["latin"] });

/**
 * Los metadatos del sitio entero: lo que sale en Google y en el enlace que
 * alguien pega en WhatsApp.
 *
 * Decían «cupos limitados» y «un pase gratuito por semana» — el producto
 * anterior, en el único texto que se propaga fuera del sitio y que nadie
 * revisa porque no se ve en pantalla.
 */
/**
 * Se leen de Sanity, igual que el resto del texto de marca.
 *
 * Antes estaban escritos a mano aquí y decían «Experiencias de bienestar,
 * movimiento y comunidad… Sin cuentas y sin pagar nada». Dos problemas en el
 * único texto que sale FUERA del sitio y que nadie revisa porque no se ve en
 * pantalla: encerraba a Sunny en wellness cuando también entran cafés y
 * talleres, y prometía gratuidad de toda experiencia, que el producto no
 * sostiene —no hay campo de precio ni cobro, así que lo verificable es que
 * solicitar no cuesta—.
 *
 * Esta es la descripción por defecto de TODAS las páginas: cada una que no
 * defina la suya hereda esta.
 */
export async function generateMetadata(): Promise<Metadata> {
  const s = mezclarAjustes(DEFAULT_SETTINGS, await getSiteSettings());
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    /**
     * Lo que se ve cuando alguien pega el enlace en WhatsApp. La imagen la
     * genera `app/opengraph-image.tsx`; aquí solo va el texto que la acompaña.
     */
    openGraph: {
      title: s.seoTitle,
      description: s.seoDescription,
      locale: "es_MX",
      type: "website",
      siteName: "Sun‑i project®",
    },
    twitter: { card: "summary_large_image" },
  };
}

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
    <html lang="es" className={`${poppins.variable} ${dmSans.variable} h-full antialiased`}>
      <head>
        {/*
          Las fotografías se sirven desde el CDN de Sanity, no desde el
          optimizador de Vercel — así se codifican una sola vez en vez de dos.
          La contrapartida es un servidor más al que conectarse, y esa conexión
          (DNS, TLS) se paga entera antes del primer byte de la primera imagen.

          `preconnect` la abre mientras el navegador todavía está leyendo el
          HTML, así que cuando toca pedir la fotografía el canal ya está listo.
        */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className="flex min-h-screen flex-col bg-warm-white text-ink">
        {/* Primero en el orden de tabulación, invisible hasta que recibe el
            foco. Sin él, quien navega con teclado recorre el logotipo, los
            cuatro enlaces y el botón en CADA página antes de llegar al texto. */}
        <a
          href="#contenido"
          className="skip-link rounded-md bg-carbon px-4 py-2.5 text-small font-medium text-warm-white"
        >
          Saltar al contenido
        </a>
        <Header />
        {/*
          El proveedor del formulario envuelve todo el árbol porque hay botones
          que lo abren FUERA de la portada: el de la cabecera, que sale en
          todas las páginas. Es un componente de cliente, pero `children` sigue
          renderizándose en el servidor — se le pasa como prop ya resuelto.
        */}
        {/*
          LA LÍNEA DE SOL.

          Cuatro píxeles del gradiente de la marca cruzando el borde superior
          de TODAS las páginas. Es la pieza que hace que el sitio se lea como
          un solo sitio: entres por la portada, por el catálogo o por una ficha
          de experiencia, lo primero que hay arriba es lo mismo.

          Sustituye a la mancha difuminada que había flotando en la esquina del
          hero. Aquella era decoración —y de la que delata una página generada
          con IA—; esta significa algo: un amanecer, en una marca que se llama
          Sun-i, y funciona como cabecera de publicación.

          Va fija y por encima del encabezado para que no desaparezca al hacer
          scroll: si se fuera con el scroll sería un adorno del hero otra vez,
          no una firma del sitio.
        */}
        <div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[60] h-1"
          style={{ backgroundImage: "var(--gradient-sun)" }}
        />

        <SunniModalProvider>
          <AppChrome>
            <div id="contenido" className="flex flex-1 flex-col">{children}</div>
          </AppChrome>
        </SunniModalProvider>
        <Footer />
      </body>
    </html>
  );
}
