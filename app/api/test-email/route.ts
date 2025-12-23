import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { emailTemplates, resend } from "@/lib/email";

/**
 * Test endpoint to verify Resend integration
 * DELETE THIS FILE after verifying email works
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { to: string; firstName: string };

    if (!body.to || !body.firstName) {
      return NextResponse.json(
        { error: "Missing required fields: to, firstName" },
        { status: 400 },
      );
    }

    // Send test welcome email
    const emailData = emailTemplates.welcome(body.to, body.firstName);

    const result = await resend.emails.send(emailData);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      emailId: result.data?.id,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
