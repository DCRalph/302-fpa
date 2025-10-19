"use client";

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Heart,
  MessageSquareText,
  Send,
  ArrowLeft,
  Pencil,
  Trash2,
  MoreVertical,
  Flag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "~/hooks/useAuth";
import CommentItem from "~/components/community-blog/comment-item";
import { type RouterOutputs } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import ReportDialog from "~/components/community-blog/report-dialog";

type BlogPost = NonNullable<RouterOutputs["member"]["blog"]["getById"]>;

interface BlogPostProps {
  post: BlogPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  const { dbUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [commentText, setCommentText] = useState("");
  const [localLikeCount, setLocalLikeCount] = useState(post._count?.likes ?? 0);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser ?? false);

  // Editing state - initialize from query params
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editPublished, setEditPublished] = useState(post.published);
  const [editCategoryId, setEditCategoryId] = useState(post.categoryId);

  // Get categories for the select
  const { data: categories } = api.member.blog.getCategories.useQuery();

  // Check for edit query parameter on mount
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (editParam === "true" && post.authorId === dbUser?.id) {
      setIsEditing(true);
    }
  }, [searchParams, post.authorId, dbUser?.id]);

  const utils = api.useUtils();

  const likePost = api.member.blog.likePost.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsLiked(true);
        setLocalLikeCount(data.likeCount ?? 0);
        toast.success("Post liked!");
        void utils.member.blog.list.invalidate();
      }
    },
    onError: () => {
      toast.error("Failed to like post");
    },
  });

  const unlikePost = api.member.blog.unlikePost.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsLiked(false);
        setLocalLikeCount(data.likeCount ?? 0);
        toast.success("Post unliked!");
        void utils.member.blog.list.invalidate();
      }
    },
    onError: () => {
      toast.error("Failed to unlike post");
    },
  });

  const { data: commentsData, refetch: refetchComments } =
    api.member.blog.getComments.useQuery(
      { postId: post.id },
      { enabled: true },
    );

  // Add comment
  const addComment = api.member.blog.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentText("");
      void refetchComments();
      void utils.member.blog.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  // Add reply to comment
  const addReply = api.member.blog.addComment.useMutation({
    onSuccess: () => {
      toast.success("Reply added!");
      void refetchComments();
      void utils.member.blog.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to add reply");
    },
  });

  // Update comment
  const updateComment = api.member.blog.updateComment.useMutation({
    onSuccess: () => {
      toast.success("Comment updated!");
      void refetchComments();
    },
    onError: () => toast.error("Failed to update comment"),
  });

  // Delete comment
  const deleteComment = api.member.blog.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted!");
      void refetchComments();
      void utils.member.blog.list.invalidate();
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  // Delete post
  const deletePost = api.member.blog.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deleted!");
      // Redirect to blog list after deletion
      window.location.href = "/member-dashboard/community-blog";
    },
    onError: () => toast.error("Failed to delete post"),
  });

  // Update post
  const updatePost = api.member.blog.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Post updated!");
      setIsEditing(false);

      // Remove edit query parameter from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("edit");
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      router.replace(newUrl);

      void refetchComments();
      void utils.member.blog.list.invalidate();
    },
    onError: () => toast.error("Failed to update post"),
  });

  const handleLikeToggle = () => {
    if (isLiked) {
      unlikePost.mutate({ postId: post.id });
    } else {
      likePost.mutate({ postId: post.id });
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    addComment.mutate({ postId: post.id, content: commentText });
  };

  const handleReply = (parentCommentId: string, content: string) => {
    addReply.mutate({
      postId: post.id,
      content,
      parentCommentId,
    });
  };

  const handleDeletePost = () => {
    deletePost.mutate({ id: post.id });
  };

  const handleEditToggle = () => {
    const newEditingState = !isEditing;

    if (!newEditingState) {
      // Cancel editing - reset form data
      setEditTitle(post.title);
      setEditContent(post.content);
      setEditPublished(post.published);
      setEditCategoryId(post.categoryId);
    }

    setIsEditing(newEditingState);

    // Update URL query parameters
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (newEditingState) {
      newSearchParams.set("edit", "true");
    } else {
      newSearchParams.delete("edit");
    }

    const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
    router.replace(newUrl);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!editContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    updatePost.mutate({
      id: post.id,
      title: editTitle,
      content: editContent,
      published: editPublished,
      categoryId: editCategoryId,
    });
  };

  const isAuthor = post.authorId === dbUser?.id;

  // Dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: "post" | "comment";
  } | null>(null);

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <div className="mx-auto flex max-w-7xl items-center">
        <Button variant="ghost" asChild>
          <Link
            href="/member-dashboard/community-blog"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </Link>
        </Button>
      </div>

      <Card className="mx-auto max-w-7xl overflow-hidden p-0">
        <CardContent className="p-6">
          {/* Author Info */}
          <div className="mb-6 flex items-center space-x-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${post.author?.image ? "" : "bg-gray-200"} text-black`}
            >
              <span className="text-sm font-medium">
                {post.author?.image ? (
                  <Image
                    src={post.author.image}
                    alt=""
                    className="rounded-full"
                    width={48}
                    height={48}
                  />
                ) : (
                  (post.author?.name ?? "?")
                    .split(" ")
                    .map((n: string) => n?.[0] ?? "")
                    .join("")
                )}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-foreground text-lg font-medium">
                {post.author?.name ?? "Member"}
              </p>
              <p className="text-muted-foreground text-sm">
                {post.author?.professionalPosition ?? "Member"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {post.category?.name ?? "General"}
              </Badge>
              <div className="flex items-center space-x-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Post actions"
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
                          setReportTarget({ id: post.id, type: "post" });
                        }}
                      >
                        <Flag className="mr-2 h-4 w-4" /> Report
                      </DropdownMenuItem>
                    )}

                    {isAuthor && (
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault();
                          // navigate to edit view
                          void router.push(
                            `/member-dashboard/community-blog/${post.id}/edit`,
                          );
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}

                    {(isAuthor || dbUser?.role === "ADMIN") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setOpenDeleteDialog(true);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="text-destructive mr-2 h-4 w-4" />{" "}
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Report Dialog */}
                <ReportDialog
                  target={reportTarget}
                  open={openReportDialog}
                  onOpenChange={setOpenReportDialog}
                />

                {/* Delete Dialog */}
                <AlertDialog
                  open={openDeleteDialog}
                  onOpenChange={setOpenDeleteDialog}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your post and remove it from the community blog.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => setOpenDeleteDialog(false)}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive hover:bg-destructive/70"
                        onClick={() => {
                          handleDeletePost();
                          setOpenDeleteDialog(false);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                {/* Edit Title */}
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold"
                  />
                </div>

                {/* Edit Category */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Category
                  </Label>
                  <RadioGroup
                    value={editCategoryId ?? ""}
                    onValueChange={setEditCategoryId}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {categories?.map((category) => (
                      <div
                        key={category.id}
                        className={`relative flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-all duration-200 ${editCategoryId === category.id
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/30"
                          }`}
                      >
                        <RadioGroupItem
                          value={category.id}
                          id={`category-${category.id}`}
                          className="pointer-events-none"
                        />
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="pointer-events-none flex-1 cursor-pointer text-sm font-medium"
                        >
                          {category.name}
                        </Label>
                        {editCategoryId === category.id && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-primary h-2 w-2 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  {editCategoryId && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-muted-foreground text-xs">
                        Selected:
                      </span>
                      <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                        {categories?.find((c) => c.id === editCategoryId)?.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit Content */}
                <div className="space-y-2">
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={15}
                    className="resize-none"
                  />
                </div>

                {/* Edit Published Status */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-published"
                    checked={editPublished}
                    onCheckedChange={(checked) =>
                      setEditPublished(checked as boolean)
                    }
                  />
                  <Label htmlFor="edit-published">Published</Label>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-foreground text-3xl leading-tight font-bold">
                  {post.title}
                </h1>

                <div className="prose prose-lg prose-blog dark:prose-invert text-foreground/80 max-w-full">
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {post.content}
                  </Markdown>
                </div>
              </>
            )}

            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="mt-8 overflow-hidden rounded-lg">
                <Image
                  src={post.coverImageUrl}
                  alt="Post cover"
                  className="h-96 w-full object-cover"
                  width={800}
                  height={400}
                />
              </div>
            )}

            {/* Post Footer */}
            <div className="flex items-center justify-between border-t pt-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant={"ghost"}
                  onClick={handleLikeToggle}
                  disabled={likePost.isPending || unlikePost.isPending}
                  className={`text-muted-foreground hover:text-foreground flex items-center space-x-2 transition-colors ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
                >
                  <Heart
                    className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-base">{localLikeCount}</span>
                </Button>
                <div className="text-muted-foreground flex items-center space-x-2">
                  <MessageSquareText className="h-5 w-5" />
                  <span className="flex gap-2 text-base">
                    {post._count?.comments ?? 0}{" "}
                    <span className="hidden sm:flex">Comments</span>
                  </span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-muted-foreground text-sm">
                  {new Date(post.createdAt).toLocaleDateString()}
                </p>
                {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                  <span className="text-muted-foreground text-sm">
                    (Edited)
                  </span>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-8 space-y-6">
              {/* Comments Header */}
              <div className="border-t pt-8">
                <div className="mb-6">
                  <h3 className="text-foreground flex items-center gap-2 text-2xl font-bold">
                    <MessageSquareText className="h-6 w-6" />
                    Comments ({post._count?.comments ?? 0})
                  </h3>
                </div>
              </div>

              {/* Add Comment Form */}
              <Card className="bg-muted/30 p-0">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-foreground mb-2 font-semibold">
                        Share your thoughts
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Join the conversation and share your insights with the
                        community.
                      </p>
                    </div>
                    <Textarea
                      placeholder="Write a thoughtful comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[120px] resize-none text-base"
                      rows={5}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        {commentText.length}/500 characters
                      </p>
                      <Button
                        onClick={handleAddComment}
                        disabled={addComment.isPending || !commentText.trim()}
                        size="default"
                        className="px-6"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Post Comment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comments List */}
              <div className="space-y-6">
                {commentsData && commentsData.length > 0 ? (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <div className="bg-border h-px flex-1"></div>
                      <span className="text-muted-foreground px-3 text-sm font-medium">
                        {commentsData.length}{" "}
                        {commentsData.length === 1 ? "Comment" : "Comments"}
                      </span>
                      <div className="bg-border h-px flex-1"></div>
                    </div>
                    {commentsData.map((comment) => (
                      <div key={comment.id} className="bg-card">
                        <CommentItem
                          comment={comment}
                          currentUserId={dbUser?.id}
                          currentUserRole={dbUser?.role}
                          onUpdate={(id, content) =>
                            updateComment.mutate({ id: id, content })
                          }
                          onDelete={(id) => deleteComment.mutate({ id })}
                          onReply={handleReply}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  <Card className="bg-muted/20">
                    <CardContent className="p-8 text-center">
                      <MessageSquareText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <h4 className="text-foreground mb-2 font-semibold">
                        No comments yet
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Be the first to share your thoughts on this post!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
