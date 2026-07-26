import "server-only";
import { sendEmail } from "@/lib/email/send";
import PaseConfirmado from "@/emails/PaseConfirmado";
import PaseCancelado from "@/emails/PaseCancelado";
import ExperienciaCancelada from "@/emails/ExperienciaCancelada";
import NuevaSolicitudNegocio from "@/emails/NuevaSolicitudNegocio";
import { formatDate, formatTime } from "@/lib/dates";
import { env } from "@/lib/env";
import type { Business, Experience, PartnerLead, Reservation } from "@/lib/database.types";

export async function notifyPassConfirmed(params: {
  toEmail: string;
  fullName: string;
  reservation: Reservation;
  experience: Experience;
  business: Business;
}) {
  const { toEmail, fullName, reservation, experience, business } = params;
  await sendEmail({
    to: toEmail,
    subject: `Tu pase para ${experience.title} está confirmado`,
    react: PaseConfirmado({
      fullName,
      experienceTitle: experience.title,
      businessName: business.name,
      dateLabel: formatDate(experience.starts_at),
      timeLabel: formatTime(experience.starts_at),
      locationName: experience.location_name ?? business.name,
      mapsUrl: experience.maps_url,
      folio: reservation.folio,
      passUrl: `${env.siteUrl}/mi-pase`,
    }),
  });
}

export async function notifyPassCancelledByUser(params: {
  toEmail: string;
  fullName: string;
  reservation: Reservation;
  experience: Experience;
}) {
  const { toEmail, fullName, reservation, experience } = params;
  await sendEmail({
    to: toEmail,
    subject: `Cancelaste tu pase para ${experience.title}`,
    react: PaseCancelado({
      fullName,
      experienceTitle: experience.title,
      dateLabel: formatDate(experience.starts_at),
      folio: reservation.folio,
    }),
  });
}

export async function notifyExperienceCancelledByAdmin(params: {
  toEmail: string;
  fullName: string;
  reservation: Reservation;
  experience: Experience;
}) {
  const { toEmail, fullName, reservation, experience } = params;
  await sendEmail({
    to: toEmail,
    subject: `${experience.title} fue cancelada`,
    react: ExperienciaCancelada({
      fullName,
      experienceTitle: experience.title,
      dateLabel: formatDate(experience.starts_at),
      folio: reservation.folio,
    }),
  });
}

export async function notifyNewPartnerLead(lead: PartnerLead) {
  if (!env.adminEmail) return;
  await sendEmail({
    to: env.adminEmail,
    subject: `Nueva solicitud de negocio: ${lead.business_name}`,
    react: NuevaSolicitudNegocio({
      businessName: lead.business_name,
      contactName: lead.contact_name,
      email: lead.email,
      phone: lead.phone,
      category: lead.category,
      city: lead.city,
      offeredSpots: lead.offered_spots,
      message: lead.message,
    }),
  });
}
