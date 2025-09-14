// page-level imports are now composed from section components
import { NavBar } from "~/components/landing/nav-bar";
import { HeroSection } from "~/components/landing/hero-section";
import { BenefitsSection } from "~/components/landing/benefits-section";
import { ConferenceDetailsSection } from "~/components/landing/conference-details-section";
import { HowToRegisterSection } from "~/components/landing/how-to-register-section";
import { SystemFeaturesSection } from "~/components/landing/system-features-section";
import { SiteFooter } from "~/components/landing/site-footer";

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
