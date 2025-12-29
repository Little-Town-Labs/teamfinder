import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { FeatureFlags, isSettingEnabled } from "@/lib/settings";
import { ThemeProvider } from "@/components/ThemeProvider";
import { themeScript } from "@/lib/theme-script";
import "styles/tailwind.css";

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
