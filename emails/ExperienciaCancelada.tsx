import { Text, Section } from "@react-email/components";
import { EmailShell, EmailHeading, EmailField } from "./components";

export interface ExperienciaCanceladaProps {
  fullName: string;
  experienceTitle: string;
  dateLabel: string;
  folio: string;
}

export default function ExperienciaCancelada({ fullName, experienceTitle, dateLabel, folio }: ExperienciaCanceladaProps) {
  return (
    <EmailShell preview={`${experienceTitle} fue cancelada`}>
      <EmailHeading>La experiencia fue cancelada</EmailHeading>
      <Text style={{ color: "#171714" }}>Hola {fullName},</Text>
      <Text style={{ color: "#171714" }}>
        Lamentamos informarte que <strong>{experienceTitle}</strong> fue cancelada por el equipo de Sunny Project. Tu
        pase semanal quedó disponible para que reserves otra experiencia.
      </Text>
      <Section style={{ margin: "20px 0" }}>
        <EmailField label="Folio cancelado" value={folio} />
        <EmailField label="Fecha original" value={dateLabel} />
      </Section>
      <Text style={{ fontSize: 13, color: "#6D6D65" }}>Encuentra otra experiencia disponible en sunnyproject.mx/experiencias.</Text>
    </EmailShell>
  );
}
