// page-level imports are now composed from section components
import { NavBar } from "~/components/landing/nav-bar";
import { HeroSection } from "~/components/landing/hero-section";
import { BenefitsSection } from "~/components/landing/benefits-section";
import { ConferenceDetailsSection } from "~/components/landing/conference-details-section";
import { HowToRegisterSection } from "~/components/landing/how-to-register-section";
import { SystemFeaturesSection } from "~/components/landing/system-features-section";
import { SiteFooter } from "~/components/landing/site-footer";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "302 FPA - Conference Registration System",
  description: "Register for the 302 FPA conference and manage your attendance with our comprehensive registration system.",
};


export default async function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <NavBar />
      <HeroSection />
      <BenefitsSection />
      <ConferenceDetailsSection />
      <HowToRegisterSection />
      <SystemFeaturesSection />
      <SiteFooter />
    </main>
  );
}
