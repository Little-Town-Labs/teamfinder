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

interface WelcomeEmailProps {
  firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://teamfinder.littletownlabs.site";

  return (
    <Html>
      <Head />
      <Preview>Welcome to TeamFinder - Find Your Perfect Bowling Team!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎳 Welcome to TeamFinder, {firstName}!</Heading>

          <Text style={text}>
            We're excited to have you join our bowling community. TeamFinder makes it easy to
            connect with teams and players who match your skill level and availability.
          </Text>

          <Section style={section}>
            <Text style={subheading}>What's Next?</Text>
            <Text style={text}>
              • Browse available teams looking for players
              <br />
              • Connect with bowlers in your area
              <br />
              • Manage your team applications
              <br />• Keep your profile updated with your latest stats
            </Text>
          </Section>

          <Button style={button} href={`${appUrl}/dashboard`}>
            Go to Dashboard
          </Button>

          <Text style={text}>
            If you have any questions, feel free to reach out to us at{" "}
            <a href="mailto:support@littletownlabs.site" style={link}>
              support@littletownlabs.site
            </a>
          </Text>

          <Text style={footer}>
            Happy bowling!
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

const subheading = {
  color: "#1f2937",
  fontSize: "18px",
  fontWeight: "600",
  margin: "20px 0 10px",
};

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const section = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "20px",
  margin: "20px 0",
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

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "40px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};
