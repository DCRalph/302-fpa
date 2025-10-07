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
import { getClientSession } from "~/lib/getClientSession";



export default function AdminDashboardPage() {
  // const { isLoading } = useAuth();
  const { isPending } = getClientSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }


  const { data: adminDashboard } = api.admin.dashboard.getAdminDashboard.useQuery();

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
          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            <DashboardStatsCard stat={adminDashboard?.stats.users} title="Users" />
            <DashboardStatsCard stat={adminDashboard?.stats.conference} title="Conference" />
            <DashboardStatsCard stat={adminDashboard?.stats.totalPayments} title="Total Payments" />
          </div>

          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
            {/* Upcoming Conference */}
            <Card>
              <CardHeader>
                <CardTitle className="mx-auto flex items-center space-x-2">
                  <span className="text-2xl">Upcoming Conference</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="py-6 text-center">
                  <h3 className="text-foreground text-lg sm:text-2xl">
                    {adminDashboard?.upcomingConference.title ?? "Loading..."}
                  </h3>
                  <div className="text-foreground text-sm sm:text-md space-y-2 pt-6">
                    <p>
                      <strong>Date:</strong> {adminDashboard?.upcomingConference.date ?? "Loading..."}
                    </p>
                    <p>
                      <strong>Capacity:</strong> {adminDashboard?.upcomingConference.capacity ?? "Loading..."}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  <Button size="sm" className="flex-1">
                    Manage Sessions
                  </Button>
                </div>
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
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">
                    Recent Conference Registrations
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminDashboard?.recentRegistrations ? (
                    <DataTable
                      columns={columns}
                      data={adminDashboard.recentRegistrations as RecentConferenceRegistration[]}
                    />
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
