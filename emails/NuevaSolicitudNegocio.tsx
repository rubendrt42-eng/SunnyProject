import { Text, Section } from "@react-email/components";
import { EmailShell, EmailHeading, EmailField } from "./components";

export interface NuevaSolicitudNegocioProps {
  businessName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  category?: string | null;
  city?: string | null;
  offeredSpots?: number | null;
  message?: string | null;
}

export default function NuevaSolicitudNegocio({
  businessName,
  contactName,
  email,
  phone,
  category,
  city,
  offeredSpots,
  message,
}: NuevaSolicitudNegocioProps) {
  return (
    <EmailShell preview={`Nueva solicitud de negocio: ${businessName}`}>
      <EmailHeading>Nueva solicitud de negocio</EmailHeading>
      <Section style={{ margin: "12px 0" }}>
        <EmailField label="Negocio" value={businessName} />
        <EmailField label="Contacto" value={contactName} />
        <EmailField label="Correo" value={email} />
        {phone && <EmailField label="WhatsApp" value={phone} />}
        {category && <EmailField label="Categoría" value={category} />}
        {city && <EmailField label="Ciudad" value={city} />}
        {typeof offeredSpots === "number" && <EmailField label="Lugares ofrecidos" value={String(offeredSpots)} />}
      </Section>
      {message && (
        <Text style={{ color: "#171714" }}>
          <strong>Mensaje:</strong> {message}
        </Text>
      )}
      <Text style={{ fontSize: 13, color: "#6D6D65" }}>Revisa la solicitud completa en /admin/solicitudes.</Text>
    </EmailShell>
  );
}
