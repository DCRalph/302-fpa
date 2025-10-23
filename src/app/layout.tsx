import "~/styles/globals.css";

import { type Metadata } from "next";
import { nunito } from "~/components/fonts";
import { ThemeProvider } from 'next-themes'

import { Toaster } from "~/components/ui/sonner"

import NextTopLoader from "nextjs-toploader";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/hooks/useAuth";

export const metadata: Metadata = {
  title: "FPA Conference Registration",
  description: "Register for the FPA conference and manage your attendance with our comprehensive registration system.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${nunito.className} scroll-smooth antialiased`} suppressHydrationWarning>
      <body className="w-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark"]}
        >
          <TRPCReactProvider>
            <AuthProvider>
              <NextTopLoader showSpinner={false} />
              <Toaster position="bottom-right" richColors />
              {children}
            </AuthProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
