"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Spinner } from "~/components/ui/spinner";
import { Badge } from "~/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Activity,
  Filter,
  RotateCcw,
  Clock,
  User,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useState } from "react";

export default function ActivityPage() {
  const [cursor, setCursor] = useState<string | null>(null);
  const [previousCursors, setPreviousCursors] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [severityFilter, setSeverityFilter] = useState<"info" | "warning" | "error" | "critical" | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, refetch } = api.admin.activity.getAll.useQuery({
    take: 50,
    cursor: cursor ?? undefined,
    type: typeFilter,
    severity: severityFilter,
    category: categoryFilter,
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "error": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "warning": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
      case "info": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    const className = "h-5 w-5";
    switch (severity) {
      case "critical": return <XCircle className={className} />;
      case "error": return <AlertCircle className={className} />;
      case "warning": return <AlertTriangle className={className} />;
      case "info": return <Info className={className} />;
      default: return <Info className={className} />;
    }
  };

  const getSeverityDotColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500";
      case "error": return "bg-orange-500";
      case "warning": return "bg-yellow-500";
      case "info": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    switch (category) {
      case "auth": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
      case "content": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "registration": return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "conference": return "bg-teal-500/10 text-teal-600 dark:text-teal-400";
      case "file": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
      case "profile": return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  const handleNextPage = () => {
    if (data?.nextCursor) {
      if (cursor) {
        setPreviousCursors([...previousCursors, cursor]);
      }
      setCursor(data.nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (previousCursors.length > 0) {
      const newCursors = [...previousCursors];
      const prevCursor = newCursors.pop();
      setPreviousCursors(newCursors);
      setCursor(prevCursor ?? null);
    } else {
      setCursor(null);
    }
  };

  const resetFilters = () => {
    setTypeFilter(undefined);
    setSeverityFilter(undefined);
    setCategoryFilter(undefined);
    setCursor(null);
    setPreviousCursors([]);
    void refetch();
  };

  return (
    <main className="text-foreground flex min-h-screen">
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Activity Log
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-0.5">
                  Complete audit trail of all system activities
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 shadow-sm gap-2">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Severity</label>
                  <Select value={severityFilter ?? "all"} onValueChange={(v) => setSeverityFilter(v === "all" ? undefined : v as "info" | "warning" | "error" | "critical")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Info
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-yellow-500" />
                          Warning
                        </div>
                      </SelectItem>
                      <SelectItem value="error">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-orange-500" />
                          Error
                        </div>
                      </SelectItem>
                      <SelectItem value="critical">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          Critical
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <Select value={categoryFilter ?? "all"} onValueChange={(v) => setCategoryFilter(v === "all" ? undefined : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="auth">Authentication</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="file">Files</SelectItem>
                      <SelectItem value="profile">Profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 lg:col-span-2 flex items-end">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full h-10"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity List */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Recent Activity</CardTitle>
                {!isLoading && data && (
                  <Badge variant="secondary" className="text-xs">
                    {data.activities.length} {data.activities.length === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spinner className="size-10 mb-4" />
                  <p className="text-sm text-muted-foreground">Loading activities...</p>
                </div>
              ) : !data || data.activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium mb-1">No activities found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="divide-y">
                  {/* Activity Items */}
                  {data.activities.map((activity, index) => (
                    <div
                      key={activity.id}
                      className={`group relative flex items-start gap-4 p-4 sm:p-5 hover:bg-accent/50 transition-all duration-200 ${index === 0 ? '' : ''
                        }`}
                    >
                      {/* Severity indicator bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getSeverityDotColor(activity.severity)} opacity-0 group-hover:opacity-100 transition-opacity`} />

                      {/* Icon with colored background */}
                      <div className={`flex-shrink-0 rounded-lg p-2.5 ${getSeverityColor(activity.severity)}`}>
                        {getSeverityIcon(activity.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-foreground font-semibold text-base leading-snug mb-1.5">
                              {activity.title}
                            </h3>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                                {activity.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Badge
                              variant="secondary"
                              className={`${getSeverityColor(activity.severity)} text-xs font-medium capitalize`}
                            >
                              {activity.severity}
                            </Badge>
                            {activity.category && (
                              <Badge
                                variant="outline"
                                className={`${getCategoryColor(activity.category)} text-xs font-medium capitalize`}
                              >
                                {activity.category}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Metadata row */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          {activity.userName && (
                            <div className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              <span className="font-medium">{activity.userName}</span>
                            </div>
                          )}
                          {activity.userName && <span className="text-muted-foreground/50">•</span>}
                          <span className="capitalize">{activity.entity}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span className="capitalize">{activity.action}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDate(activity.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-muted/20">
                    <div className="text-sm text-muted-foreground font-medium">
                      Showing <span className="text-foreground">{data.activities.length}</span> {data.activities.length === 1 ? 'activity' : 'activities'}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={previousCursors.length === 0 && !cursor}
                        className="min-w-[100px]"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1.5" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!data.nextCursor}
                        className="min-w-[100px]"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </main>
  );
}

