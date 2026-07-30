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
  /** Companion names, holder excluded. Empty for an individual reservation. */
  companions?: string[];
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
  companions = [],
}: PaseConfirmadoProps) {
  return (
    <EmailShell preview={`Tu pase para ${experienceTitle} está confirmado`}>
      <EmailHeading>Tu pase está confirmado</EmailHeading>
      <Text style={{ color: "#171714" }}>Hola {fullName},</Text>
      <Text style={{ color: "#171714" }}>
        {companions.length > 0 ? (
          <>
            Reservaste <strong>{companions.length + 1} lugares</strong> en <strong>{experienceTitle}</strong> con{" "}
            <strong>{businessName}</strong>. Guarda este correo como tu pase.
          </>
        ) : (
          <>
            Reservaste tu lugar en <strong>{experienceTitle}</strong> con <strong>{businessName}</strong>. Guarda este
            correo como tu pase.
          </>
        )}
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

      {companions.length > 0 && (
        <Section style={{ margin: "8px 0 24px" }}>
          <Text style={{ fontSize: 13, color: "#6D6D65", margin: "0 0 4px" }}>
            Acompañantes registrados ({companions.length + 1} lugares en total)
          </Text>
          {companions.map((name) => (
            <Text key={name} style={{ fontSize: 14, margin: "0 0 2px" }}>
              {name}
            </Text>
          ))}
        </Section>
      )}

      <Text style={{ fontSize: 13, color: "#6D6D65" }}>
        {companions.length > 0
          ? "Recuerda: el pase es personal, consume tu pase semanal y respondes por tu grupo. Si cancelas, se cancelan todos los lugares. Puedes cancelar hasta 12 horas antes desde \"Mi pase\"."
          : "Recuerda: tu pase es personal, no transferible y consume tu pase semanal. Puedes cancelar hasta 12 horas antes de la experiencia desde \"Mi pase\"."}
      </Text>
    </EmailShell>
  );
}
