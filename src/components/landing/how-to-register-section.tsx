export function HowToRegisterSection() {
  return (
    <section id="tips" className="bg-muted/30 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
          How to Register
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              step: 1,
              title: "Sign In or Create an Account",
              body:
                "Existing members log in with their credentials or new users create a membership account.",
            },
            {
              step: 2,
              title: "Access the Conference Registration Form",
              body:
                "Select 'Conference Registration' from the side bar and complete the form.",
            },
            {
              step: 3,
              title: "Confirm and Submit Registration",
              body:
                "Preview and submit the registration. Fee must be paid ASAP.",
            },
          ].map(({ step, title, body }, idx) => (
            <div key={idx} className="rounded-xl border bg-card p-6 text-center shadow-sm">
              <div className="mx-auto -mt-10 mb-2 grid size-12 place-items-center rounded-full bg-secondary text-foreground">
                <span className="text-base font-semibold">{step}</span>
              </div>
              <h3 className="mt-2 text-base font-semibold leading-6">{title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


