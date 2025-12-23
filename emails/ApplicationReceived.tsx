import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ApplicationReceivedEmailProps {
  captainName: string;
  playerName: string;
  teamName: string;
  applicationId: string;
}

export default function ApplicationReceivedEmail({
  captainName,
  playerName,
  teamName,
  applicationId,
}: ApplicationReceivedEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://teamfinder.littletownlabs.site";

  return (
    <Html>
      <Head />
      <Preview>
        New application for {teamName} from {playerName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📩 New Team Application</Heading>

          <Text style={text}>Hi {captainName},</Text>

          <Section style={applicationBox}>
            <Text style={applicationText}>
              <strong>{playerName}</strong> has applied to join
            </Text>
            <Text style={teamNameText}>{teamName}</Text>
          </Section>

          <Text style={text}>
            Take a moment to review their bowling profile, stats, and preferences. You can accept
            or decline their application from your team dashboard.
          </Text>

          <Section style={actionSection}>
            <Text style={subheading}>What to Review:</Text>
            <Text style={bulletList}>
              • USBC Member ID and verification status
              <br />
              • Current average and high scores
              <br />
              • Bowling experience and availability
              <br />• Team preferences and competition level
            </Text>
          </Section>

          <Button style={button} href={`${appUrl}/teams/applications/${applicationId}`}>
            Review Application
          </Button>

          <Text style={footer}>
            Best of luck building your team!
            <br />
            The TeamFinder Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "40px auto",
  padding: "20px",
  maxWidth: "600px",
};

const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "bold",
  margin: "30px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const applicationBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "6px",
  padding: "24px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const applicationText = {
  color: "#1f2937",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const teamNameText = {
  color: "#d97706",
  fontSize: "24px",
  fontWeight: "700",
  margin: "12px 0 0 0",
};

const actionSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "20px",
  margin: "20px 0",
};

const subheading = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const bulletList = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
};

const button = {
  backgroundColor: "#f59e0b",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 20px",
  margin: "30px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "40px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};
