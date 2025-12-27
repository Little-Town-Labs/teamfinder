import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { FeatureFlags, isSettingEnabled } from "@/lib/settings";
import "styles/tailwind.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieBannerEnabled = await isSettingEnabled(FeatureFlags.COOKIE_BANNER_ENABLED);

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          {/* GetTerms Cookie Consent Platform */}
          {cookieBannerEnabled && (
            <script
              type="text/javascript"
              src="https://gettermscmp.com/cookie-consent/embed/a4180b19-03f5-42c1-a966-ea8274a2944e/en-us?auto=true"
              async
            />
          )}
        </head>
        <body>
          {children}
          <Toaster position="top-right" richColors />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
