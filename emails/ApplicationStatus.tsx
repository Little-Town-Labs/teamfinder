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

interface ApplicationStatusEmailProps {
  playerName: string;
  teamName: string;
  status: "accepted" | "declined";
}

export default function ApplicationStatusEmail({
  playerName,
  teamName,
  status,
}: ApplicationStatusEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://teamfinder.littletownlabs.site";
  const isAccepted = status === "accepted";

  return (
    <Html>
      <Head />
      <Preview>
        Your application to {teamName} - {isAccepted ? "Accepted" : "Declined"}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {isAccepted ? (
            <>
              <Heading style={h1}>🎉 Congratulations!</Heading>

              <Text style={text}>Hi {playerName},</Text>

              <Section style={acceptedBox}>
                <Text style={statusText}>Your application has been accepted!</Text>
                <Text style={teamNameText}>{teamName}</Text>
              </Section>

              <Text style={text}>
                You're now officially part of the team! The captain will reach out soon with details
                about practice schedules, league information, and next steps.
              </Text>

              <Section style={nextStepsSection}>
                <Text style={subheading}>What's Next:</Text>
                <Text style={bulletList}>
                  • Check your team dashboard for updates
                  <br />
                  • Connect with your teammates
                  <br />
                  • Review league schedules and bowling center info
                  <br />• Keep your profile and stats up to date
                </Text>
              </Section>

              <Button style={acceptedButton} href={`${appUrl}/teams`}>
                View Your Teams
              </Button>

              <Text style={text}>
                Welcome to {teamName}! We wish you the best of luck this season.
              </Text>
            </>
          ) : (
            <>
              <Heading style={h1}>Application Update</Heading>

              <Text style={text}>Hi {playerName},</Text>

              <Section style={declinedBox}>
                <Text style={statusText}>
                  Thank you for your interest in <strong>{teamName}</strong>.
                </Text>
                <Text style={declinedText}>
                  Unfortunately, your application was not accepted at this time.
                </Text>
              </Section>

              <Text style={text}>
                Don't be discouraged! There are many great teams on TeamFinder looking for talented
                bowlers like you. Keep browsing and applying to find the perfect fit.
              </Text>

              <Button style={declinedButton} href={`${appUrl}/teams/browse`}>
                Browse More Teams
              </Button>

              <Text style={text}>
                You can also update your profile to showcase your skills and make yourself more
                discoverable to teams.
              </Text>
            </>
          )}

          <Text style={footer}>
            {isAccepted ? "Happy bowling!" : "Best of luck in your search!"}
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

const acceptedBox = {
  backgroundColor: "#d1fae5",
  borderLeft: "4px solid #10b981",
  borderRadius: "6px",
  padding: "24px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const declinedBox = {
  backgroundColor: "#f3f4f6",
  borderLeft: "4px solid #6b7280",
  borderRadius: "6px",
  padding: "24px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const statusText = {
  color: "#1f2937",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 12px 0",
};

const teamNameText = {
  color: "#059669",
  fontSize: "24px",
  fontWeight: "700",
  margin: "12px 0 0 0",
};

const declinedText = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "12px 0 0 0",
};

const nextStepsSection = {
  backgroundColor: "#f0fdf4",
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

const acceptedButton = {
  backgroundColor: "#10b981",
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

const declinedButton = {
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

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "40px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};
