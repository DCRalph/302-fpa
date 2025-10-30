import { api } from "~/trpc/server";
import { type ConferenceDetails } from "~/server/api/routers/home";

import { montserrat } from "../fonts";
import { Check } from "lucide-react";
import Link from "next/link";

export async function ConferenceDetailsSection() {
  const data = await api.home.getConferenceDetails();

  const detailsJson = data?.value ?? "";
  const details = (detailsJson ? JSON.parse(detailsJson) : null) as ConferenceDetails | null;

  return (
    <section id="details" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2
          className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}
        >
          Conference Details
        </h2>
        <div className="bg-card mx-auto mt-12 max-w-5xl rounded-xl border p-8 shadow-sm">
          {details ? (
            <>
              <h3 className="text-primary text-center text-2xl font-semibold">
                {details.conferenceTitle}
              </h3>
              <div className="mt-8 grid gap-px overflow-hidden rounded-lg border text-[16px] shadow-md md:grid-cols-1 overflow-x-auto">
                {details.rows.map(({ label, value }, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[180px_1fr] items-start gap-4 border-b p-4 last:border-b-0 md:border-r md:last:border-r-0"
                  >
                    <div className="text-foreground font-bold">{label}</div>
                    <div className="text-foreground w-75 sm:w-full text-wrap">{value}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-primary text-xl font-semibold mb-4">
                No Active Conference
              </h3>
              <p className="text-muted-foreground">
                There is currently no active conference. Please check back later for updates.
              </p>
            </div>
          )}

          {details && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-4 shadow-md">
                <h3 className="font-bold">What&rsquo;s Included:</h3>
                <ul className="text-foreground mt-3 space-y-2 text-sm">
                  {(details?.included ?? []).map((item, idx) => (
                    <li key={idx} className="mt-0.5 flex items-center gap-2">
                      <Check className="size-6 text-green-700" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border p-4 shadow-md">
                <h3 className="font-bold">Contact Information:</h3>
                <ul className="text-foreground mt-3 space-y-2 text-sm">
                  {(details?.contacts ?? []).length > 0 ? (
                    <ul className="text-foreground mt-3 space-y-2 text-sm">
                      {(details?.contacts ?? []).map((c, idx) => (
                        <li key={idx}>
                          <span className="text-foreground font-bold">{c.role}:</span>{" "}
                          {c.email ? (
                            <Link
                              target="_blank"
                              href={`mailto:${c.email}`}
                              className="text-blue-500 underline hover:text-blue-800"
                            >
                              {c.email}
                            </Link>
                          ) : (
                            <>
                              {c.name}
                              {c.phone ? ` (${c.phone})` : ""}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground mt-3 text-sm">
                      No contact information available.
                    </p>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
