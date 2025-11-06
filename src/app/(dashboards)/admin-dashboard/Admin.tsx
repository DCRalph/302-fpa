"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { DataTable } from "./data-table";
import { columns, type RecentConferenceRegistration } from "./columns";
import { api } from "~/trpc/react";
import { DynamicIcon } from "~/components/DynamicIcon";
import { Spinner } from "~/components/ui/spinner";
import { DashboardStatsCard } from "~/components/dash-stat-card";
import { useAuth } from "~/hooks/useAuth";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function AdminDashboardPage() {
  const { isPending } = useAuth();

  const { data: adminDashboard } =
    api.admin.dashboard.getAdminDashboard.useQuery();

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <main className="text-foreground flex">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-foreground mb-1 text-xl font-bold sm:text-2xl">
              Welcome back, {adminDashboard?.adminName ?? "Admin"}!
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            <DashboardStatsCard
              stat={adminDashboard?.stats.users}
              title="Users"
            />
            <DashboardStatsCard
              stat={adminDashboard?.stats.conference}
              title="Conference"
            />
            <DashboardStatsCard
              stat={adminDashboard?.stats.totalPayments}
              title="Total Payments"
            />
            {adminDashboard?.stats.conferences && (
              <DashboardStatsCard
                stat={adminDashboard.stats.conferences}
                title="Conferences"
              />
            )}
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:gap-6 lg:grid-cols-2">
            {/* Upcoming Conference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl">Active Conference</span>
                  {adminDashboard?.latestConferenceId && (
                    <Badge variant="default">Active</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!adminDashboard?.upcomingConference ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner className="size-8" />
                  </div>
                ) : adminDashboard?.upcomingConference.id ? (
                  <>
                    <div className="py-6 text-center">
                      <h3 className="text-foreground text-lg font-semibold sm:text-2xl">
                        {adminDashboard.upcomingConference.title}
                      </h3>
                      <div className="text-foreground sm:text-md space-y-2 pt-6 text-sm">
                        <p>
                          <strong>Date:</strong>{" "}
                          {adminDashboard.upcomingConference.date}
                        </p>
                        <p>
                          <strong>Capacity:</strong>{" "}
                          {adminDashboard.upcomingConference.capacity}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex gap-2">
                      {adminDashboard.latestConferenceId && (
                        <>
                          <Link
                            href={`/admin-dashboard/manage-conferences/${adminDashboard.latestConferenceId}`}
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              View Details
                            </Button>
                          </Link>
                          <Link
                            href={`/admin-dashboard/manage-conferences/${adminDashboard.latestConferenceId}/edit`}
                            className="flex-1"
                          >
                            <Button size="sm" className="w-full">
                              Edit Conference
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="pt-6">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <DynamicIcon
                        type="lucide"
                        name="Calendar"
                        props={{ className: "h-12 w-12 text-muted-foreground" }}
                      />
                      <h3 className="text-foreground text-lg font-semibold sm:text-xl">
                        No active conference
                      </h3>
                      <p className="text-muted-foreground max-w-[60ch]">
                        There are no active conferences right now. You can
                        create a new conference to make it available to members,
                        or review existing conferences.
                      </p>
                      <Separator />
                      <div className="flex w-full gap-2">
                        <Link
                          href="/admin-dashboard/manage-conferences/create"
                          className="flex-1"
                        >
                          <Button size="sm" className="w-full">
                            Create Conference
                          </Button>
                        </Link>
                        <Link
                          href="/admin-dashboard/manage-conferences"
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Conferences
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Recent Activity</CardTitle>
                  <Link href="/admin-dashboard/activity">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!adminDashboard?.recentActivity ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="size-8" />
                    </div>
                  ) : adminDashboard.recentActivity.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    adminDashboard.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <DynamicIcon
                          type={activity.icon.type ?? ""}
                          name={activity.icon.name ?? ""}
                          props={activity.icon.props ?? {}}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-md text-foreground font-medium">
                            {activity.title}
                          </p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-muted-foreground w-fit text-sm">
                                {activity.time}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent>
                              {activity.createdAtISO
                                ? format(
                                    new Date(activity.createdAtISO),
                                    "MMM d yyyy h:mmaaa",
                                  )
                                : ""}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Conference Registrations */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    {adminDashboard?.latestConferenceId
                      ? "Recent Conference Registrations"
                      : "All Recent Registrations"}
                  </CardTitle>
                  {adminDashboard?.totalConferences &&
                    adminDashboard.totalConferences > 0 && (
                      <Link href="/admin-dashboard/manage-conferences">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 md:mt-0"
                        >
                          View All
                        </Button>
                      </Link>
                    )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminDashboard?.recentRegistrations ? (
                    adminDashboard.recentRegistrations.length > 0 ? (
                      <DataTable
                        columns={columns}
                        data={
                          adminDashboard.recentRegistrations as RecentConferenceRegistration[]
                        }
                      />
                    ) : (
                      <div className="text-muted-foreground py-8 text-center">
                        <p>No registrations yet</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <Spinner className="size-10" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </main>
  );
}
