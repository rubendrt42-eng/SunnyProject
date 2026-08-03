import { z } from "zod";

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre completo.")
    .max(120, "El nombre es demasiado largo."),
  phone: z
    .string()
    .trim()
    .max(30, "El número es demasiado largo.")
    .optional()
    .or(z.literal("")),
  city: z.string().trim().max(80).default("Monterrey"),
  interests: z.array(z.string().trim().max(40)).max(10).default([]),
  adult_confirmed: z.boolean().refine((v) => v === true, {
    message: "Debes confirmar que tienes 18 años o más.",
  }),
  terms_accepted: z.boolean().refine((v) => v === true, {
    message: "Debes aceptar los términos y el aviso de privacidad.",
  }),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const accountUpdateSchema = z.object({
  full_name: z.string().trim().min(2, "Escribe tu nombre completo.").max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80),
  interests: z.array(z.string().trim().max(40)).max(10),
});

export type AccountUpdateInput = z.infer<typeof accountUpdateSchema>;

/**
 * One companion. Full name required, email optional (decisions 2 and 5 in
 * SUNNY_MVP_1_1_DECISIONS.md). The empty string is coerced to undefined so a
 * blank optional email field doesn't fail email validation.
 */
export const companionSchema = z.object({
  full_name: z.string().trim().min(2, "Escribe el nombre completo del acompañante.").max(120),
  email: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => (v ? v : undefined))
    .pipe(z.string().email("Escribe un correo válido o déjalo vacío.").optional()),
});

export const claimReservationSchema = z
  .object({
    experienceId: z.string().uuid(),
    source: z.string().trim().max(60).optional().nullable(),
    /**
     * People this reservation covers, holder included. Capped at the MVP
     * ceiling here; the per-experience `max_party_size` is enforced inside
     * claim_reservation(), which is the only check that actually protects
     * capacity (this one just avoids a pointless round trip).
     */
    partySize: z.coerce.number().int().min(1).max(3).default(1),
    companions: z.array(companionSchema).max(2).default([]),
    acknowledgement: z.boolean().refine((v) => v === true, {
      message: "Debes confirmar las condiciones del pase antes de continuar.",
    }),
  })
  .refine((data) => data.companions.length === data.partySize - 1, {
    message: "Faltan nombres de acompañantes para el número de lugares elegido.",
    path: ["companions"],
  });

export type ClaimReservationInput = z.infer<typeof claimReservationSchema>;

export const partnerLeadSchema = z.object({
  business_name: z.string().trim().min(2, "Escribe el nombre del negocio.").max(120),
  contact_name: z.string().trim().min(2, "Escribe el nombre de contacto.").max(120),
  email: z.string().trim().email("Escribe un correo válido."),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  category: z.string().trim().max(40).optional().or(z.literal("")),
  instagram_url: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().max(80).default("Monterrey"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  offered_spots: z.coerce.number().int().min(1).max(500).optional(),
});

export type PartnerLeadInput = z.infer<typeof partnerLeadSchema>;

export const businessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  category: z.enum(["movimiento", "recovery", "food_coffee", "outdoor", "comunidad"]).optional(),
  logo_url: z.string().trim().max(500).optional().or(z.literal("")),
  instagram_url: z.string().trim().max(300).optional().or(z.literal("")),
  maps_url: z.string().trim().max(500).optional().or(z.literal("")),
  contact_name: z.string().trim().max(120).optional().or(z.literal("")),
  contact_email: z.string().trim().email().optional().or(z.literal("")),
  contact_phone: z.string().trim().max(30).optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export type BusinessInput = z.infer<typeof businessSchema>;

export const experienceSchema = z
  .object({
    business_id: z.string().uuid("Selecciona un negocio."),
    title: z.string().trim().min(2).max(160),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
    short_description: z.string().trim().max(240).optional().or(z.literal("")),
    description: z.string().trim().max(4000).optional().or(z.literal("")),
    category: z.enum(["movimiento", "recovery", "food_coffee", "outdoor", "comunidad"]),
    image_url: z.string().trim().max(500).optional().or(z.literal("")),
    location_name: z.string().trim().max(160).optional().or(z.literal("")),
    address: z.string().trim().max(300).optional().or(z.literal("")),
    maps_url: z.string().trim().max(500).optional().or(z.literal("")),
    starts_at: z.string().min(1, "Define la fecha y hora de inicio."),
    ends_at: z.string().min(1, "Define la fecha y hora de fin."),
    claim_opens_at: z.string().min(1, "Define cuándo abren las reservaciones."),
    claim_closes_at: z.string().min(1, "Define cuándo cierran las reservaciones."),
    capacity: z.coerce.number().int().min(1, "El cupo debe ser al menos 1.").max(1000),
    status: z.enum(["draft", "published", "cancelled", "completed"]).default("draft"),
    featured: z.boolean().default(false),
    /**
     * Group allowance. Capped at the MVP ceiling of 3 (decision 4/15) and
     * defaulting to 1, so an experience is individual unless Emmy says
     * otherwise (decision 8) — group size is never the default.
     */
    max_party_size: z.coerce.number().int().min(1).max(3).default(1),
    is_original: z.boolean().default(false),
    /** Validated against lib/social-modes.ts; unknown keys are dropped, not stored. */
    social_modes: z.array(z.string()).default([]),
    post_benefit: z.string().trim().max(300).optional().or(z.literal("")),
    what_is_included: z.array(z.string().trim().max(200)).default([]),
    requirements: z.array(z.string().trim().max(200)).default([]),
    restrictions: z.array(z.string().trim().max(200)).default([]),
    instructions: z.string().trim().max(2000).optional().or(z.literal("")),
  })
  .refine((data) => new Date(data.ends_at) >= new Date(data.starts_at), {
    message: "La fecha de fin debe ser posterior al inicio.",
    path: ["ends_at"],
  })
  .refine((data) => new Date(data.claim_closes_at) <= new Date(data.starts_at), {
    message: "El cierre de reservaciones debe ser antes o igual al inicio.",
    path: ["claim_closes_at"],
  });

export type ExperienceInput = z.infer<typeof experienceSchema>;
