import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "styles/tailwind.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster position="top-right" richColors />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
