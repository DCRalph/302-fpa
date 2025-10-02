"use client";

import { use, useEffect } from "react";

// page-level imports are now composed from section components
import { NavBar } from "~/components/landing/nav-bar";
import { HeroSection } from "~/components/landing/hero-section";
import { BenefitsSection } from "~/components/landing/benefits-section";
import { ConferenceDetailsSection } from "~/components/landing/conference-details-section";
import { HowToRegisterSection } from "~/components/landing/how-to-register-section";
import { SystemFeaturesSection } from "~/components/landing/system-features-section";
import { SiteFooter } from "~/components/landing/site-footer";

export default function Home() {
  // Scroll to section if URL has a hash (e.g., #benefits)
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1); // Renove the '#' character
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, []);

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
