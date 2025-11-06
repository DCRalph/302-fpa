import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { NavBar } from "~/components/nav-bar";
import { SiteFooter } from "~/components/site-footer";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { Calendar, MapPin, DollarSign, Users, Mail, Phone, ArrowRight } from "lucide-react";
import { montserrat } from "~/components/fonts";
import { Card } from "~/components/ui/card";

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let conference;
  try {
    conference = await api.home.getConferenceById({ id });
  } catch {
    notFound();
  }

  const isCurrent = conference.isCurrent;

  return (
    <main className="bg-background text-foreground min-h-screen">
      <NavBar />
      <div className="container mx-auto px-4 py-12 md:py-20">
        {isCurrent ? (
          <CurrentConferenceView conference={conference} />
        ) : (
          <PastConferenceView conference={conference} />
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

function CurrentConferenceView({
  conference,
}: {
  conference: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    priceCents: number;
    currency: string;
    registrationStartDate: Date;
    registrationEndDate: Date;
    contacts: Array<{
      id: string;
      name: string;
      fields: unknown;
    }>;
    _count: {
      registrations: number;
    };
  };
}) {
  const contacts = conference.contacts.map((contact) => {
    const fields = contact.fields as { name?: string; phone?: string; email?: string } | null;
    return {
      role: contact.name,
      name: fields?.name ?? undefined,
      phone: fields?.phone ?? undefined,
      email: fields?.email ?? undefined,
    };
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-2 mb-4 bg-primary/10 text-primary rounded-full text-sm font-semibold">
          Current Conference
        </div>
        <h1 className={`${montserrat.className} text-4xl md:text-5xl font-bold mb-4`}>
          {conference.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {conference.description}
        </p>
      </div>

      {/* Call to Action Card */}
      <Card className="p-8 md:p-12 mb-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-center mb-8">
          <h2 className={`${montserrat.className} text-3xl font-bold mb-4`}>
            Register Now!
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join us for this exciting conference. Sign up to create an account and register for the event.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Sign Up & Register
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/signin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Conference Details */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Calendar className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Conference Dates</h3>
              <p className="text-muted-foreground">
                {conference.startDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                {conference.endDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <MapPin className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground">{conference.location}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <DollarSign className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Registration Fee</h3>
              <p className="text-muted-foreground">
                {conference.currency} ${(conference.priceCents / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Registrations</h3>
              <p className="text-muted-foreground">
                {conference._count.registrations} registered
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Registration Period */}
      <Card className="p-6 mb-12">
        <h3 className="font-semibold mb-4">Registration Period</h3>
        <p className="text-muted-foreground">
          Registration is open from{" "}
          {conference.registrationStartDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          to{" "}
          {conference.registrationEndDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </Card>

      {/* Contact Information */}
      {contacts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            {contacts.map((contact, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium">{contact.role}</p>
                  {contact.name && <p className="text-sm text-muted-foreground">{contact.name}</p>}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function PastConferenceView({
  conference,
}: {
  conference: {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    priceCents: number;
    currency: string;
    registrationStartDate: Date;
    registrationEndDate: Date;
    contacts: Array<{
      id: string;
      name: string;
      fields: unknown;
    }>;
    _count: {
      registrations: number;
    };
  };
}) {
  const contacts = conference.contacts.map((contact) => {
    const fields = contact.fields as { name?: string; phone?: string; email?: string } | null;
    return {
      role: contact.name,
      name: fields?.name ?? undefined,
      phone: fields?.phone ?? undefined,
      email: fields?.email ?? undefined,
    };
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block px-4 py-2 mb-4 bg-muted text-muted-foreground rounded-full text-sm font-semibold">
          Past Conference
        </div>
        <h1 className={`${montserrat.className} text-4xl md:text-5xl font-bold mb-4`}>
          {conference.name}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {conference.description}
        </p>
      </div>

      {/* Overview Card */}
      <Card className="p-8 mb-8">
        <h2 className={`${montserrat.className} text-2xl font-bold mb-6`}>Conference Overview</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Dates</p>
                <p className="text-muted-foreground text-sm">
                  {conference.startDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {conference.endDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Location</p>
                <p className="text-muted-foreground text-sm">{conference.location}</p>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-start gap-3 mb-4">
              <DollarSign className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Registration Fee</p>
                <p className="text-muted-foreground text-sm">
                  {conference.currency} ${(conference.priceCents / 100).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Total Registrations</p>
                <p className="text-muted-foreground text-sm">
                  {conference._count.registrations} participants
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Registration Period */}
      <Card className="p-6 mb-8">
        <h3 className="font-semibold mb-3">Registration Period</h3>
        <p className="text-muted-foreground">
          Registration was open from{" "}
          {conference.registrationStartDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          to{" "}
          {conference.registrationEndDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </Card>

      {/* Contact Information */}
      {contacts.length > 0 && (
        <Card className="p-6 mb-8">
          <h3 className="font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            {contacts.map((contact, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium">{contact.role}</p>
                  {contact.name && <p className="text-sm text-muted-foreground">{contact.name}</p>}
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </a>
                  )}
                  {contact.phone && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {contact.phone}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Back to Home */}
      <div className="text-center">
        <Link href="/">
          <Button variant="outline">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

