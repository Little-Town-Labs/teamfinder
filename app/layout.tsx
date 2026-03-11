import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FeatureFlags, isSettingEnabled } from "@/lib/settings";
import { themeScript } from "@/lib/theme-script";
import "styles/tailwind.css";

export const metadata: Metadata = {
  title: {
    default: "TeamFinder - Teams Need Players. Players Need Teams.",
    template: "%s | TeamFinder",
  },
  description:
    "Connect bowlers with teams. Find teammates, recruit players, and join the bowling community.",
  openGraph: {
    title: "TeamFinder",
    description:
      "The premier platform for bowling team matchmaking. Find your perfect team or recruit talented bowlers.",
    url: "https://teamfinder.vercel.app/",
    siteName: "TeamFinder",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieBannerEnabled = await isSettingEnabled(FeatureFlags.COOKIE_BANNER_ENABLED);

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Theme script - runs immediately to prevent flash */}
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />

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
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors />
            <SpeedInsights />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
