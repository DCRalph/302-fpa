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
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { format } from "date-fns";
import { Masonry } from "~/components/Masonry";
import { z } from "zod";

type ActivityActionButton = {
  label: string;
  href: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
};

type RecentActivityItem = {
  icon: { type: string; name: string; props?: Record<string, string | number> };
  title: string;
  time: string;
  createdAtISO?: string;
  description?: string;
  metaLines?: string[];
  actions?: ActivityActionButton[];
};

export default function MemberDashboardPage() {
  const { dbUser } = useAuth();

  const { data: memberDashboard } =
    api.member.dashboard.getMemberDashboard.useQuery();
  const { data: blogPosts } = api.member.blog.list.useQuery();

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

          {/* <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:gap-4 md:gap-6 lg:grid-cols-2"> */}

          <Masonry cols={{ base: 1, md: 2, xl: 2 }} gap="gap-4">
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
                  {(memberDashboard?.recentActivity as unknown as RecentActivityItem[] | undefined)?.map((activity: RecentActivityItem, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      {activity.icon ? (
                        <DynamicIcon
                          type={activity.icon.type ?? ""}
                          name={activity.icon.name ?? ""}
                          props={activity.icon.props ?? {}}
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-md text-foreground font-medium">{activity.title}</p>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-muted-foreground text-xs w-fit">{activity.time}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              {activity.createdAtISO ? format(new Date(activity.createdAtISO), "MMM d yyyy h:mmaaa").toLowerCase() : ""}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        {activity.description && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {activity.description}
                          </p>
                        )}
                        {activity.metaLines && activity.metaLines.length > 0 && (
                          <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5 text-xs">
                            {activity.metaLines.map((line: string, i: number) => (
                              <li key={i}>{line}</li>
                            ))}
                          </ul>
                        )}
                        {activity.actions && activity.actions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {activity.actions.map((a: ActivityActionButton, i: number) => (
                              <Button key={i} size="sm" variant={(a.variant ?? "outline")} asChild>
                                <Link href={a.href}>{a.label}</Link>
                              </Button>
                            ))}
                          </div>
                        )}
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
                    {!blogPosts?.posts || blogPosts.posts.filter((post) => post.authorId === dbUser?.id).length === 0 ? (
                      <p className="text-muted-foreground">
                        You haven&apos;t created any posts yet.
                      </p>
                    ) : (
                      blogPosts?.posts
                        ?.filter((post) => post.authorId === dbUser?.id)
                        .slice(0, 3) // show 3 most recent posts
                        .map((post) => (
                          <div
                            key={post.id}
                            className="inset-shadow-md border-border bg-muted/30 hover:bg-muted/50 flex items-start gap-4 rounded-lg border p-4 transition-colors"
                          >
                            {/* Post Content */}
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/member-dashboard/community-blog/${post.id}`}
                                className="text-foreground line-clamp-1 font-semibold hover:underline"
                              >
                                {post.title}
                              </Link>
                              <p className="text-muted-foreground line-clamp-2 text-sm">
                                {post.excerpt ?? post.content}
                              </p>
                              <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                                <Badge variant="outline" className="text-xs">
                                  {post.category.name}
                                </Badge>
                                {post.published ? (
                                  <>
                                    <Badge>Published</Badge>
                                    <span title={post.publishedAt ? format(new Date(post.publishedAt), "MMM d yyyy h:mmaaa") : undefined}>
                                      {post.publishedAt
                                        ? new Date(post.publishedAt).toLocaleDateString()
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



          </Masonry>
          {/* </div> */}
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

  const actionsSchema = z.object({
    primary: z.object({
      text: z.string(),
      href: z.string(),
    }),
    secondary: z.object({
      text: z.string(),
      href: z.string(),
    }),
  });

  let actionPrimary: { text: string; href: string } | null = null
  let actionSecondary: { text: string; href: string } | null = null
  const { success, data: actions } = actionsSchema.safeParse(stat.actions);

  if (success) {
    actionPrimary = actions?.primary;
    actionSecondary = actions?.secondary;
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
        {stat.showActions && actionPrimary && actionSecondary && (
          <>
            <Separator />
            <div className="flex space-x-2">
              {actionSecondary && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link
                    href={actionSecondary?.href ?? ""}
                    className="flex-1"
                  >
                    {actionSecondary.text}
                  </Link>
                </Button>
              )}
              {actionPrimary && (
                <Button
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link
                    href={actionPrimary?.href ?? ""}
                    className="flex-1"
                  >
                    {actionPrimary.text}
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card >
  );
}
