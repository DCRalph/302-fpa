"use client";

import { montserrat } from "~/components/fonts";
import { api } from "~/trpc/react";
import { type ConferenceWhyJoin } from "~/server/api/routers/home";
import { DynamicIcon } from "~/components/DynamicIcon";
import { Skeleton } from "~/components/ui/skeleton";

export function BenefitsSection() {
  const conferenceWhyJoin = api.home.getConferenceWhyJoin.useQuery();

  const remoteValue = conferenceWhyJoin.data?.value ?? null;
  const parsedWhyJoin = remoteValue ? JSON.parse(remoteValue ?? "[]") as ConferenceWhyJoin[] : null;
  const isLoading = conferenceWhyJoin.isLoading;

  return (
    <section id="benefits" className="border-t bg-muted dark:bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}>
          Why Join Our Conference?
        </h2>
        {isLoading ? (
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex justify-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-6 w-2/3 mx-auto mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          parsedWhyJoin && (
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {parsedWhyJoin.map((card: ConferenceWhyJoin, idx: number) => (
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
          )
        )}
      </div>
    </section>
  );
}


