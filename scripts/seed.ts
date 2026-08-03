/**
 * Seeds six demo businesses + experiences (see PRODUCT_SPEC.md §20 and the
 * "experiencias de demostración" brief). Run with: pnpm seed
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Idempotent: every insert is an upsert keyed on `slug`, so running this
 * multiple times updates the same rows instead of creating duplicates.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Category } from "../lib/database.types";

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

interface SeedBusiness {
  name: string;
  slug: string;
  description: string;
  category: Category;
  active: boolean;
  contact_name: string;
  contact_email: string;
  /** Null on the demo businesses: inventing a logo would imply a brand mark that does not exist. */
  logo_url: string | null;
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
  featured: boolean;
  startDays: number;
  startHour: number;
  durationHours: number;
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
    logo_url: null,
  },
  {
    name: "Reset Lab",
    slug: "reset-lab",
    description: "Laboratorio de recovery y bienestar en Monterrey. [Demostración]",
    category: "recovery",
    active: true,
    contact_name: "Reset Lab Team",
    contact_email: "hola@resetlab.demo",
    logo_url: null,
  },
  {
    name: "Casa Clara",
    slug: "casa-clara",
    description: "Café de especialidad en Barrio Antiguo. [Demostración]",
    category: "food_coffee",
    active: true,
    contact_name: "Casa Clara Team",
    contact_email: "hola@casaclara.demo",
    logo_url: null,
  },
  {
    name: "Club Norte Pádel",
    slug: "club-norte-padel",
    description: "Club de pádel con canchas de cristal en Valle Oriente. [Demostración]",
    category: "outdoor",
    active: true,
    contact_name: "Club Norte Team",
    contact_email: "hola@clubnortepadel.demo",
    logo_url: null,
  },
  {
    name: "Norte Run Club",
    slug: "norte-run-club",
    description: "Comunidad de corredores en San Pedro. [Demostración]",
    category: "comunidad",
    active: true,
    contact_name: "Norte Run Club Team",
    contact_email: "hola@norterunclub.demo",
    logo_url: null,
  },
  {
    name: "Lumen Studio",
    slug: "lumen-studio",
    description: "Estudio de yoga y movimiento consciente en Monterrey. [Demostración]",
    category: "movimiento",
    active: true,
    contact_name: "Lumen Studio Team",
    contact_email: "hola@lumenstudio.demo",
    logo_url: null,
  },
];

const EXPERIENCES: SeedExperience[] = [
  {
    business_slug: "studio-norte",
    title: "Mat Pilates Intro [Demostración]",
    slug: "mat-pilates-intro-demo",
    short_description: "Clase introductoria de mat pilates para todos los niveles.",
    description:
      "Clase introductoria de mat pilates en tapete, con pelota y props, para personas que quieren probar el método por primera vez. Experiencia de demostración para Sunny Project.",
    category: "movimiento",
    image_url: "/media/sunny/experiences/experience-mat-pilates-01.webp",
    location_name: "Studio Norte — San Pedro",
    address: "Av. Gómez Morín 1000, San Pedro Garza García",
    maps_url: "https://maps.google.com/?q=Studio+Norte+San+Pedro",
    capacity: 10,
    what_is_included: ["Clase guiada de 50 minutos", "Tapete y props", "Agua de cortesía"],
    requirements: ["Ropa cómoda", "Llegar 10 minutos antes"],
    restrictions: ["No recomendado si tienes una lesión reciente sin autorización médica"],
    instructions: "Preséntate en recepción con tu nombre y folio 10 minutos antes de la clase.",
    featured: true,
    startDays: 3,
    startHour: 9,
    durationHours: 1,
  },
  {
    business_slug: "reset-lab",
    title: "Recovery & Breathwork [Demostración]",
    slug: "recovery-breathwork-demo",
    short_description: "Sesión guiada de respiración y movilidad para bajar el ritmo.",
    description:
      "Sesión guiada de respiración consciente y movilidad suave, en grupo pequeño y con luz baja. Experiencia de demostración para Sunny Project.",
    category: "recovery",
    image_url: "/media/sunny/experiences/experience-recovery-breathwork-01.webp",
    location_name: "Reset Lab — Monterrey",
    address: "Av. Constitución 500, Monterrey Centro",
    maps_url: "https://maps.google.com/?q=Reset+Lab+Monterrey",
    capacity: 8,
    what_is_included: ["Sauna", "Baño frío", "Movilidad guiada"],
    requirements: ["Traje de baño", "Toalla"],
    restrictions: ["No recomendado para personas con condiciones cardiacas sin autorización médica"],
    instructions: "Llega con traje de baño puesto. Los casilleros están disponibles en recepción.",
    featured: false,
    startDays: 4,
    startHour: 18,
    durationHours: 1,
  },
  {
    business_slug: "casa-clara",
    title: "Coffee Tasting [Demostración]",
    slug: "coffee-tasting-demo",
    short_description: "Degustación guiada de tres cafés de especialidad.",
    description:
      "Degustación guiada de tres cafés de especialidad y explicación de sus procesos. Experiencia de demostración para Sunny Project.",
    category: "food_coffee",
    image_url: "/media/sunny/experiences/experience-coffee-tasting-01.webp",
    location_name: "Casa Clara — Barrio Antiguo",
    address: "Calle Padre Mier 300, Barrio Antiguo, Monterrey",
    maps_url: "https://maps.google.com/?q=Casa+Clara+Barrio+Antiguo",
    capacity: 12,
    what_is_included: ["Tres cafés", "Explicación de notas de cata", "Snack ligero"],
    requirements: [],
    restrictions: ["No recomendado para menores de edad por horario nocturno"],
    instructions: "Pregunta por la mesa de degustación de Sunny Project al llegar.",
    featured: false,
    startDays: 2,
    startHour: 17,
    durationHours: 1,
  },
  {
    business_slug: "club-norte-padel",
    title: "Pádel Mix-In [Demostración]",
    slug: "padel-mixin-demo",
    short_description: "Partidos rotativos de pádel para conocer gente, con palas incluidas.",
    description:
      "Sesión de pádel con formato mix-in: cambias de pareja cada set, así que juegas con varias personas en la misma hora. Experiencia de demostración para Sunny Project.",
    category: "movimiento",
    image_url: "/media/sunny/experiences/experience-padel-mixin-01.webp",
    location_name: "Club Norte Pádel — Valle Oriente",
    address: "Av. Lázaro Cárdenas, Valle Oriente, San Pedro Garza García",
    maps_url: "https://maps.google.com/?q=Valle+Oriente+San+Pedro+Garza+Garcia",
    capacity: 8,
    what_is_included: ["Pala de pádel", "Pelotas", "Cancha", "Explicación inicial para principiantes"],
    requirements: ["Ropa deportiva", "Tenis de suela lisa"],
    restrictions: ["Aforo por cancha limitado a 4 personas"],
    instructions: "Llega 10 minutos antes a la recepción del club y pregunta por el Mix-In de Sunny.",
    featured: false,
    startDays: 6,
    startHour: 19,
    durationHours: 2,
  },
  {
    business_slug: "norte-run-club",
    title: "Run & Coffee Social [Demostración]",
    slug: "run-coffee-social-demo",
    short_description: "Carrera social de 5 km seguida de café y convivencia.",
    description:
      "Carrera social de cinco kilómetros seguida de café y convivencia. Experiencia de demostración para Sunny Project.",
    category: "comunidad",
    image_url: "/media/sunny/originals/original-run-and-coffee-01.webp",
    location_name: "Norte Run Club — San Pedro",
    address: "Parque Fundidora Sur, San Pedro Garza García",
    maps_url: "https://maps.google.com/?q=San+Pedro+Garza+Garcia",
    capacity: 20,
    what_is_included: ["Ruta guiada", "Hidratación", "Café al terminar"],
    requirements: ["Poder completar 5 km", "Llegar 15 minutos antes"],
    restrictions: ["Ritmo social, no competitivo"],
    instructions: "Punto de encuentro en la entrada principal del parque. Busca la manta de Sunny Project.",
    featured: false,
    startDays: 5,
    startHour: 7,
    durationHours: 1,
  },
  {
    business_slug: "lumen-studio",
    title: "Sunset Yoga [Demostración]",
    slug: "sunset-yoga-demo",
    short_description: "Clase de yoga al atardecer para todos los niveles.",
    description: "Clase de yoga al atardecer para todos los niveles. Experiencia de demostración para Sunny Project.",
    category: "movimiento",
    image_url: "/media/sunny/experiences/experience-sunset-yoga-01.webp",
    location_name: "Lumen Studio — Monterrey",
    address: "Av. Chepevera 250, Monterrey",
    maps_url: "https://maps.google.com/?q=Lumen+Studio+Monterrey",
    capacity: 12,
    what_is_included: ["Clase guiada", "Tapete", "Agua"],
    requirements: ["Ropa cómoda"],
    restrictions: ["No recomendado si tienes una lesión reciente sin autorización médica"],
    instructions: "El tapete se presta en recepción; devuélvelo al terminar la clase.",
    featured: false,
    startDays: 7,
    startHour: 19,
    durationHours: 1,
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

  console.log("Sembrando experiencias...");
  for (const exp of EXPERIENCES) {
    const businessId = businessMap.get(exp.business_slug);
    if (!businessId) continue;

    const startsAt = daysFromNow(exp.startDays, exp.startHour);
    const endsAtDate = new Date(startsAt);
    endsAtDate.setUTCHours(endsAtDate.getUTCHours() + exp.durationHours);

    const { error } = await supabase.from("experiences").upsert(
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
        featured: exp.featured,
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

  const { count: businessCount } = await supabase.from("businesses").select("*", { count: "exact", head: true });
  const { count: experienceCount } = await supabase.from("experiences").select("*", { count: "exact", head: true });

  console.log(`\nSeed completo. Negocios totales: ${businessCount ?? "?"}. Experiencias totales: ${experienceCount ?? "?"}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
