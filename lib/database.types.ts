export type Category = "movimiento" | "recovery" | "food_coffee" | "outdoor" | "comunidad";

export type ProfileRole = "user" | "admin";

export type ExperienceStatus = "draft" | "published" | "cancelled" | "completed";

export type ReservationStatus = "confirmed" | "cancelled" | "attended" | "no_show";

export type PartnerLeadStatus = "new" | "contacted" | "accepted" | "rejected";

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
