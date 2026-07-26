import { Text, Button, Section } from "@react-email/components";
import { EmailShell, EmailHeading, EmailField } from "./components";

export interface PaseConfirmadoProps {
  fullName: string;
  experienceTitle: string;
  businessName: string;
  dateLabel: string;
  timeLabel: string;
  locationName: string;
  mapsUrl?: string | null;
  folio: string;
  passUrl: string;
}

export default function PaseConfirmado({
  fullName,
  experienceTitle,
  businessName,
  dateLabel,
  timeLabel,
  locationName,
  mapsUrl,
  folio,
  passUrl,
}: PaseConfirmadoProps) {
  return (
    <EmailShell preview={`Tu pase para ${experienceTitle} está confirmado`}>
      <EmailHeading>Tu pase está confirmado</EmailHeading>
      <Text style={{ color: "#171714" }}>Hola {fullName},</Text>
      <Text style={{ color: "#171714" }}>
        Reservaste tu lugar en <strong>{experienceTitle}</strong> con <strong>{businessName}</strong>. Guarda este correo
        como tu pase.
      </Text>

      <Section style={{ margin: "20px 0" }}>
        <EmailField label="Folio" value={folio} />
        <EmailField label="Fecha" value={dateLabel} />
        <EmailField label="Hora" value={timeLabel} />
        <EmailField label="Lugar" value={locationName} />
      </Section>

      {mapsUrl && (
        <Text style={{ fontSize: 14 }}>
          <a href={mapsUrl} style={{ color: "#FF7A3D" }}>
            Ver ubicación en Google Maps →
          </a>
        </Text>
      )}

      <Section style={{ margin: "24px 0" }}>
        <Button
          href={passUrl}
          style={{ backgroundColor: "#171714", color: "#FFFDFC", padding: "12px 24px", borderRadius: 999, fontSize: 14 }}
        >
          Ver mi pase
        </Button>
      </Section>

      <Text style={{ fontSize: 13, color: "#6D6D65" }}>
        Recuerda: tu pase es personal, no transferible y consume tu pase semanal. Puedes cancelar hasta 12 horas antes de
        la experiencia desde &quot;Mi pase&quot;.
      </Text>
    </EmailShell>
  );
}
