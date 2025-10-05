import "~/styles/globals.css";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { type Metadata } from "next";
import { nunito } from "~/components/fonts";
import { ThemeProvider } from 'next-themes'

import { Toaster } from "~/components/ui/sonner"

import NextTopLoader from "nextjs-toploader";

import { TRPCReactProvider } from "~/trpc/react";
import { EnsureDbUser } from "~/lib/ensureDbUser";
import { AuthProvider } from "~/lib/auth";

export const metadata: Metadata = {
  title: "FPA Conference Registration",
  description: "Register for the FPA conference and manage your attendance with our comprehensive registration system.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${nunito.className} scroll-smooth`} suppressHydrationWarning>
      <body>
        <StackProvider app={stackServerApp}>
          <StackTheme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              themes={["light", "dark"]}
            >
              <TRPCReactProvider>
                <EnsureDbUser />
                <AuthProvider>
                  <NextTopLoader />
                  <Toaster position="top-right" richColors />
                  {children}
                </AuthProvider>
              </TRPCReactProvider>
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
