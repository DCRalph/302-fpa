import { NavBar } from "~/components/nav-bar";
import { HeroSection } from "~/components/landing/hero-section";
import { ConferenceDetailsSection } from "~/components/landing/conference-details-section";
import { HowToRegisterSection } from "~/components/landing/how-to-register-section";
import { SystemFeaturesSection } from "~/components/landing/system-features-section";
import { SiteFooter } from "~/components/site-footer";
import { BenefitsSection } from "~/components/landing/benefits-section";


export default function Home() {
  return (
    <main className="w-screen h-screen overflow-y-scroll">
      <div className="bg-background text-foreground min-h-screen">
        <NavBar />
        <HeroSection />
        <BenefitsSection />
        <ConferenceDetailsSection />
        <HowToRegisterSection />
        <SystemFeaturesSection />
        <SiteFooter />
      </div>
    </main>
  );
}
