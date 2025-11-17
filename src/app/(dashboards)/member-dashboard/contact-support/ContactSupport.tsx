"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { api } from "~/trpc/react";
import { Mail, Phone, MessageCircle, Clock, UserRound, School, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";

export default function ContactSupport() {
  const { data: conference, isLoading: conferenceLoading } =
    api.member.registration.getLatestConference.useQuery();

  const { data: registration, isLoading: registrationLoading } =
    api.member.registration.getMyLatest.useQuery();

  if (conferenceLoading || registrationLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Contact Support</h1>
        <p className="text-muted-foreground mt-2">
          Get help with your conference registration
        </p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Registration Information Card */}
        {registration && (
          <Card>
            <CardHeader>
              <CardTitle>Your Registration Information</CardTitle>
              <CardDescription>
                This information will help our support team assist you better
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Registration ID:</span>
                  <span className="font-mono font-medium">{registration.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{registration.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{registration.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{registration.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status:</span>
                  <span className="font-medium capitalize">{registration.paymentStatus}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conference Contacts */}
        {conference && conference.contacts && conference.contacts.length > 0 && (
          <Card className="border-primary/30 relative overflow-hidden border bg-gradient-to-br from-blue-50/70 to-purple-50/70 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 ring-primary/20 rounded-md p-2 ring-1">
                  <Mail className="text-primary h-5 w-5" />
                </div>
                <CardTitle className="text-base font-bold tracking-tight">
                  Conference Contacts
                </CardTitle>
              </div>
              <CardDescription>
                Reach out for registration assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {conference.contacts.map((contact, index) => {
                const fields = contact.fields as {
                  email?: string;
                  phone?: string;
                  school?: string;
                };

                return (
                  <div key={contact.id || index}>
                    {index > 0 && (
                      <Separator
                        orientation="horizontal"
                        className="mb-4 bg-[#CCCCCC] dark:bg-white/60"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <UserRound className="text-primary h-4 w-4" />
                        <span className="font-semibold text-foreground">
                          {contact.name}
                        </span>
                      </div>

                      {fields.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <Phone className="h-4 w-4" />
                          <Link
                            href={`tel:${fields.phone}`}
                            className="hover:underline text-foreground/80"
                          >
                            {fields.phone}
                          </Link>
                        </div>
                      )}
                      {fields.school && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <School className="h-4 w-4" />
                          <span className="text-foreground/80">
                            {fields.school}
                          </span>
                        </div>
                      )}
                      {fields.email && (
                        <div className="text-sm">
                          <strong>Email:</strong>{" "}
                          <Link
                            target="_blank"
                            href={`mailto:${fields.email}`}
                            className="text-blue-800 hover:underline dark:text-blue-400"
                          >
                            {fields.email}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <Separator className="bg-border/60" />

              {/* Always-visible fallback contact */}
              <div className="border-border/60 bg-background/50 rounded-lg border p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="text-primary h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <Link
                    target="_blank"
                    href="mailto:fijiprincipalsassociation@gmail.com"
                    className="text-blue-800 hover:underline dark:text-blue-400 truncate"
                  >
                    fijiprincipalsassociation@gmail.com
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* General Support Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              <CardTitle>General Support</CardTitle>
            </div>
            <CardDescription>
              {`Can't find what you're looking for? Our support team is ready to help`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Support
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  {`Send us an email and we'll get back to you within 24-48 hours.`}
                </p>
                <Link
                  href="mailto:support@fijiprincipalsassociation.org.fj"
                  className="text-primary hover:underline"
                >
                  support@fijiprincipalsassociation.org.fj
                </Link>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Response Time
                </h3>
                <p className="text-muted-foreground text-sm mb-2">
                  We aim to respond to all inquiries within 24-48 hours during business days.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Monday - Friday, 9:00 AM - 5:00 PM FJT</span>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/support">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View More Support Resources
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

