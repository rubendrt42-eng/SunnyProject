import { Text, Section } from "@react-email/components";
import { EmailShell, EmailHeading, EmailField } from "./components";

export interface PaseCanceladoProps {
  fullName: string;
  experienceTitle: string;
  dateLabel: string;
  folio: string;
}

export default function PaseCancelado({ fullName, experienceTitle, dateLabel, folio }: PaseCanceladoProps) {
  return (
    <EmailShell preview={`Cancelaste tu pase para ${experienceTitle}`}>
      <EmailHeading>Cancelaste tu pase</EmailHeading>
      <Text style={{ color: "#171714" }}>Hola {fullName},</Text>
      <Text style={{ color: "#171714" }}>
        Confirmamos la cancelación de tu reservación para <strong>{experienceTitle}</strong>. Recuperaste tu pase
        semanal y puedes usarlo en otra experiencia disponible esta semana.
      </Text>
      <Section style={{ margin: "20px 0" }}>
        <EmailField label="Folio cancelado" value={folio} />
        <EmailField label="Fecha original" value={dateLabel} />
      </Section>
    </EmailShell>
  );
}
