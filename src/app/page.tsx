import { NavBar } from "~/components/nav-bar";
import { HeroSection } from "~/components/landing/hero-section";
import { BenefitsSection } from "~/components/landing/benefits-section";
import { ConferenceDetailsSection } from "~/components/landing/conference-details-section";
import { HowToRegisterSection } from "~/components/landing/how-to-register-section";
import { SystemFeaturesSection } from "~/components/landing/system-features-section";
import { SiteFooter } from "~/components/landing/site-footer";


export default function Home() {


  return (
    <main className="bg-background text-foreground min-h-screen">
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
