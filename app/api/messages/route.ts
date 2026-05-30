import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { messages, users } from "@/drizzle/schema"
import { db } from "@/lib/db"
import { emailTemplates, resend } from "@/lib/email"

const messageSchema = z.object({
  recipientId: z.string().uuid(),
  subject: z.string().optional(),
  content: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = messageSchema.parse(await request.json())

    // Get sender (current user)
    const sender = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    })

    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get recipient
    const recipient = await db.query.users.findFirst({
      where: eq(users.id, body.recipientId),
    })

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 })
    }

    // Can't send message to yourself
    if (sender.id === recipient.id) {
      return NextResponse.json({ error: "Cannot send message to yourself" }, { status: 400 })
    }

    // Create message
    const [message] = await db
      .insert(messages)
      .values({
        senderId: sender.id,
        recipientId: body.recipientId,
        subject: body.subject || null,
        content: body.content,
      })
      .returning()

    // Send email notification
    try {
      const messagePreview = body.content.length > 100 ? body.content.substring(0, 100) + "..." : body.content

      const emailData = await emailTemplates.messageNotification(
        recipient.email,
        recipient.firstName || "Bowler",
        sender.firstName || "TeamFinder User",
        message!.id,
        messagePreview
      )
      await resend.emails.send(emailData)
    } catch (emailError) {
      console.error("Failed to send message notification:", emailError)
      // Don't fail the message if email fails
    }

    return NextResponse.json({ success: true, message }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
