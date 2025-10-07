import { montserrat } from "~/components/fonts";
import { api } from "~/trpc/server";
import { type ConferenceWhyJoin } from "~/server/api/routers/home";
import { DynamicIcon } from "~/components/DynamicIcon";
import EditWhyJoin from "~/components/landing/admin/editWhyJoin";

export async function BenefitsSection() {
  const { dbUser } = await api.auth.me();
  const conferenceWhyJoin = await api.home.getConferenceWhyJoin();
  const isAdmin = dbUser?.role === "ADMIN";

  const whyJoin = conferenceWhyJoin?.value;
  const whyJoinArray = JSON.parse(whyJoin ?? "[]") as ConferenceWhyJoin[];

  return (
    <section id="benefits" className="border-t bg-muted dark:bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}>
          Why Join Our Conference?
        </h2>
        {isAdmin && (
          <div className="mt-4 flex justify-end">
            <EditWhyJoin whyJoinItems={whyJoinArray} />
          </div>
        )}
        {whyJoinArray && (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyJoinArray.map((card: ConferenceWhyJoin, idx: number) => (
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


