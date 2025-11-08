import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "styles/tailwind.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
