export function BenefitsSection() {
  return (
    <section id="benefits" className="border-t bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          Why Join Our Conference?
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Professional Development and Leadership Training",
              body:
                "Access to expert-led sessions on school leadership, management, and innovation.",
              iconBg:
                "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
            },
            {
              title: "Networking & Peer Collaboration",
              body:
                "Opportunities to connect with fellow principals, share experiences, and build support systems.",
              iconBg:
                "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
            },
            {
              title: "Sharing Innovations and Best Practices",
              body:
                "Platforms to present and learn from impactful school-based programmes and ideas.",
              iconBg:
                "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
            },
            {
              title: "Policy Alignment and National Priorities",
              body:
                "Insight into national education strategies and alignment with government expectations.",
              iconBg:
                "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
            },
          ].map((card, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className={`mx-auto mb-6 grid size-12 place-items-center rounded-full ${card.iconBg}`}>★</div>
              <h3 className="text-center text-lg font-semibold leading-6">
                {card.title}
              </h3>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


