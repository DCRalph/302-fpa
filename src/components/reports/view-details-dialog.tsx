"use client";

import { Badge } from "~/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ReportDetails = {
  id: string;
  createdAt: string | Date;
  post?: { title?: string; author?: { name?: string | null } | null } | null;
  comment?: { content: string; author?: { name?: string | null } | null } | null;
  user?: { name?: string | null } | null;
  reason?: string | null;
  details?: string | null;
  resolvedAt?: string | Date | null;
  action?: string | null;
  adminNote?: string | null;
};

export type ViewDetailsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportDetails | null;
};

export function ViewDetailsDialog({ open, onOpenChange, report }: ViewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Report Details
            <Badge variant="secondary" className="text-xs">
              {report?.post ? "Post" : report?.comment ? "Comment" : "Other"}
            </Badge>
            {report?.resolvedAt ? (
              <Badge className="text-xs bg-green-100 dark:bg-green-900 text-foreground">Resolved</Badge>
            ) : (
              <Badge className="text-xs bg-yellow-100 dark:bg-yellow-900 text-foreground">Pending</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Submitted on {report ? new Date(report.createdAt).toLocaleString() : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-muted-foreground">Title / Excerpt</div>
            <div className="font-medium">
              {report?.post?.title ?? (report?.comment ? `${report.comment.content.slice(0, 120)}${(report.comment.content?.length ?? 0) > 120 ? "..." : ""}` : "(no title)")}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Reported by</div>
              <div className="font-medium">{report?.user?.name ?? "Unknown"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Author</div>
              <div className="font-medium">{report?.post?.author?.name ?? report?.comment?.author?.name ?? "Unknown"}</div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Reason</div>
              <div className="font-medium">{report?.reason}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Status</div>
              <div className="font-medium">{report?.resolvedAt ? "Resolved" : "Pending"}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">Details</div>
            <div className="prose prose-blog dark:prose-invert text-foreground/80 max-w-full">
              <Markdown remarkPlugins={[remarkGfm]}>
                {report?.details ?? "No additional details provided."}
              </Markdown>
            </div>
          </div>

          {report?.resolvedAt && (
            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="text-xs text-muted-foreground">Action</div>
                  <div className="font-medium">{report?.action ?? "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Resolved At</div>
                  <div className="font-medium">{new Date(report.resolvedAt).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2">Admin Note</div>
                <div className="rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                  {report?.adminNote?.trim() ? (
                    report.adminNote
                  ) : (
                    <span className="italic text-muted-foreground">No admin note provided</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ViewDetailsDialog;
