export type Category = "movimiento" | "recovery" | "food_coffee" | "outdoor" | "comunidad";

export type ProfileRole = "user" | "admin";

export type ExperienceStatus = "draft" | "published" | "cancelled" | "completed";

export type ReservationStatus = "confirmed" | "cancelled" | "attended" | "no_show";

/**
 * `meeting` and `converted` are added by
 * 20260201000000_experience_presentation.sql (brief §35). Until that
 * migration runs the database's CHECK constraint only permits the first
 * four, so `partnerLeadStatusOptions()` in lib/partner-leads.ts is what the
 * admin UI offers — it never presents a value the database would reject.
 */
export type PartnerLeadStatus = "new" | "contacted" | "meeting" | "accepted" | "rejected" | "converted";

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  interests: string[];
  role: ProfileRole;
  adult_confirmed_at: string | null;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type Business = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: Category | null;
  logo_url: string | null;
  instagram_url: string | null;
  maps_url: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  /**
   * Added by 20260201000000_experience_presentation.sql. Optional on
   * purpose: that migration is prepared but not applied, so against the
   * current database this field arrives `undefined`. Read it through
   * `featuredAsPartner()` in lib/experience-flags.ts, never directly.
   *
   * An active business does NOT become a public ally automatically —
   * decision 9 in SUNNY_MVP_1_1_DECISIONS.md requires this explicit flag.
   */
  featured_as_partner?: boolean | null;
}

export type Experience = {
  id: string;
  business_id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category: Category;
  image_url: string | null;
  location_name: string | null;
  address: string | null;
  maps_url: string | null;
  starts_at: string;
  ends_at: string;
  claim_opens_at: string;
  claim_closes_at: string;
  capacity: number;
  status: ExperienceStatus;
  featured: boolean;
  what_is_included: string[];
  requirements: string[];
  restrictions: string[];
  instructions: string | null;
  created_at: string;
  updated_at: string;

  /*
   * Everything below is added by the two MVP 1.1 migrations, both of which
   * are prepared but NOT applied (SUNNY_COMPANIONS_MIGRATION_PLAN.md).
   * They are optional so the app compiles and behaves correctly against
   * both the current schema and the migrated one — every read goes through
   * lib/experience-flags.ts, which supplies the pre-migration fallback.
   */

  /** 20260201000000 — curated by Sunny itself rather than by a partner space. */
  is_original?: boolean | null;
  /** 20260201000000 — admin-chosen social modality keys; see lib/social-modes.ts. */
  social_modes?: string[] | null;
  /** 20260201000000 — set when Emmy archives an experience; archived rows are kept, never deleted. */
  archived_at?: string | null;
  /** 20260201000100 — people per reservation, 1..3. Defaults to 1: group size is always opt-in. */
  max_party_size?: number | null;
  /** 20260201000000 — optional post-experience perk offered by the space. */
  post_benefit?: string | null;
}

export type Reservation = {
  id: string;
  experience_id: string;
  user_id: string;
  folio: string;
  week_start: string;
  status: ReservationStatus;
  source: string | null;
  reserved_at: string;
  cancelled_at: string | null;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
  /**
   * 20260201000100 — how many people this one reservation covers (holder
   * included), 1..3. Optional until the migration lands; read it through
   * `partySizeOf()` so existing rows count as 1.
   */
  party_size?: number | null;
}

/**
 * 20260201000100. Companions are stored relationally (decision 1 in
 * SUNNY_MVP_1_1_DECISIONS.md), captured at reservation time, with no
 * post-hoc editing in the MVP. They need no account and consume no pass of
 * their own.
 */
export type ReservationCompanion = {
  id: string;
  reservation_id: string;
  full_name: string;
  email: string | null;
  status: ReservationStatus;
  created_at: string;
}

export type PartnerLead = {
  id: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  category: string | null;
  instagram_url: string | null;
  city: string | null;
  message: string | null;
  offered_spots: number | null;
  status: PartnerLeadStatus;
  created_at: string;
  updated_at: string;
  /** 20260201000000 — Emmy's private notes on a lead. Never rendered publicly. */
  internal_notes?: string | null;
  /** 20260201000000 — set when a lead is turned into a real business row. */
  converted_business_id?: string | null;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      businesses: { Row: Business; Insert: Partial<Business>; Update: Partial<Business>; Relationships: [] };
      experiences: { Row: Experience; Insert: Partial<Experience>; Update: Partial<Experience>; Relationships: [] };
      reservations: {
        Row: Reservation;
        Insert: Partial<Reservation>;
        Update: Partial<Reservation>;
        Relationships: [];
      };
      partner_leads: {
        Row: PartnerLead;
        Insert: Partial<PartnerLead>;
        Update: Partial<PartnerLead>;
        Relationships: [];
      };
      reservation_companions: {
        Row: ReservationCompanion;
        Insert: Partial<ReservationCompanion>;
        Update: Partial<ReservationCompanion>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      claim_reservation: {
        Args: { p_experience_id: string; p_source?: string | null };
        Returns: Reservation;
      };
      cancel_reservation: {
        Args: { p_reservation_id: string };
        Returns: Reservation;
      };
      admin_cancel_reservation: {
        Args: { p_reservation_id: string };
        Returns: Reservation;
      };
      admin_cancel_experience: {
        Args: { p_experience_id: string };
        Returns: Reservation[];
      };
      admin_set_attendance: {
        Args: { p_reservation_id: string; p_status: "attended" | "no_show" };
        Returns: Reservation;
      };
      reserved_counts_for_experiences: {
        Args: { p_experience_ids: string[] };
        Returns: { experience_id: string; reserved_count: number }[];
      };
    };
  };
}
