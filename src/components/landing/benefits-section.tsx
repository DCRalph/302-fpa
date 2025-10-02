import { montserrat } from "~/components/fonts";
import { Users, Network, Lightbulb, Shield } from "lucide-react";

export function BenefitsSection() {
  return (
    <section id="benefits" className="border-t bg-muted dark:bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}>
          Why Join Our Conference?
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              title: "Professional Development and Leadership Training",
              body:
                "Access to expert-led sessions on school leadership, management, and innovation.",
            },
            {
              icon: Network,
              title: "Networking & Peer Collaboration",
              body:
                "Opportunities to connect with fellow principals, share experiences, and build support systems.",
            },
            {
              icon: Lightbulb,
              title: "Sharing Innovations and Best Practices",
              body:
                "Platforms to present and learn from impactful school-based programmes and ideas.",
            },
            {
              icon: Shield,
              title: "Policy Alignment and National Priorities",
              body:
                "Insight into national education strategies and alignment with government expectations.",
            },
          ].map((card, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-6 shadow-sm">
              <card.icon className="mx-auto mb-8 mt-4 h-10 w-10 text-[#667EEA]" />
              <h3 className="text-center text-xl font-semibold leading-6">
                {card.title}
              </h3>
              <p className="mt-3 text-center text-[16px] text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


