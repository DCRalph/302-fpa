"use client";

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { DynamicIcon } from "~/components/DynamicIcon";
import { Spinner } from "~/components/ui/spinner"

export default function MemberDashboardPage() {
  const { stackUser, dbUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!stackUser || !dbUser) {
    redirect("/signin");
  }

  const { data: memberDashboard } = api.member.dashboard.getMemberDashboard.useQuery();



  return (
    <main className="text-foreground flex">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-foreground mb-1 text-xl sm:text-2xl font-bold">
              Welcome back, {dbUser?.name ?? "Member"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {`Here's what's happening with your conference registration.`}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-4">

            {/* Registration Status */}
            <MemberDashboardStatsCard stat={memberDashboard?.stats.registrationStatus} title="Registration Status" />
            {/* Payment Status */}
            <MemberDashboardStatsCard stat={memberDashboard?.stats.paymentStatus} title="Payment Status" />
            {/* Community Blog */}
            <MemberDashboardStatsCard stat={memberDashboard?.stats.communityBlog} title="Community Blog" />
            {/* Documents */}
            <MemberDashboardStatsCard stat={memberDashboard?.stats.documents} title="Documents" />

          </div>

          <div className="mb-6 sm:mb-8 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-2">
            {/* Conference Registration Status */}

            <MemberDashboardRegistrationStatusCard stat={memberDashboard?.registrationStatus} />


            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-2xl">Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberDashboard?.recentActivity.map((activity, index) => (
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
                        <p className="text-sm text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Blog Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-2xl">Recent Blog Posts</span>
                    <div className="flex items-center space-x-2">
                      <Button variant={"outline"}>View All</Button>
                      <Button>Create Post</Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No blog posts yet</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="flex w-full items-center justify-between">
                    <span className="text-2xl">Recent Files</span>
                    <div className="flex items-center space-x-2">
                      <Button variant={"outline"}>View All</Button>
                      <Button>Upload File</Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">No files uploaded yet</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </main>
  );
}


function MemberDashboardStatsCard({ stat, title }: {
  stat: {
    value: string;
    subtitle: string;
    icon: {
      type: string;
      name: string;
      props: Record<string, string | number>;
    };
  } | undefined,
  title: string
}) {

  if (!stat) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-4 sm:p-6">
          <Spinner className="size-8 sm:size-10" />
        </CardContent>
      </Card >
    );
  }


  return (
    <Card
      className="from-gradient-blue via-gradient-purple to-gradient-red border-0 bg-gradient-to-br from-25% via-50% to-75% text-white shadow-lg py-0"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm text-white/80 truncate">{title}</p>
            <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-bold truncate">{stat.value}</p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-white/80 truncate">
              {stat.subtitle}
            </p>
          </div>
          <div className="flex-shrink-0">
            <DynamicIcon
              icon={{
                ...stat.icon,
                props: {
                  ...stat.icon.props,
                  className: "h-6 w-6 sm:h-8 sm:w-8",
                },
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


type RegistrationStatus = {
  state:
  | "not_registered"
  | "pending"
  | "cancelled"
  | "confirmed_unpaid"
  | "confirmed_paid"
  | "confirmed_partial"
  | "refunded";
  title: string;
  description: string;
  icon: {
    type: string;
    name: string;
    props: Record<string, string | number>;
  };
  iconColor: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  badgeText: string;
  badgeBgColor?: string;
  registrationId?: string;
  registeredDate?: string;
  cancelledDate?: string;
  refundedDate?: string;
  confirmedDate?: string;
  conferenceDate?: string;
  registrationType?: string;
  amount?: string | null;
  paymentStatus?: string;
  paymentDate?: string;
  showActions: boolean;
  actions?: {
    primary?: { text: string; href: string };
    secondary?: { text: string; href: string };
  };
};

interface MemberDashboardRegistrationStatusCardProps {
  stat: RegistrationStatus | null | undefined;
}

function MemberDashboardRegistrationStatusCard({ stat }: MemberDashboardRegistrationStatusCardProps) {
  // Loading state
  if (!stat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">Conference Registration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="size-10" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-2xl">Conference Registration Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="py-6 text-center">
          {/* Dynamic Icon */}
          <DynamicIcon
            icon={{
              ...stat.icon,
              props: {
                ...stat.icon.props,
                className: `mx-auto mb-4 ${stat.iconColor}`,
              },
            }}
          />

          {/* Title */}
          <h3 className="text-lg font-semibold text-foreground">
            {stat.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-muted-foreground">
            {stat.description}
          </p>

          {/* Registration Details */}
          <div className="space-y-2 text-sm text-foreground">
            {stat.conferenceDate && (
              <p>
                <strong>Date:</strong> {stat.conferenceDate}
              </p>
            )}

            {stat.registrationId && (
              <p>
                <strong>Registration ID:</strong> {stat.registrationId}
              </p>
            )}

            {stat.registeredDate && (
              <p>
                <strong>Registered On:</strong> {stat.registeredDate}
              </p>
            )}

            {stat.confirmedDate && (
              <p>
                <strong>Confirmed On:</strong> {stat.confirmedDate}
              </p>
            )}

            {stat.cancelledDate && (
              <p>
                <strong>Cancelled On:</strong> {stat.cancelledDate}
              </p>
            )}

            {stat.registrationType && (
              <p>
                <strong>Registration Type:</strong>{" "}
                {stat.registrationType.split("-").map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(" ")}
              </p>
            )}

            {stat.amount && (
              <p>
                <strong>Amount:</strong> {stat.amount}
              </p>
            )}

            {stat.paymentStatus && (
              <p className="flex justify-center items-center gap-2">
                <strong>Payment Status:</strong>{" "}
                <Badge
                  variant={stat.badgeVariant}
                  className={stat.badgeBgColor ? `text-white ${stat.badgeBgColor}` : ""}
                >
                  {stat.badgeText}
                </Badge>
              </p>
            )}

            {stat.paymentDate && (
              <p>
                <strong>Payment Date:</strong> {stat.paymentDate}
              </p>
            )}

            {stat.refundedDate && (
              <p>
                <strong>Refunded On:</strong> {stat.refundedDate}
              </p>
            )}

            {/* Show badge for states without payment status */}
            {!stat.paymentStatus && stat.state !== "not_registered" && (
              <p className="flex justify-center items-center gap-2">
                <strong>Status:</strong>{" "}
                <Badge
                  variant={stat.badgeVariant}
                  className={stat.badgeBgColor ? `text-white ${stat.badgeBgColor}` : ""}
                >
                  {stat.badgeText}
                </Badge>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {stat.showActions && stat.actions && (
          <>
            <Separator />
            <div className="flex space-x-2">
              {stat.actions?.secondary && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => redirect(stat.actions?.secondary?.href ?? "")}
                >
                  {stat.actions?.secondary.text}
                </Button>
              )}
              {stat.actions?.primary && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => redirect(stat.actions?.primary?.href ?? "")}
                >
                  {stat.actions?.primary.text}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
