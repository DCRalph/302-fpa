import { montserrat } from "~/components/fonts";
import { api } from "~/trpc/react";
import { type WhyJoin } from "~/server/api/routers/home";
import { DynamicIcon } from "~/components/DynamicIcon";



export function BenefitsSection() {

  const { data: conferenceWhyJoin } = api.home.getConferenceWhyJoin.useQuery();

  const whyJoin = conferenceWhyJoin?.value
  const whyJoinArray = JSON.parse(whyJoin ?? "[]") as WhyJoin[]

  return (
    <section id="benefits" className="border-t bg-muted dark:bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}>
          Why Join Our Conference?
        </h2>
        {whyJoinArray && (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyJoinArray.map((card: WhyJoin, idx: number) => (
              <div key={idx} className="rounded-xl border bg-card p-6 shadow-sm">
                <DynamicIcon type={card.icon.type} name={card.icon.name} props={card.icon.props} />
                <h3 className="text-center text-xl font-semibold leading-6">
                  {card.title}
                </h3>
                <p className="mt-3 text-center text-[16px] text-muted-foreground">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


