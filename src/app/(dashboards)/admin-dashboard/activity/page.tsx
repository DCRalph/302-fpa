"use client";

import React, { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import {
  Activity,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";

type Severity = "info" | "warning" | "error" | "critical";
type Category = "auth" | "content" | "registration" | "conference" | "file" | "profile";

// Helper function to get appropriate styling for severity
const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        bgColor: "bg-red-100 dark:bg-red-900/20",
        textColor: "text-red-800 dark:text-red-400",
        dotColor: "bg-red-500",
        icon: <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
      };
    case "error":
      return {
        bgColor: "bg-red-50 dark:bg-red-900/10",
        textColor: "text-red-600 dark:text-red-400",
        dotColor: "bg-orange-500 dark:bg-orange-400",
        icon: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
      };
    case "warning":
      return {
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        textColor: "text-yellow-600 dark:text-yellow-400",
        dotColor: "bg-yellow-500 dark:bg-yellow-400",
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
      };
    case "info":
    default:
      return {
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-600 dark:text-blue-400",
        dotColor: "bg-blue-500 dark:bg-blue-400",
        icon: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
      };
  }
};

// Format metadata as JSON string for display
const formatMetadata = (metadata: unknown) => {
  if (!metadata) return "";
  return JSON.stringify(metadata, null, 2);
};

const SEVERITIES: Severity[] = ["info", "warning", "error", "critical"];
const CATEGORIES: Category[] = ["auth", "content", "registration", "conference", "file", "profile"];

export default function ActivityPage() {
  const utils = api.useUtils();
  const REFRESH_MS = 30000;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isPaused, setIsPaused] = useState(false);
  const [limitTo, setLimitTo] = useState<number>(50);
  const [nextRefreshAt, setNextRefreshAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Filters
  const [selectedSeverities, setSelectedSeverities] = useState<Set<Severity>>(
    new Set(SEVERITIES)
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
    new Set(CATEGORIES)
  );

  // Auto refresh when not paused
  useEffect(() => {
    if (isPaused) {
      setNextRefreshAt(null);
      return;
    }
    setNextRefreshAt(Date.now() + REFRESH_MS);
    const id = setInterval(() => {
      void utils.admin.activity.getAll.invalidate();
      setNextRefreshAt(Date.now() + REFRESH_MS);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [isPaused, utils.admin.activity.getAll]);

  // Countdown updater
  useEffect(() => {
    if (isPaused || nextRefreshAt === null) {
      setRemainingSeconds(0);
      return;
    }
    const id = setInterval(() => {
      const diff = nextRefreshAt - Date.now();
      setRemainingSeconds(diff > 0 ? Math.ceil(diff / 1000) : 0);
    }, 250);
    return () => clearInterval(id);
  }, [isPaused, nextRefreshAt]);

  // Debounce search input to avoid excessive requests
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Reset when debounced search term changes (refetch is triggered automatically)

  // Prepare query parameters
  const queryParams = {
    take: limitTo,
    cursor: undefined,
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
    severity: selectedSeverities.size > 0 && selectedSeverities.size < SEVERITIES.length
      ? Array.from(selectedSeverities)[0]
      : undefined,
    category: selectedCategories.size > 0 && selectedCategories.size < CATEGORIES.length
      ? Array.from(selectedCategories)[0]
      : undefined,
  };

  // Fetch activities with filters
  const { data, isLoading, refetch } = api.admin.activity.getAll.useQuery(queryParams);

  useEffect(() => {
    if (isLoading) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [isLoading]);

  const handleRefreshActivities = async () => {
    await refetch();
    if (!isPaused) setNextRefreshAt(Date.now() + REFRESH_MS);
  };

  const handleDownloadActivities = () => {
    const rows = (data?.activities ?? []).map((a) => [
      new Date(a.createdAt).toISOString(),
      a.type,
      a.severity,
      a.category ?? "",
      a.userName ?? "",
      a.entity,
      a.action,
      a.title?.replaceAll("\n", " ") ?? "",
      (a.description ?? "").replaceAll("\n", " ")
    ]);
    const header = ["timestamp", "type", "severity", "category", "user", "entity", "action", "title", "description"];
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-log-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleActivityClick = (activityId: string) => {
    setSelectedActivityId(activityId);
    setIsDetailOpen(true);
  };

  const clearFilters = () => {
    setSelectedSeverities(new Set(SEVERITIES));
    setSelectedCategories(new Set(CATEGORIES));
    setSearch("");
  };

  const activities = data?.activities ?? [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl">
        <div className="p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefreshActivities}
                disabled={isLoading}
              >
                <RefreshCw className={cn("h-5 w-5", isLoading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 rounded-md border bg-card p-3 text-card-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Limit to</span>
                <Select value={String(limitTo)} onValueChange={(v) => setLimitTo(Number(v))}>
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[25, 50, 100, 200].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} items
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Severity</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 w-44 justify-start text-left font-normal">
                      <div className="flex w-full items-center justify-between">
                        <span className={selectedSeverities.size === 0 ? "text-muted-foreground" : ""}>
                          {selectedSeverities.size === 0
                            ? "Select Severities"
                            : selectedSeverities.size === SEVERITIES.length
                              ? "All Severities"
                              : `${selectedSeverities.size} Selected`}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <div className="space-y-2 p-2">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Checkbox
                          id="select-all-severities"
                          checked={selectedSeverities.size === SEVERITIES.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSeverities(new Set(SEVERITIES));
                            } else {
                              setSelectedSeverities(new Set());
                            }
                          }}
                        />
                        <Label htmlFor="select-all-severities" className="text-sm font-medium">
                          Select All
                        </Label>
                      </div>
                      {SEVERITIES.map((severity) => (
                        <div key={severity} className="flex items-center gap-2">
                          <Checkbox
                            id={`severity-${severity}`}
                            checked={selectedSeverities.has(severity)}
                            onCheckedChange={(checked) => {
                              const newSeverities = new Set(selectedSeverities);
                              if (checked) {
                                newSeverities.add(severity);
                              } else {
                                newSeverities.delete(severity);
                              }
                              setSelectedSeverities(newSeverities);
                            }}
                          />
                          <Label htmlFor={`severity-${severity}`} className="text-sm font-medium capitalize">
                            {severity}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Category</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-8 w-40 justify-start text-left font-normal">
                      <div className="flex w-full items-center justify-between">
                        <span className={selectedCategories.size === 0 ? "text-muted-foreground" : ""}>
                          {selectedCategories.size === 0
                            ? "Select Categories"
                            : selectedCategories.size === CATEGORIES.length
                              ? "All Categories"
                              : `${selectedCategories.size} Selected`}
                        </span>
                      </div>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[220px] p-0" align="start">
                    <div className="space-y-2 p-2">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <Checkbox
                          id="select-all-categories"
                          checked={selectedCategories.size === CATEGORIES.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories(new Set(CATEGORIES));
                            } else {
                              setSelectedCategories(new Set());
                            }
                          }}
                        />
                        <Label htmlFor="select-all-categories" className="text-sm font-medium">
                          Select All
                        </Label>
                      </div>
                      {CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center gap-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.has(category)}
                            onCheckedChange={(checked) => {
                              const newCategories = new Set(selectedCategories);
                              if (checked) {
                                newCategories.add(category);
                              } else {
                                newCategories.delete(category);
                              }
                              setSelectedCategories(newCategories);
                            }}
                          />
                          <Label htmlFor={`category-${category}`} className="text-sm font-medium capitalize">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="ml flex-1 min-w-[220px]">
                <Input
                  placeholder="Search activities..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-8"
                >
                  Clear
                </Button>
                <Button
                  variant={isPaused ? "default" : "outline"}
                  onClick={() => setIsPaused(!isPaused)}
                  className="h-8"
                  disabled={isLoading}
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button onClick={handleDownloadActivities} className="h-8">
                  Download
                </Button>
              </div>
            </div>
          </div>

          {/* Compact list */}
          <div className="overflow-hidden rounded-md border bg-card">
            {/* Top status bar */}
            <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-2 text-sm">
              <div className="text-muted-foreground">
                {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                {!isPaused ? (
                  <span className="text-xs">Auto-refresh in {remainingSeconds}s</span>
                ) : (
                  <span className="text-xs">Paused</span>
                )}
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => handleActivityClick(activity.id)}
                  className="group flex cursor-pointer items-start gap-2 border-b p-2 hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={cn(
                      "mt-1 h-2 w-2 rounded-full",
                      getSeverityStyle(activity.severity).dotColor
                    )}
                  />
                  <div className="min-w-[165px] text-xs tabular-nums text-muted-foreground">
                    {format(new Date(activity.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-semibold",
                        activity.severity === "critical" || activity.severity === "error"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : activity.severity === "warning"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      )}
                    >
                      {activity.severity}
                    </span>
                    {activity.category && (
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                        {activity.category}
                      </span>
                    )}
                  </div>
                  <div className="ml-2 flex-1 text-xs text-card-foreground">
                    {activity.userName && (
                      <span className="text-muted-foreground">[{activity.userName}]</span>
                    )}{" "}
                    <span className="font-medium text-foreground">{activity.title}</span>
                    {activity.description ? (
                      <span className="text-muted-foreground">: {activity.description}</span>
                    ) : null}
                  </div>
                  <div className="ml-auto text-[10px] uppercase text-muted-foreground">
                    {activity.entity} • {activity.action}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="p-3 text-center text-xs text-muted-foreground">Loading…</div>
              )}
              {!isLoading && activities.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">No activities found</div>
              )}
            </div>
          </div>

          {/* Activity Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Activity Details</DialogTitle>
                <DialogDescription>
                  Detailed information about the selected activity
                </DialogDescription>
              </DialogHeader>

              {(() => {
                const activity = activities.find((a) => a.id === selectedActivityId);
                if (!activity) {
                  return (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  );
                }

                return (
                  <div className="space-y-6 px-2">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Timestamp
                        </h3>
                        <p className="text-foreground">
                          {format(
                            new Date(activity.createdAt),
                            "yyyy-MM-dd HH:mm:ss",
                          )}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                        <p className="text-foreground text-xs break-all">{activity.id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Severity
                        </h3>
                        <div className="flex items-center gap-1">
                          {getSeverityStyle(activity.severity).icon}
                          <span
                            className={cn(
                              "text-sm font-medium capitalize",
                              getSeverityStyle(activity.severity).textColor,
                            )}
                          >
                            {activity.severity}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Category
                        </h3>
                        <Badge variant="secondary" className="capitalize">
                          {activity.category ?? "N/A"}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Entity
                        </h3>
                        <p className="text-foreground capitalize">{activity.entity}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Action
                        </h3>
                        <p className="text-foreground capitalize">{activity.action}</p>
                      </div>
                      {activity.userName && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            User
                          </h3>
                          <p className="text-foreground">{activity.userName}</p>
                          {activity.userEmail && (
                            <p className="text-xs text-muted-foreground">{activity.userEmail}</p>
                          )}
                        </div>
                      )}
                      {activity.entityId && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Entity ID
                          </h3>
                          <p className="text-foreground text-xs break-all">{activity.entityId}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                      <p className="text-foreground">{activity.title}</p>
                    </div>

                    {activity.description && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Description
                        </h3>
                        <p className="whitespace-pre-wrap text-foreground">
                          {activity.description}
                        </p>
                      </div>
                    )}

                    {activity.ipAddress && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          IP Address
                        </h3>
                        <p className="text-foreground">{activity.ipAddress}</p>
                      </div>
                    )}

                    {activity.metadata && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Metadata
                        </h3>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                          className="mt-2 max-h-48 overflow-auto rounded bg-muted p-4 text-sm"
                        >
                          {formatMetadata(activity.metadata)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
