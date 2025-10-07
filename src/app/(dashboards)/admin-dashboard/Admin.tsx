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



export default function AdminDashboardPage() {
  const { isPending } = useAuth();

  const { data: adminDashboard } = api.admin.dashboard.getAdminDashboard.useQuery();

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
            <h2 className="text-foreground mb-1 text-xl sm:text-2xl font-bold">
              Welcome back, {adminDashboard?.adminName ?? "Admin"}!
            </h2>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <DashboardStatsCard stat={adminDashboard?.stats.users} title="Users" />
            <DashboardStatsCard stat={adminDashboard?.stats.conference} title="Conference" />
            <DashboardStatsCard stat={adminDashboard?.stats.totalPayments} title="Total Payments" />
            {adminDashboard?.stats.conferences && (
              <DashboardStatsCard stat={adminDashboard.stats.conferences} title="Conferences" />
            )}
          </div>

          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
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
                {adminDashboard?.upcomingConference.title ? (
                  <>
                    <div className="py-6 text-center">
                      <h3 className="text-foreground text-lg sm:text-2xl font-semibold">
                        {adminDashboard.upcomingConference.title}
                      </h3>
                      <div className="text-foreground text-sm sm:text-md space-y-2 pt-6">
                        <p>
                          <strong>Date:</strong> {adminDashboard.upcomingConference.date}
                        </p>
                        <p>
                          <strong>Capacity:</strong> {adminDashboard.upcomingConference.capacity}
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
                            <Button variant="outline" size="sm" className="w-full">
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
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      No active conference found
                    </p>
                    <Link href="/admin-dashboard/manage-conferences/create">
                      <Button size="sm">Create Conference</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminDashboard?.recentActivity.map((activity, index) => (
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
                        <p className="text-muted-foreground text-sm">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )) ?? (
                      <div className="flex items-center justify-center py-8">
                        <Spinner className="size-8" />
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Conference Registrations */}
          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    {adminDashboard?.latestConferenceId
                      ? "Recent Conference Registrations"
                      : "All Recent Registrations"}
                  </CardTitle>
                  {adminDashboard?.totalConferences && adminDashboard.totalConferences > 0 && (
                    <Link href="/admin-dashboard/manage-conferences">
                      <Button variant="outline" size="sm">
                        View All Conferences
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
                        data={adminDashboard.recentRegistrations as RecentConferenceRegistration[]}
                      />
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
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
