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

interface FeedbackResponseEmailProps {
  userName: string;
  feedbackTitle: string;
  feedbackStatus: "submitted" | "under_review" | "planned" | "in_progress" | "completed" | "declined";
  adminResponse: string;
}

export default function FeedbackResponseEmail({
  userName,
  feedbackTitle,
  feedbackStatus,
  adminResponse,
}: FeedbackResponseEmailProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://teamfinder.littletownlabs.site";

  // Determine styling based on status
  const getStatusInfo = () => {
    switch (feedbackStatus) {
      case "completed":
        return {
          color: "#10b981",
          bgColor: "#d1fae5",
          label: "Completed",
          emoji: "✅",
          heading: "Great News!",
        };
      case "planned":
        return {
          color: "#3b82f6",
          bgColor: "#dbeafe",
          label: "Planned",
          emoji: "📋",
          heading: "Update on Your Feedback",
        };
      case "in_progress":
        return {
          color: "#3b82f6",
          bgColor: "#dbeafe",
          label: "In Progress",
          emoji: "⚙️",
          heading: "We're Working on It!",
        };
      case "declined":
        return {
          color: "#6b7280",
          bgColor: "#f3f4f6",
          label: "Declined",
          emoji: "ℹ️",
          heading: "Response to Your Feedback",
        };
      case "under_review":
        return {
          color: "#f59e0b",
          bgColor: "#fef3c7",
          label: "Under Review",
          emoji: "👀",
          heading: "We're Reviewing Your Feedback",
        };
      default:
        return {
          color: "#f59e0b",
          bgColor: "#fef3c7",
          label: "Updated",
          emoji: "📢",
          heading: "Feedback Update",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Html>
      <Head />
      <Preview>
        Response to your feedback: {feedbackTitle} - {statusInfo.label}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {statusInfo.emoji} {statusInfo.heading}
          </Heading>

          <Text style={text}>Hi {userName},</Text>

          <Text style={text}>We've responded to your feedback submission:</Text>

          {/* Feedback Title & Status */}
          <Section
            style={{
              ...statusBox,
              backgroundColor: statusInfo.bgColor,
              borderLeft: `4px solid ${statusInfo.color}`,
            }}
          >
            <Text style={feedbackTitleText}>{feedbackTitle}</Text>
            <Text
              style={{
                ...statusBadge,
                backgroundColor: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </Text>
          </Section>

          {/* Admin Response */}
          <Section style={responseSection}>
            <Text style={responseHeading}>Admin Response:</Text>
            <Text style={responseText}>{adminResponse}</Text>
          </Section>

          {/* Call to Action */}
          <Button
            style={{
              ...button,
              backgroundColor: statusInfo.color,
            }}
            href={`${appUrl}/feedback`}
          >
            View Your Feedback
          </Button>

          {/* Additional context based on status */}
          {feedbackStatus === "completed" && (
            <Text style={text}>
              Thank you for helping us improve TeamFinder! Your feedback has been implemented.
            </Text>
          )}

          {feedbackStatus === "planned" && (
            <Text style={text}>
              We've added your suggestion to our roadmap. We'll keep you updated on the progress!
            </Text>
          )}

          {feedbackStatus === "in_progress" && (
            <Text style={text}>
              Our team is actively working on your feedback. We'll notify you when it's complete.
            </Text>
          )}

          {feedbackStatus === "declined" && (
            <Text style={text}>
              While we appreciate your feedback, we're unable to implement this suggestion at this
              time. We've explained why in our response above.
            </Text>
          )}

          {feedbackStatus === "under_review" && (
            <Text style={text}>
              We're carefully reviewing your feedback. We'll update you once we've made a decision.
            </Text>
          )}

          <Text style={footer}>
            Thanks for being part of the TeamFinder community!
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

const statusBox = {
  borderRadius: "6px",
  padding: "24px",
  margin: "30px 0",
  textAlign: "center" as const,
};

const feedbackTitleText = {
  color: "#1f2937",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 12px 0",
};

const statusBadge = {
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  borderRadius: "16px",
  padding: "6px 16px",
  display: "inline-block",
  margin: "8px 0 0 0",
};

const responseSection = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "20px",
  margin: "20px 0",
  border: "1px solid #e5e7eb",
};

const responseHeading = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const responseText = {
  color: "#4b5563",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const button = {
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
