import { Check } from "lucide-react";

export function ConferenceDetailsSection() {
  return (
    <section id="details" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          Conference Details
        </h2>
        <div className="mx-auto mt-10 max-w-5xl rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-center text-base font-semibold text-muted-foreground">
            133rd Fiji Principals Association Conference
          </h3>
          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border text-sm md:grid-cols-2">
            {[
              ["Date", "17th - 19th of September 2025"],
              ["Registration Fee", "FJD $250"],
              [
                "Payment Methods",
                "Crossed cheque or Bank transfer to BSP Samabula (Account: 10065568)",
              ],
              ["Location", "Sheraton Golf and Beach Resort"],
              [
                "Theme",
                "Future Ready Schools - Embracing Digital, Cultural and Global Shift",
              ],
              [
                "Chief Guest",
                "Minister for Education - Hon Aseri Radrodro",
              ],
              ["Official Opening", "6.30 PM on 17th September"],
            ].map(([label, value], i) => (
              <div key={i} className="grid grid-cols-[180px_1fr] items-start gap-4 border-b p-4 last:border-b-0 md:border-r md:last:border-r-0">
                <div className="font-medium text-muted-foreground">{label}</div>
                <div className="text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">What&rsquo;s Included:</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {[
                  "Official Opening Ceremony",
                  "Conference Sessions",
                  "Networking Opportunities",
                  "All Meals Included",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="font-semibold">Contact Information:</h4>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">President:</span>
                  {" "}
                  Mr. Vishnu Deo Sharma (9278360)
                </li>
                <li>
                  <span className="font-medium text-foreground">Secretary:</span>
                  {" "}
                  Mr. Praveen Chand (9088290)
                </li>
                <li>
                  <span className="font-medium text-foreground">Treasurer:</span>
                  {" "}
                  Mr. Pranesh Kumar (9951918)
                </li>
                <li>
                  <span className="font-medium text-foreground">Email:</span>
                  {" "}
                  fiprincipalsassociation@gmail.com
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


