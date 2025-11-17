"use client";

import { QRCodeSVG } from "qrcode.react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { api } from "~/trpc/react";
import { format } from "date-fns";
import { Calendar, MapPin, Ticket } from "lucide-react";

export default function TicketDownload() {
  const { data: registration, isLoading, error } =
    api.member.registration.getMyLatestWithConference.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Error loading registration: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No registration found. Please register for a conference first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registration.conference) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Conference information not available for this registration.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const qrCodeValue = `${registration.name}:${registration.id}`;
  const conference = registration.conference;

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Conference Ticket</h1>
        <p className="text-muted-foreground mt-2">
          Download and present this ticket at the conference
        </p>
      </div>

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            <CardTitle className="text-xl">Registration Ticket</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Section */}
          <div className="flex flex-col items-center gap-4 border-b pb-6">
            <div className="rounded-lg border-2 border-border bg-white p-4">
              <QRCodeSVG
                value={qrCodeValue}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Registration ID</p>
              <p className="text-xs text-muted-foreground font-mono">
                {registration.id}
              </p>
            </div>
          </div>

          {/* Conference Information */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">
                {conference.name}
              </h2>
              {conference.description && (
                <p className="text-sm text-muted-foreground">
                  {conference.description}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Dates */}
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {conference.startDate && conference.endDate
                      ? `${format(
                        new Date(conference.startDate),
                        "MMM d, yyyy"
                      )} - ${format(
                        new Date(conference.endDate),
                        "MMM d, yyyy"
                      )}`
                      : "TBA"}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {conference.location || "TBA"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">
                Registration Details
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{registration.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{registration.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">School:</span>
                  <span className="font-medium">{registration.school}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">
                    {registration.status}
                  </span>
                </div>
                {conference.priceCents && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">
                      {conference.currency}{" "}
                      {(conference.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

