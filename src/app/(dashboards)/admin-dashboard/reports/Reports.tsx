"use client";

import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { Check, Eye } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ResolveDialog from "~/components/reports/resolve-dialog";
import ViewDetailsDialog from "~/components/reports/view-details-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";

import type { BlogReport, ReportAction } from "@prisma/client";
import { handleTRPCMutation } from "~/lib/toast";

export default function ReportPage() {
  const [take] = useState(20);
  const [filter, setFilter] = useState<"all" | "post" | "comment">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "resolved"
  >("all");

  const utils = api.useUtils();

  const { data } = api.member.blog.getReports.useQuery({ take });

  const resolveReport = api.member.blog.resolveReport.useMutation({
    onSuccess: () => {
      void utils.member.blog.getReports.invalidate();
    },
  });

  
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [selectedResolveReport, setSelectedResolveReport] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [resolveAction, setResolveAction] = useState<ReportAction | null>(null);

  const handleResolve = (id: string) => {
    setSelectedResolveReport(id);
    setResolveNote("");
    setOpenResolveDialog(true);
  };

  const confirmResolve = async () => {
    await handleTRPCMutation(
      () =>
        resolveReport.mutateAsync({
          id: selectedResolveReport!,
          action: resolveAction!,
          adminNote: resolveNote,
        }),
      "Report resolved successfully.",
      "Error resolving report.",
    );
    setOpenResolveDialog(false);
    setSelectedResolveReport(null);
    setResolveNote("");
  };

  // View details dialog state
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedDetailsReport, setSelectedDetailsReport] = useState<BlogReport | null>(null);

  const handleViewDetails = (report: BlogReport) => {
    setSelectedDetailsReport(report);
    setOpenDetailsDialog(true);
  };

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold">Reports</h2>
        <p className="text-muted-foreground">
          Reports submitted about posts or comments.
        </p>
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Filters */}
        <div className="mb-6 w-full">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="sm:w-1/2">
              <div className="text-muted-foreground mb-2 text-sm">Type</div>
              <Select
                value={filter}
                onValueChange={(v) =>
                  setFilter(v as "all" | "post" | "comment")
                }
              >
                <SelectTrigger className="bg-background mt-1 w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="comment">Comments</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-end sm:w-1/2">
              <div className="text-muted-foreground mb-2 text-sm">Status</div>
              <Tabs
                value={statusFilter}
                onValueChange={(v: string) =>
                  setStatusFilter(v as "all" | "pending" | "resolved")
                }
              >
                <TabsList className="bg-surface border-input inline-flex w-full justify-end rounded-md border p-1 shadow-sm">
                  <TabsTrigger value="all" className="px-3 py-1 text-sm">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="px-3 py-1 text-sm">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="resolved" className="px-3 py-1 text-sm">
                    Resolved
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {(() => {
            const filteredReports = (data?.reports ?? []).filter((r) => {
              // type filter
              if (filter !== "all") {
                if (filter === "post" && !r.post) return false;
                if (filter === "comment" && !r.comment) return false;
              }

              // status filter
              if (statusFilter === "pending" && r.resolvedAt) return false;
              if (statusFilter === "resolved" && !r.resolvedAt) return false;

              return true;
            });

            if (filteredReports.length === 0) {
              return (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="mx-auto max-w-md">
                      <h3 className="text-foreground mb-2 text-lg font-semibold">
                        No reports found
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        There are no reports matching the selected filter.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return filteredReports.map((r) => (
              <Card key={r.id} className="overflow-hidden">
                <CardContent className="flex items-start gap-4">
                  {/* Left: icon / avatar placeholder */}
                  <div className="flex-shrink-0">
                    <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md">
                      {r.post ? "P" : r.comment ? "C" : "?"}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-foreground font-semibold">
                          {r.post?.title ??
                            (r.comment
                              ? `${r.comment.content.slice(0, 80)}${r.comment.content.length > 80 ? "..." : ""}`
                              : "(no title)")}
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          Reported by{" "}
                          <span className="text-foreground font-medium">
                            {r.user?.name ?? "Unknown"}
                          </span>
                          {" • "}
                          <span>Author: </span>
                          <span className="text-foreground font-medium">
                            {r.post?.author?.name ??
                              r.comment?.author?.name ??
                              "Unknown"}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1 text-sm">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {r.post ? "Post" : r.comment ? "Comment" : "Other"}
                        </Badge>
                        {/* status badge next to type */}
                        {r.resolvedAt ? (
                          <Badge className="text-foreground bg-green-100 text-xs dark:bg-green-900">
                            Resolved
                          </Badge>
                        ) : (
                          <Badge className="text-foreground bg-yellow-100 text-xs dark:bg-yellow-900">
                            Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-muted-foreground text-sm">
                        Reason:
                      </div>
                      <div className="text-foreground text-sm font-medium">
                        {r.reason}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="prose prose-blog dark:prose-invert text-foreground/80 mt-3 max-w-full">
                        <Markdown remarkPlugins={[remarkGfm]}>
                          {r.details ?? "No additional details provided."}
                        </Markdown>
                      </div>

                      {r.resolvedAt ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(r)}
                          className="ml-2"
                        >
                          <Eye className="h-4 w-4" /> View Details
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResolve(r.id)}
                          className="ml-2"
                        >
                          <Check className="h-4 w-4" /> Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
        </div>
      </div>

      {/* Resolve dialog (admin note) */}
      <ResolveDialog
        open={openResolveDialog}
        onOpenChange={setOpenResolveDialog}
        action={resolveAction}
        onActionChange={(a) => setResolveAction(a)}
        note={resolveNote}
        onNoteChange={setResolveNote}
        onConfirm={confirmResolve}
        confirmDisabled={resolveReport.isPending}
      />

      {/* View details dialog (read-only) */}
      <ViewDetailsDialog
        open={openDetailsDialog}
        onOpenChange={setOpenDetailsDialog}
        report={selectedDetailsReport}
      />
    </div>
  );
}
