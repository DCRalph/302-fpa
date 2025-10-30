"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ManageConferencesPage() {
  const { data: conferences, isLoading } = api.admin.conference.getAll.useQuery(
    undefined,
    {},
  );
  const utils = api.useUtils();

  const toggleActiveMutation = api.admin.conference.toggleActive.useMutation({
    onSuccess: async () => {
      toast.success("Conference status updated");
      await utils.admin.conference.getAll.invalidate();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update conference status");
    },
  });

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !isActive });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-10" />
      </div>
    );
  }

  const latestConference = conferences?.[0];
  const olderConferences = conferences?.slice(1) ?? [];

  return (
    <main className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
      <div className="mb-6 sm:flex space-y-4 sm:space-y-0 items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 rounded-lg p-2.5">
            <Calendar className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Manage Conferences</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Create, view, and manage conference details
            </p>
          </div>
        </div>
        <Link href="/admin-dashboard/manage-conferences/create">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Create Conference
          </Button>
        </Link>
      </div>

      {/* Latest Conference Section */}
      {latestConference && (
        <div className="mb-8 max-w-7xl mx-auto">
          <h2 className="mb-4 text-2xl font-semibold">Latest Conference</h2>
          <Card className="border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-2xl">
                      {latestConference.name}
                    </CardTitle>
                    <Badge
                      variant={
                        latestConference.isActive ? "default" : "secondary"
                      }
                    >
                      {latestConference.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2 text-base">
                    {latestConference.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Conference Dates
                    </p>
                    <p className="font-medium">
                      {new Date(
                        latestConference.startDate,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(latestConference.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Registration Period
                    </p>
                    <p className="font-medium">
                      {new Date(
                        latestConference.registrationStartDate,
                      ).toLocaleDateString()}{" "}
                      -{" "}
                      {new Date(
                        latestConference.registrationEndDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">Location</p>
                    <p className="font-medium">{latestConference.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Registrations
                    </p>
                    <p className="font-medium">
                      {latestConference._count.registrations}
                      {latestConference.maxRegistrations > 0
                        ? ` / ${latestConference.maxRegistrations}`
                        : " (Unlimited)"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-primary h-5 w-5">$</div>
                  <div>
                    <p className="text-muted-foreground text-sm">Price</p>
                    <p className="font-medium">
                      {latestConference.currency} $
                      {(latestConference.priceCents / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 sm:gap-2">
                <Link
                  href={`/admin-dashboard/manage-conferences/${latestConference.id}`}
                >
                  <Button variant="default" size="sm" className="gap-2">
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                </Link>
                <Link
                  href={`/admin-dashboard/manage-conferences/${latestConference.id}/edit`}
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    handleToggleActive(
                      latestConference.id,
                      latestConference.isActive,
                    )
                  }
                  disabled={toggleActiveMutation.isPending}
                >
                  {latestConference.isActive ? (
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Conferences Section */}
      <div className="max-w-7xl mx-auto">
        <h2 className="mb-4 text-2xl font-semibold">
          {latestConference ? "Previous Conferences" : "All Conferences"}
        </h2>
        {(!conferences || conferences.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-xl font-semibold">No conferences yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first conference.
              </p>
              <Link href="/admin-dashboard/manage-conferences/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Conference
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {olderConferences.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {olderConferences.map((conference) => (
              <Card key={conference.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">
                          {conference.name}
                        </CardTitle>
                        <Badge
                          variant={
                            conference.isActive ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {conference.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1 line-clamp-2">
                        {conference.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>
                        {new Date(conference.startDate).toLocaleDateString()} -{" "}
                        {new Date(conference.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{conference.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="text-muted-foreground h-4 w-4" />
                      <span>
                        {conference._count.registrations} registrations
                        {conference.maxRegistrations > 0 &&
                          ` / ${conference.maxRegistrations}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin-dashboard/manage-conferences/${conference.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                    <Link
                      href={`/admin-dashboard/manage-conferences/${conference.id}/edit`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
