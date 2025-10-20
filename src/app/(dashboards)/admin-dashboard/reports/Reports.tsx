"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { api } from "~/trpc/react";
import { Trash2 } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ReportPage() {
  const [take] = useState(20);
  const [filter, setFilter] = useState<"all" | "post" | "comment">("all");
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const utils = api.useUtils();

  const { data } = api.member.blog.getReports.useQuery({ take });

  const deleteReport = api.member.blog.deleteReport.useMutation({
    onSuccess: () => {
      void utils.member.blog.getReports.invalidate();
    },
  });

  const handleDelete = (id: string) => {
    setSelectedReport(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedReport) return;
    deleteReport.mutate({ id: selectedReport });
    setOpenDeleteDialog(false);
    setSelectedReport(null);
  };

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold">Reports</h2>
        <p className="text-muted-foreground">
          Reports submitted about posts or comments.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-4 w-full">
          <Tabs
            value={filter}
            onValueChange={(v: string) => setFilter(v as "all" | "post" | "comment")}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="post">Posts</TabsTrigger>
              <TabsTrigger value="comment">Comments</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4">
          {data?.reports && data.reports.length > 0 ? (
            data.reports
              .filter((r) => {
                if (filter === "all") return true;
                return filter === "post" ? !!r.post : !!r.comment;
              })
              .map((r) => (
                <Card key={r.id} className="overflow-hidden">
                  <CardContent className="flex gap-4 items-start">
                    {/* Left: icon / avatar placeholder */}
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        {r.post ? "P" : r.comment ? "C" : "?"}
                      </div>
                    </div>

                    {/* Main content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-foreground font-semibold">
                            {r.post?.title ?? (r.comment ? `${r.comment.content.slice(0, 80)}${r.comment.content.length > 80 ? "..." : ""}` : "(no title)")}
                          </div>
                          <div className="text-muted-foreground text-sm mt-1">
                            Reported by <span className="text-foreground font-medium">{r.user?.name ?? "Unknown"}</span>
                            {" • "}
                            <span>{new Date(r.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {r.post ? "Post" : r.comment ? "Comment" : "Other"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(r.id)}
                            title="Delete report"
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <div className="text-sm text-muted-foreground">Reason:</div>
                        <div className="text-foreground font-medium text-sm">{r.reason}</div>
                      </div>

                      <div className="prose prose-blog dark:prose-invert text-foreground/80 mt-3 max-w-full">
                        <Markdown remarkPlugins={[remarkGfm]}>{r.details ?? "No additional details provided."}</Markdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto max-w-md">
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    No reports found
                  </h3>
                  <p className="text-muted-foreground mb-4">There are no reports matching the selected filter.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this report? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
