"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { DynamicIcon } from "~/components/DynamicIcon";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading } = api.admin.dashboard.getAllActivities.useQuery({
    page,
    pageSize,
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActivityTypeColor = (activityType: string) => {
    if (activityType.startsWith("admin_")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    if (activityType.startsWith("blog_")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    if (activityType.startsWith("conference_")) return "bg-green-500/10 text-green-600 dark:text-green-400";
    if (activityType.startsWith("file_")) return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    if (activityType.includes("profile") || activityType.includes("password")) return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
    return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  return (
    <main className="text-foreground flex">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-3 sm:p-4 md:p-6">
          {/* Header */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-foreground mb-1 text-xl sm:text-2xl font-bold">
              All Activity
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              View all user activities across the system
            </p>
          </div>

          {/* Activity List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Activity Log</CardTitle>
                {data && (
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, data.pagination.totalCount)} of {data.pagination.totalCount} activities
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="size-10" />
                </div>
              ) : !data || data.activities.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No activities found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Activity Items */}
                  {data.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <DynamicIcon
                          type="lucide"
                          name={activity.icon}
                          props={{ className: "size-5 text-primary" }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-foreground font-medium mb-1">
                              {activity.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{activity.user.name ?? activity.user.email}</span>
                              <span>•</span>
                              <span>{formatDate(activity.createdAt)}</span>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={getActivityTypeColor(activity.activity)}
                          >
                            {activity.activity.replace(/_/g, " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {data.pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {data.pagination.totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={!data.pagination.hasPrevPage}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={!data.pagination.hasNextPage}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </main>
  );
}

