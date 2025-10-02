import { Check } from "lucide-react";
import { montserrat } from "../fonts";
import Link from "next/link";

export function ConferenceDetailsSection() {
  return (
    <section id="details" className="bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2
          className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}
        >
          Conference Details
        </h2>
        <div className="bg-card mx-auto mt-12 max-w-5xl rounded-xl border p-8 shadow-sm">
          <h3 className="text-primary text-center text-2xl font-semibold">
            133rd Fiji Principals Association Conference
          </h3>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border text-[16px] shadow-md md:grid-cols-1">
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
              ["Chief Guest", "Minister for Education - Hon Aseri Radrodro"],
              ["Official Opening", "6.30 PM on 17th September"],
            ].map(([label, value], i) => (
              <div
                key={i}
                className="grid grid-cols-[180px_1fr] items-start gap-4 border-b p-4 last:border-b-0 md:border-r md:last:border-r-0"
              >
                <div className="text-foreground font-bold">{label}</div>
                <div className="text-foreground">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-4 shadow-md">
              <h3 className="font-bold">What&rsquo;s Included:</h3>
              <ul className="text-foreground mt-3 space-y-2 text-sm">
                {[
                  "Official Opening Ceremony",
                  "Conference Sessions",
                  "Networking Opportunities",
                  "All Meals Included",
                ].map((item, idx) => (
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
                <li>
                  <span className="text-foreground font-bold">President:</span>{" "}
                  Mr. Vishnu Deo Sharma (9278360)
                </li>
                <li>
                  <span className="text-foreground font-bold">Secretary:</span>{" "}
                  Mr. Praveen Chand (9088290)
                </li>
                <li>
                  <span className="text-foreground font-bold">Treasurer:</span>{" "}
                  Mr. Pranesh Kumar (9951918)
                </li>
                <li>
                  <span className="text-foreground font-bold">Email:</span>{" "}
                  <Link
                    target="_blank"
                    href="mailto:fijiprincipalassociation@gmail.com"
                    className="text-blue-500 underline hover:text-blue-800"
                  >
                    fijiprincipalsassociation@gmail.com
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
