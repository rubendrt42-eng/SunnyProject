/**
 * Seeds four demo businesses + experiences (see PRODUCT_SPEC.md §20).
 * Run with: pnpm seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Category } from "../lib/database.types";

interface SeedBusiness {
  name: string;
  slug: string;
  description: string;
  category: Category;
  active: boolean;
  contact_name: string;
  contact_email: string;
  logo_url: string;
}

interface SeedExperience {
  business_slug: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: Category;
  image_url: string;
  location_name: string;
  address: string;
  maps_url: string;
  capacity: number;
  what_is_included: string[];
  requirements: string[];
  restrictions: string[];
  instructions: string;
  startDays: number;
  startHour: number;
  durationHours: number;
}

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local. Aborta el seed.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

function daysFromNow(days: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

const BUSINESSES: SeedBusiness[] = [
  {
    name: "Studio Norte",
    slug: "studio-norte",
    description: "Estudio boutique de movimiento en San Pedro. [Demostración]",
    category: "movimiento",
    active: true,
    contact_name: "Studio Norte Team",
    contact_email: "hola@studionorte.demo",
    logo_url: "/images/placeholder-1.svg",
  },
  {
    name: "Reset Lab",
    slug: "reset-lab",
    description: "Laboratorio de recovery y bienestar en Monterrey. [Demostración]",
    category: "recovery",
    active: true,
    contact_name: "Reset Lab Team",
    contact_email: "hola@resetlab.demo",
    logo_url: "/images/placeholder-2.svg",
  },
  {
    name: "Casa Clara",
    slug: "casa-clara",
    description: "Café de especialidad en Barrio Antiguo. [Demostración]",
    category: "food_coffee",
    active: true,
    contact_name: "Casa Clara Team",
    contact_email: "hola@casaclara.demo",
    logo_url: "/images/placeholder-3.svg",
  },
  {
    name: "Agua Club",
    slug: "agua-club",
    description: "Club de actividades acuáticas en Santiago. [Demostración]",
    category: "outdoor",
    active: true,
    contact_name: "Agua Club Team",
    contact_email: "hola@aguaclub.demo",
    logo_url: "/images/placeholder-4.svg",
  },
];

async function main() {
  console.log("Sembrando negocios...");
  const businessMap = new Map<string, string>();

  for (const business of BUSINESSES) {
    const { data, error } = await supabase.from("businesses").upsert(business, { onConflict: "slug" }).select().single();
    if (error) throw error;
    businessMap.set(business.slug, data.id);
    console.log(`  ✓ ${business.name}`);
  }

  const EXPERIENCES: SeedExperience[] = [
    {
      business_slug: "studio-norte",
      title: "Pilates Intro [Demostración]",
      slug: "pilates-intro-demo",
      short_description: "Clase introductoria de pilates para todos los niveles.",
      description:
        "Una clase introductoria pensada para quienes quieren probar el método pilates por primera vez, con equipo profesional e instructoras certificadas. Experiencia de demostración para Sunny Project.",
      category: "movimiento",
      image_url: "/images/placeholder-1.svg",
      location_name: "Studio Norte — San Pedro",
      address: "Av. Gómez Morín 1000, San Pedro Garza García",
      maps_url: "https://maps.google.com/?q=Studio+Norte+San+Pedro",
      capacity: 10,
      what_is_included: ["Clase guiada de 50 minutos", "Uso de equipo de pilates", "Agua de cortesía"],
      requirements: ["Ropa cómoda", "Llegar 10 minutos antes"],
      restrictions: ["No recomendado si tienes una lesión reciente sin autorización médica"],
      instructions: "Preséntate en recepción con tu nombre y folio 10 minutos antes de la clase.",
      startDays: 3,
      startHour: 9,
      durationHours: 1,
    },
    {
      business_slug: "reset-lab",
      title: "Recovery Session [Demostración]",
      slug: "recovery-session-demo",
      short_description: "Sesión de recovery guiada con terapias de contraste.",
      description:
        "Sesión guiada de recovery que combina sauna, baño de hielo y estiramiento asistido para acelerar tu recuperación física. Experiencia de demostración para Sunny Project.",
      category: "recovery",
      image_url: "/images/placeholder-2.svg",
      location_name: "Reset Lab — Monterrey",
      address: "Av. Constitución 500, Monterrey Centro",
      maps_url: "https://maps.google.com/?q=Reset+Lab+Monterrey",
      capacity: 8,
      what_is_included: ["Acceso a sauna", "Baño de hielo guiado", "Estiramiento asistido de 15 min"],
      requirements: ["Traje de baño", "Toalla propia"],
      restrictions: ["No recomendado para personas con condiciones cardiacas sin autorización médica"],
      instructions: "Llega con traje de baño puesto. Los casilleros están disponibles en recepción.",
      startDays: 4,
      startHour: 18,
      durationHours: 1,
    },
    {
      business_slug: "casa-clara",
      title: "Coffee Tasting [Demostración]",
      slug: "coffee-tasting-demo",
      short_description: "Degustación guiada de café de especialidad.",
      description:
        "Una degustación de tres orígenes distintos de café de especialidad, guiada por nuestro equipo de baristas, con explicación de proceso y notas de cata. Experiencia de demostración para Sunny Project.",
      category: "food_coffee",
      image_url: "/images/placeholder-3.svg",
      location_name: "Casa Clara — Barrio Antiguo",
      address: "Calle Padre Mier 300, Barrio Antiguo, Monterrey",
      maps_url: "https://maps.google.com/?q=Casa+Clara+Barrio+Antiguo",
      capacity: 12,
      what_is_included: ["Degustación de 3 orígenes", "Explicación de proceso", "Snack ligero"],
      requirements: [],
      restrictions: ["No recomendado para menores de edad por horario nocturno"],
      instructions: "Pregunta por la mesa de degustación de Sunny Project al llegar.",
      startDays: 2,
      startHour: 17,
      durationHours: 1,
    },
    {
      business_slug: "agua-club",
      title: "Sunrise Paddle [Demostración]",
      slug: "sunrise-paddle-demo",
      short_description: "Experiencia de paddle board al amanecer en Santiago.",
      description:
        "Sesión guiada de paddle board al amanecer en la presa de Santiago, incluyendo equipo completo e instrucción básica para principiantes. Experiencia de demostración para Sunny Project.",
      category: "outdoor",
      image_url: "/images/placeholder-4.svg",
      location_name: "Agua Club — Santiago",
      address: "Presa La Boca, Santiago, Nuevo León",
      maps_url: "https://maps.google.com/?q=Presa+La+Boca+Santiago",
      capacity: 6,
      what_is_included: ["Tabla de paddle y remo", "Chaleco salvavidas", "Instrucción básica"],
      requirements: ["Saber nadar", "Ropa que se pueda mojar"],
      restrictions: ["No recomendado para personas que no saben nadar"],
      instructions: "Llega al muelle principal de Agua Club 15 minutos antes del amanecer.",
      startDays: 6,
      startHour: 7,
      durationHours: 2,
    },
  ];

  console.log("Sembrando experiencias...");
  for (const exp of EXPERIENCES) {
    const businessId = businessMap.get(exp.business_slug);
    if (!businessId) continue;

    const startsAt = daysFromNow(exp.startDays, exp.startHour);
    const endsAtDate = new Date(startsAt);
    endsAtDate.setUTCHours(endsAtDate.getUTCHours() + exp.durationHours);

    const { error } = await supabase
      .from("experiences")
      .upsert(
        {
          business_id: businessId,
          title: exp.title,
          slug: exp.slug,
          short_description: exp.short_description,
          description: exp.description,
          category: exp.category,
          image_url: exp.image_url,
          location_name: exp.location_name,
          address: exp.address,
          maps_url: exp.maps_url,
          starts_at: startsAt,
          ends_at: endsAtDate.toISOString(),
          claim_opens_at: new Date().toISOString(),
          claim_closes_at: startsAt,
          capacity: exp.capacity,
          status: "published",
          featured: exp.slug === "pilates-intro-demo",
          what_is_included: exp.what_is_included,
          requirements: exp.requirements,
          restrictions: exp.restrictions,
          instructions: exp.instructions,
        },
        { onConflict: "slug" },
      );

    if (error) throw error;
    console.log(`  ✓ ${exp.title}`);
  }

  console.log("Seed completo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
