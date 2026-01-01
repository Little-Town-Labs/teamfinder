import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { Footer } from "@/components/Footer/Footer";
import { Header } from "@/components/Header/Header";
import FeedbackPageClient from "./FeedbackPageClient";

export default async function FeedbackPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/sign-in?redirect_url=/feedback");
  }

  return (
    <>
      <Header />
      <FeedbackPageClient />
      <Footer />
    </>
  );
}
