import { Check } from "lucide-react";
import { montserrat } from "~/components/fonts";

export function SystemFeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}>
          System Features
        </h2>
        <div className="mt-12 grid md:flex md:justify-between gap-10">
          {[
            {
              heading: "Current",
              items: [
                "Member Registration",
                "Conference Registration",
                "Admin Dashboard",
                "Community Blog",
                "File Upload and Sharing",
                "Automated Email Notifications",
                "Profile Customisation",
              ],
            },
            {
              heading: "Planned",
              items: ["Live Conference Streaming", "Election Management"],
            },
            {
              heading: "Future",
              items: ["Automation"],
            },
          ].map(({ heading, items }, idx) => (
            <div key={idx}>
              <h3 className="text-2xl font-semibold">{heading}</h3>
              <ul className="mt-4 space-y-2 text-lg text-muted-foreground">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="mt-0.5 size-6 text-[#198754]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


