import { montserrat } from "~/components/fonts";
import { UserPlus, FileText, CreditCard } from "lucide-react";

export function HowToRegisterSection() {
  return (
    <section id="tips" className="bg-muted dark:bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className={`${montserrat.className} text-center text-3xl font-bold tracking-tight md:text-4xl`}>
          How to Register
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              step: 1,
              stepColour: "bg-[#2C4360]",
              icon: UserPlus,
              title: "Sign In or Create an Account",
              body:
                "Existing members log in with their credentials or new users create a membership account.",
            },
            {
              step: 2,
              stepColour: "bg-[#496d8c]",
              icon: FileText,
              title: "Access the Conference Registration Form",
              body:
                "Select 'Conference Registration' from the side bar and complete the form.",
            },
            {
              step: 3,
              stepColour: "bg-[#94815a]",
              icon: CreditCard,
              title: "Confirm and Submit Registration",
              body:
                "Preview and submit the registration. Fee must be paid ASAP.",
            },
          ].map((card, idx) => (
            <div key={idx} className="mt-12 rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className={`mx-auto -mt-16 mb-2 grid size-20 place-items-center rounded-full ${card.stepColour} text-primary-foreground`}>
                <span className="text-4xl font-semibold">{card.step}</span>
              </div>
              <card.icon className="mx-auto mb-8 mt-8 h-10 w-10 text-[#323A55] dark:text-gray-300" />
              <h3 className="mt-2 text-xl font-semibold leading-6">{card.title}</h3>
              <p className="mt-3 text-[16px] text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


