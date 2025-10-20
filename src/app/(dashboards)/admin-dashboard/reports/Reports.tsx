"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      <div>
        <h2 className="text-3xl font-bold">Reports</h2>
        <p className="text-muted-foreground">
          Reports submitted about posts or comments.
        </p>
      </div>

      <div className="space-y-4">
        {data?.reports && data.reports.length > 0 ? (
          data.reports.map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col">
                      {/* Title: prefer post title, then comment excerpt, then fallback */}
                      <span className="text-foreground font-medium">
                        {r.post?.title ??
                          (r.comment
                            ? `Comment: ${r.comment.content.slice(0, 80)}${r.comment.content.length > 80 ? "..." : ""}`
                            : "(no title)")}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        Reported on {new Date(r.createdAt).toLocaleString()}
                      </span>
                      {/* Reporter name */}
                      <span className="text-muted-foreground text-sm">
                        Reported by{" "}
                        <span className="text-foreground font-medium">
                          {r.user?.name ?? "Unknown user"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground mt-3 text-sm">
                  Reason:{" "}
                  <span className="text-foreground font-medium">
                    {r.reason}
                  </span>
                </div>
                <div className="prose prose-blog dark:prose-invert text-foreground/80 mt-2 max-w-full">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {r.details ?? "No additional details provided."}
                  </Markdown>
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
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t submitted any reports yet.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
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
