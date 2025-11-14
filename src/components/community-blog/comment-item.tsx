"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
// Avatar used for user profile images
import UserAvatar from "~/components/UserAvatar";
import { useState } from "react";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  Reply,
  Flag,
} from "lucide-react";
import { type RouterOutputs } from "~/trpc/react";

import { useAuth } from "~/hooks/useAuth";
import ReportDialog from "./report-dialog";

import { api } from "~/trpc/react";
import { toast } from "sonner";
import DeleteDialog from "../delete-dialog";

// Type for comment with author relation
type Comment = RouterOutputs["member"]["blog"]["getComments"][number];

function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  onReply,
  isNested = false,
}: {
  comment: Comment;
  currentUserId?: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReply?: (parentCommentId: string, content: string) => void;
  isNested?: boolean;
}) {
  const { dbUser } = useAuth();
  const utils = api.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: "post" | "comment";
  } | null>(null);

  const isAuthor = comment.authorId === currentUserId;
  // const isAdmin = currentUserRole === "ADMIN";

  // Create a report
  const createReport = api.member.blog.createReport.useMutation({
    onSuccess: () => {
      toast.success("Report submitted successfully!");

      void utils.member.blog.list.invalidate();
      void utils.member.blog.getReports.invalidate();
    },
    onError: () => toast.error("Failed to submit report"),
  });

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(comment.id, editText);
    setIsEditing(false);
  };

  const handleReply = () => {
    if (!replyText.trim() || !onReply) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setIsReplying(false);
  };

  // Submit a report
  const handleReportSubmit = async (payload: {
    reason: string;
    details?: string;
  }) => {
    if (!reportTarget) return;

    const { id, type } = reportTarget;

    try {
      await createReport.mutateAsync({
        id,
        type,
        reason: payload.reason,
        details: payload.details,
      });
    } catch (e) {
      toast.error(`Failed to submit report: ${e as string}`);
    }
  };

  return (
    <div
      className={`${isNested ? "border-muted ml-6 border-l-2 pl-4" : ""} space-y-3`}
    >
      <div
        className={`${isNested ? "bg-muted/30" : "bg-muted/50"} flex space-x-3 rounded-lg p-3 sm:flex-row`}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <UserAvatar src={comment.author?.image ?? null} name={comment.author?.name} className="h-8 w-8" />
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-1 sm:mt-0">
          <div className="flex justify-between gap-1 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {comment.author?.name ?? "Member"}
                </p>
              </div>
              <p className="text-muted-foreground text-xs">
                {comment.author?.professionalPosition ?? "Member"}
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2 sm:justify-end">
              <div className="space-x-2 lg:flex">
                <p className="text-muted-foreground text-xs">
                  {comment.createdAt.toLocaleDateString()}
                </p>
                {comment.updatedAt.getTime() !==
                  comment.createdAt.getTime() && (
                    <span className="text-muted-foreground text-xs">
                      (Edited)
                    </span>
                  )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {/* Reply Button was moved below the comment content to improve layout */}

                {/* Author Action Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground h-7 w-7 md:flex"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-36">
                    {!isAuthor && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          setOpenReportDialog(true);
                          setReportTarget({ id: comment.id, type: "comment" });
                        }}
                      >
                        <Flag className="mr-2 h-4 w-4" /> Report
                      </DropdownMenuItem>
                    )}
                    {!isEditing && (
                      <>
                        {isAuthor && (
                          <DropdownMenuItem onClick={() => setIsEditing(true)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}

                        {/* Report dialog */}
                        <ReportDialog
                          target={reportTarget}
                          open={openReportDialog}
                          onOpenChange={setOpenReportDialog}
                          onSubmit={handleReportSubmit}
                        />

                        {/* Delete with confirmation */}
                        {(isAuthor || dbUser?.role === "ADMIN") && (
                          <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              variant="destructive"
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                setOpenDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>

                            <DeleteDialog
                              open={openDeleteDialog}
                              onOpenChange={setOpenDeleteDialog}
                              onDelete={() => onDelete(comment.id)}
                              title="Delete this comment?"
                              description="This action cannot be undone. This will permanently delete your comment."
                            />
                          </>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Comment Text / Edit Mode */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditText(comment.content);
                    setIsEditing(false);
                  }}
                  className="flex items-center space-x-1"
                >
                  <X className="h-4 w-4" /> <span>Cancel</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center space-x-1 bg-[#198754] hover:bg-[#198754]/80"
                >
                  <Check className="h-4 w-4 text-white" />
                  <span className="text-white">Save</span>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-foreground/80 text-sm break-words">
                {comment.content}
              </p>

              {/* Replies counter & toggle */}
              {comment.subComments && comment.subComments.length > 0 && (
                <div className="mt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowReplies((s) => !s)}
                    className="text-muted-foreground hover:text-foreground text-sm"
                  >
                    {showReplies ? "Hide" : "Show"} replies (
                    {comment.subComments.length})
                  </button>
                </div>
              )}

              {/* Reply Button - only show for top-level comments */}
              {!isNested && onReply && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying((s) => !s)}
                    className="text-muted-foreground hover:text-foreground h-7 px-2"
                  >
                    <Reply className="mr-1 h-3 w-3" />
                    Reply
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="border-muted ml-11 space-y-2 border-l-2 pl-4">
          <Textarea
            placeholder={`Reply to ${comment.author?.name ?? "this comment"}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="resize-none"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setReplyText("");
                setIsReplying(false);
                setShowReplies(true);
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              Reply
            </Button>
          </div>
        </div>
      )}

      {/* Nested Comments (collapsible) */}
      {showReplies && comment.subComments && comment.subComments.length > 0 && (
        <div className="mt-4 space-y-3">
          {comment.subComments.map((subComment) => (
            <CommentItem
              key={subComment.id}
              comment={{ ...subComment, subComments: [] }}
              currentUserId={currentUserId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              isNested={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentItem;
