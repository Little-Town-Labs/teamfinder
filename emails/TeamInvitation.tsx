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

interface TeamInvitationEmailProps {
  playerName: string;
  teamName: string;
  captainName: string;
  invitationId: string;
}

export default function TeamInvitationEmail({
  playerName,
  teamName,
  captainName,
  invitationId,
}: TeamInvitationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://teamfinder.littletownlabs.site";

  return (
    <Html>
      <Head />
      <Preview>
        {captainName} has invited you to join {teamName}!
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎳 You've Been Invited!</Heading>

          <Text style={text}>Hi {playerName},</Text>

          <Section style={invitationBox}>
            <Text style={invitationText}>
              <strong>{captainName}</strong> has invited you to join
            </Text>
            <Text style={teamNameText}>{teamName}</Text>
          </Section>

          <Text style={text}>
            This is an exciting opportunity to join a team and compete in bowling leagues! Review
            the team details and decide if it's the right fit for you.
          </Text>

          <Button style={button} href={`${appUrl}/invitations/${invitationId}`}>
            View Invitation & Respond
          </Button>

          <Text style={footnote}>
            This invitation will remain active for 14 days. You can accept or decline at any time.
          </Text>

          <Text style={footer}>
            Good luck!
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

const invitationBox = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #2563eb",
  borderRadius: "6px",
  padding: "24px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const invitationText = {
  color: "#1f2937",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const teamNameText = {
  color: "#2563eb",
  fontSize: "24px",
  fontWeight: "700",
  margin: "12px 0 0 0",
};

const button = {
  backgroundColor: "#2563eb",
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

const footnote = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "20px 0",
  padding: "16px",
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "40px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};
