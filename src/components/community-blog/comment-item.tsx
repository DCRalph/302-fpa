"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";
import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Check, X } from "lucide-react";

function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
}: {
  comment: any;
  currentUserId?: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [openDialog, setOpenDialog] = useState(false);

  const isAuthor = comment.authorId === currentUserId;

  const handleSave = () => {
    if (!editText.trim()) return;
    onUpdate(comment.id, editText);
    setIsEditing(false);
  };

  return (
    <div className="bg-muted/50 flex rounded-lg p-3 sm:flex-row space-x-3">
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          comment.author?.image ? "" : "bg-gray-300"
        } text-black`}
      >
        {comment.author?.image ? (
          <Image
            src={comment.author.image}
            alt=""
            className="rounded-full"
            width={32}
            height={32}
          />
        ) : (
          <span className="text-xs font-medium">
            {(comment.author?.name ?? "?")
              .split(" ")
              .map((n: string) => n[0])
              .join("")}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-1 sm:mt-0">
        <div className="flex gap-1 sm:flex-row sm:items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {comment.author?.name ?? "Member"}
            </p>
            <p className="text-muted-foreground text-xs">
              {comment.author?.professionalPosition ?? "Member"}
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2 sm:justify-end">
            <p className="text-muted-foreground text-xs">
              {new Date(comment.createdAt).toLocaleDateString()}
            </p>
            {Math.abs(
              new Date(comment.updatedAt).getTime() -
                new Date(comment.createdAt).getTime(),
            ) > 5000 && (
              <span className="text-muted-foreground text-xs">(Edited)</span>
            )}

            {/* Author Action Menu */}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground h-7 w-7"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-36">
                  {!isEditing && (
                    <>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Delete with confirmation */}
                      <AlertDialog
                        open={openDialog}
                        onOpenChange={setOpenDialog}
                      >
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-[#DC3545] focus:text-[#DC3545]"
                            onSelect={(e) => e.preventDefault()} // prevent closing immediately
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-[#DC3545]" />{" "}
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete this comment?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The comment will be
                              permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-[#DC3545] hover:bg-[#DC3545]/70"
                              onClick={() => {
                                onDelete(comment.id);
                                setOpenDialog(false);
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
          <p className="text-foreground/80 text-sm break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}

export default CommentItem;
