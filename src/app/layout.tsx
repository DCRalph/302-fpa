import "~/styles/global.css";

import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../stack";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from 'next-themes'

import { TRPCReactProvider } from "~/trpc/react";
import { EnsureDbUser } from "~/components/ensureDbUser";

export const metadata: Metadata = {
  title: "302 FPA - Conference Registration System",
  description: "Register for the 302 FPA conference and manage your attendance with our comprehensive registration system.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
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

                {children}</TRPCReactProvider>
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
