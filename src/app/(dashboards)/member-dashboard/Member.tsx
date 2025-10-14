"use client";

import { useAuth } from "~/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { DynamicIcon } from "~/components/DynamicIcon";
import { Spinner } from "~/components/ui/spinner";
import { DashboardStatsCard } from "~/components/dash-stat-card";
import Link from "next/link";

export default function MemberDashboardPage() {
  const { dbUser } = useAuth();

  const { data: memberDashboard } =
    api.member.dashboard.getMemberDashboard.useQuery();
  const { data: blogPosts } = api.member.blog.myPosts.useQuery();

  return (
    <main className="text-foreground flex">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-foreground mb-1 text-xl font-bold sm:text-2xl">
              Welcome back, {dbUser?.name ?? "Member"}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              {`Here's what's happening with your conference registration.`}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-4">
            {/* Registration Status */}
            <DashboardStatsCard
              stat={memberDashboard?.stats.registrationStatus}
              title="Registration Status"
            />
            {/* Payment Status */}
            <DashboardStatsCard
              stat={memberDashboard?.stats.paymentStatus}
              title="Payment Status"
            />
            {/* Community Blog */}
            <DashboardStatsCard
              stat={memberDashboard?.stats.communityBlog}
              title="Community Blog"
            />
            {/* Documents */}
            <DashboardStatsCard
              stat={memberDashboard?.stats.documents}
              title="Documents"
            />
          </div>

          <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:gap-6 lg:grid-cols-2">
            {/* Conference Registration Status */}

            <MemberDashboardRegistrationStatusCard
              stat={memberDashboard?.registrationStatus}
            />

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
                        <p className="text-muted-foreground text-sm">
                          {activity.time}
                        </p>
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
                      <Button variant={"outline"} asChild>
                        <Link
                          href={"/member-dashboard/community-blog/my-posts"}
                        >
                          View All
                        </Link>
                      </Button>
                      <Button asChild>
                        <Link href={"/member-dashboard/community-blog/create"}>
                          Create Post
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-muted-foreground space-y-4">
                    {!blogPosts || blogPosts.length === 0 ? (
                      <p className="text-muted-foreground">
                        You haven&apos;t created any posts yet.
                      </p>
                    ) : (
                      blogPosts
                        .slice(0, 3) // show 3 most recent posts
                        .map((post) => (
                          <div
                            key={post.id}
                            className="border-border bg-muted/30 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
                          >
                            {/* Post Content */}
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/member-dashboard/community-blog/${post.id}/edit`}
                                className="text-foreground line-clamp-1 font-semibold hover:underline"
                              >
                                {post.title}
                              </Link>
                              <p className="text-muted-foreground line-clamp-2 text-sm">
                                {post.excerpt ?? post.content}
                              </p>
                              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {post.categories?.[0]?.category?.name ??
                                    "General"}
                                </Badge>
                                {post.published ? (
                                  <>
                                    <Badge>Published</Badge>
                                    <span>
                                      {post.publishedAt
                                        ? new Date(
                                          post.publishedAt,
                                        ).toLocaleDateString()
                                        : "—"}
                                    </span>
                                  </>
                                ) : (
                                  <Badge variant={"secondary"}>Draft</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
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

type RegistrationStatus = {
  state:
  | "no_conference"
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

function MemberDashboardRegistrationStatusCard({
  stat,
}: MemberDashboardRegistrationStatusCardProps) {
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
          <h3 className="text-foreground text-lg font-semibold">
            {stat.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-4">{stat.description}</p>

          {/* Registration Details */}
          <div className="text-foreground space-y-2 text-sm">
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
                {stat.registrationType
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </p>
            )}

            {stat.amount && (
              <p>
                <strong>Amount:</strong> {stat.amount}
              </p>
            )}

            {stat.paymentStatus && (
              <p className="flex items-center justify-center gap-2">
                <strong>Payment Status:</strong>{" "}
                <Badge
                  variant={stat.badgeVariant}
                  className={
                    stat.badgeBgColor ? `text-white ${stat.badgeBgColor}` : ""
                  }
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
              <p className="flex items-center justify-center gap-2">
                <strong>Status:</strong>{" "}
                <Badge
                  variant={stat.badgeVariant}
                  className={
                    stat.badgeBgColor ? `text-white ${stat.badgeBgColor}` : ""
                  }
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
                  // onClick={() => redirect(stat.actions?.secondary?.href ?? "")}
                >
                  {stat.actions?.secondary.text}
                </Button>
              )}
              {stat.actions?.primary && (
                <Button
                  size="sm"
                  className="flex-1"
                  // onClick={() => redirect(stat.actions?.primary?.href ?? "")}
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
