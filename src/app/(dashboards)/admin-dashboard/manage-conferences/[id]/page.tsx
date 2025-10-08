"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function ViewConferencePage() {
  const params = useParams();
  const conferenceId = params.id as string;

  const { data: conference, isLoading } = api.admin.conference.getById.useQuery(
    { id: conferenceId },
    { enabled: !!conferenceId }
  );

  const utils = api.useUtils();

  const toggleActiveMutation = api.admin.conference.toggleActive.useMutation({
    onSuccess: async () => {
      toast.success("Conference status updated");
      await utils.admin.conference.getById.invalidate({ id: conferenceId });
      await utils.admin.conference.getAll.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update conference status");
    },
  });

  const handleToggleActive = () => {
    if (!conference) return;
    toggleActiveMutation.mutate({ id: conference.id, isActive: !conference.isActive });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!conference) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="mb-4 text-2xl font-semibold">Conference not found</h2>
        <Link href="/admin-dashboard/manage-conferences">
          <Button>Back to Conferences</Button>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const isRegistrationOpen =
    now >= new Date(conference.registrationStartDate) &&
    now <= new Date(conference.registrationEndDate);
  const isConferenceOngoing =
    now >= new Date(conference.startDate) && now <= new Date(conference.endDate);
  const isConferencePast = now > new Date(conference.endDate);

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin-dashboard/manage-conferences">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Conferences
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{conference.name}</h1>
              <Badge variant={conference.isActive ? "default" : "secondary"}>
                {conference.isActive ? "Active" : "Inactive"}
              </Badge>
              {isRegistrationOpen && (
                <Badge variant="default" className="bg-green-500">
                  Registration Open
                </Badge>
              )}
              {isConferenceOngoing && (
                <Badge variant="default" className="bg-blue-500">
                  Ongoing
                </Badge>
              )}
              {isConferencePast && (
                <Badge variant="secondary">Past</Badge>
              )}
            </div>
            <p className="text-muted-foreground">{conference.description}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/admin-dashboard/manage-conferences/${conference.id}/edit`}>
              <Button className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
            >
              {conference.isActive ? (
                <>
                  <XCircle className="h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Dates & Location */}
          <Card>
            <CardHeader>
              <CardTitle>Conference Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Conference Dates</p>
                    <p className="font-semibold">
                      {new Date(conference.startDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm">to</p>
                    <p className="font-semibold">
                      {new Date(conference.endDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="text-primary mt-1 h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Registration Period</p>
                    <p className="font-semibold">
                      {new Date(conference.registrationStartDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm">to</p>
                    <p className="font-semibold">
                      {new Date(conference.registrationEndDate).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <MapPin className="text-primary h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-muted-foreground text-sm">Location</p>
                  <p className="font-semibold">{conference.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Registration & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Users className="text-primary h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-sm">Registrations</p>
                    <p className="text-2xl font-bold">
                      {conference._count.registrations}
                      {conference.maxRegistrations > 0 && (
                        <span className="text-muted-foreground text-lg font-normal">
                          {" "}/ {conference.maxRegistrations}
                        </span>
                      )}
                    </p>
                    {conference.maxRegistrations === 0 && (
                      <p className="text-muted-foreground text-xs">Unlimited capacity</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="text-primary h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="text-muted-foreground text-sm">Registration Fee</p>
                    <p className="text-2xl font-bold">
                      {conference.currency} ${(conference.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Link href={`/admin-dashboard/manage-conferences/${conference.id}/registrations`} className="w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <Users className="h-4 w-4" />
                    View All Registrations ({conference._count.registrations})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Bank Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer Details</CardTitle>
              <CardDescription>Payment information for registrants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-sm">Account Name</p>
                <p className="font-semibold">{conference.bankTransferAccountName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Bank & Branch</p>
                <p className="font-semibold">{conference.bankTransferBranch}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Account Number</p>
                <p className="font-mono font-semibold">{conference.bankTransferAccountNumber}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                {conference.contacts.length === 1
                  ? "1 contact person"
                  : `${conference.contacts.length} contact people`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conference.contacts.length === 0 ? (
                <p className="text-muted-foreground text-sm">No contacts added yet</p>
              ) : (
                <div className="space-y-4">
                  {conference.contacts.map((contact, index) => {
                    const fields = contact.fields as { email?: string; phone?: string; school?: string } | null;
                    return (
                      <div key={contact.id}>
                        {index > 0 && <Separator className="mb-4" />}
                        <div className="space-y-2">
                          <p className="font-semibold">{contact.name}</p>
                          {fields?.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="text-muted-foreground h-4 w-4" />
                              <a
                                href={`mailto:${fields.email}`}
                                className="text-primary hover:underline"
                              >
                                {fields.email}
                              </a>
                            </div>
                          )}
                          {fields?.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="text-muted-foreground h-4 w-4" />
                              <a href={`tel:${fields.phone}`} className="text-primary hover:underline">
                                {fields.phone}
                              </a>
                            </div>
                          )}
                          {fields?.school && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="text-muted-foreground h-4 w-4" />
                              <span>{fields.school}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meta Information */}
          <Card>
            <CardHeader>
              <CardTitle>Meta Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(conference.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {new Date(conference.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

