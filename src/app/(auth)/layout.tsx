import React from "react";
import { NavBar } from "~/components/nav-bar";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="bg-background text-foreground min-h-screen md:fixed w-full"
      style={{
        backgroundImage: "url('/images/auth-background.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="fixed inset-0 bg-black/50"></div>

      <div className="relative z-10">
        <NavBar />
        {children}
      </div>
    </main>
  );
}

