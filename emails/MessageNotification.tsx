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

interface MessageNotificationEmailProps {
  recipientName: string;
  senderName: string;
  messageId: string;
  messagePreview?: string;
}

export default function MessageNotificationEmail({
  recipientName,
  senderName,
  messageId,
  messagePreview,
}: MessageNotificationEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://teamfinder.littletownlabs.site";

  return (
    <Html>
      <Head />
      <Preview>New message from {senderName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>💬 New Message</Heading>

          <Text style={text}>Hi {recipientName},</Text>

          <Section style={messageBox}>
            <Text style={senderText}>You have a new message from</Text>
            <Text style={senderNameText}>{senderName}</Text>
            {messagePreview && (
              <Section style={previewSection}>
                <Text style={previewText}>"{messagePreview}"</Text>
              </Section>
            )}
          </Section>

          <Text style={text}>
            Click the button below to read the full message and reply directly on TeamFinder.
          </Text>

          <Button style={button} href={`${appUrl}/messages/${messageId}`}>
            Read & Reply
          </Button>

          <Text style={footnote}>
            💡 <strong>Tip:</strong> Keep your conversations on TeamFinder to maintain a record of
            all communications with teams and players.
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

const text = {
  color: "#4b5563",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const messageBox = {
  backgroundColor: "#ede9fe",
  borderLeft: "4px solid #8b5cf6",
  borderRadius: "6px",
  padding: "24px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const senderText = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 8px 0",
};

const senderNameText = {
  color: "#7c3aed",
  fontSize: "22px",
  fontWeight: "700",
  margin: "8px 0 0 0",
};

const previewSection = {
  backgroundColor: "#f5f3ff",
  borderRadius: "4px",
  padding: "16px",
  margin: "20px 0 0 0",
};

const previewText = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  fontStyle: "italic" as const,
  margin: "0",
  textAlign: "left" as const,
};

const button = {
  backgroundColor: "#8b5cf6",
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
  backgroundColor: "#fef3c7",
  borderRadius: "6px",
  borderLeft: "3px solid #f59e0b",
};

const footer = {
  color: "#6b7280",
  fontSize: "14px",
  lineHeight: "24px",
  marginTop: "40px",
  borderTop: "1px solid #e5e7eb",
  paddingTop: "20px",
};
