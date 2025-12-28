import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import FeedbackPageClient from "./FeedbackPageClient";

export default async function FeedbackPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/feedback");
  }

  return <FeedbackPageClient />;
}
