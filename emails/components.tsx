import { Body, Container, Head, Html, Preview, Section, Text, Hr, Link, Heading } from "@react-email/components";
import type { ReactNode } from "react";

export function EmailShell({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#F4F1E8", fontFamily: "Helvetica, Arial, sans-serif", padding: "24px 0" }}>
        <Container style={{ backgroundColor: "#FFFDFC", borderRadius: 16, padding: "32px", maxWidth: 480 }}>
          <Text style={{ fontSize: 20, fontStyle: "italic", margin: 0, color: "#171714" }}>Sunny Project</Text>
          <Hr style={{ borderColor: "#17171420", margin: "20px 0" }} />
          {children}
          <Hr style={{ borderColor: "#17171420", margin: "24px 0 12px" }} />
          <Text style={{ fontSize: 12, color: "#6D6D65" }}>
            Sunny Project · Monterrey ·{" "}
            <Link href="https://sunnyproject.mx" style={{ color: "#6D6D65" }}>
              sunnyproject.mx
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return <Heading style={{ fontSize: 22, margin: "0 0 12px", color: "#171714" }}>{children}</Heading>;
}

export function EmailField({ label, value }: { label: string; value: string }) {
  return (
    <Section style={{ margin: "4px 0" }}>
      <Text style={{ margin: 0, fontSize: 13, color: "#6D6D65" }}>{label}</Text>
      <Text style={{ margin: "0 0 8px", fontSize: 15, color: "#171714", fontWeight: 600 }}>{value}</Text>
    </Section>
  );
}
