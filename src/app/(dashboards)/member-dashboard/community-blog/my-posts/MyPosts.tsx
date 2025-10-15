"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowLeft,
  Heart,
  MessageSquareText,
  Send,
} from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";

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
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import CommentItem from "~/components/community-blog/comment-item";

import { useAuth } from "~/hooks/useAuth";

type BlogPost = RouterOutputs["member"]["blog"]["myPosts"][number];

// BlogPostCard for My Posts
function BlogPostCard({
  post,
  onDelete,
}: {
  post: BlogPost;
  onDelete: (id: string) => void;
}) {
  const { dbUser } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localLikeCount, setLocalLikeCount] = useState(post._count?.likes ?? 0);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser ?? false);
  const utils = api.useUtils();

  const likePost = api.member.blog.likePost.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setIsLiked(true);
        setLocalLikeCount(data.likeCount ?? 0);
        toast.success("Post liked!");

        void utils.member.blog.myPosts.invalidate();
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

        void utils.member.blog.myPosts.invalidate();
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
      { enabled: showComments },
    );

  // Add comment
  const addComment = api.member.blog.addComment.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentText("");
      void refetchComments();

      void utils.member.blog.myPosts.invalidate();
      void utils.member.blog.list.invalidate();
    },
    onError: () => {
      toast.error("Failed to add comment");
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

      void utils.member.blog.myPosts.invalidate();
      void utils.member.blog.list.invalidate();
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  //
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

  return (
    <Card className="overflow-hidden">
      <CardContent>
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/member-dashboard/community-blog/${post.id}`}>
                <h2 className="line-clamp-1 text-lg font-semibold hover:text-primary cursor-pointer transition-colors">
                  {post.title}
                </h2>
              </Link>
              <Badge
                variant={post.published ? "default" : "secondary"}
                className="text-xs"
              >
                {post.published ? "Published" : "Draft"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {post.categories?.[0]?.category?.name ?? "General"}
              </Badge>
            </div>

            <div className="mt-2 flex items-center gap-4">
              <span className="text-muted-foreground text-xs">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
              {Math.abs(
                new Date(post.updatedAt).getTime() -
                new Date(post.createdAt).getTime(),
              ) > 5000 && (
                  <span className="text-muted-foreground text-xs">(Edited)</span>
                )}
            </div>

            {/* Post Content Preview */}
            <div className="prose prose-blog dark:prose-invert text-foreground/70 mt-2 max-w-full">
              <Markdown remarkPlugins={[remarkGfm]}>
                {post.content?.slice(0, 300) +
                  (post.content?.length > 300 ? "..." : "")}
              </Markdown>
            </div>

            {/* Cover Image */}
            {post.coverImageUrl && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <Image
                  src={post.coverImageUrl}
                  alt="Post cover"
                  className="h-64 w-full object-cover"
                  width={100}
                  height={100}
                />
              </div>
            )}

            {/* Post Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-4">
                <Button
                  variant={"ghost"}
                  onClick={handleLikeToggle}
                  disabled={likePost.isPending || unlikePost.isPending}
                  className={`text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors ${isLiked ? "text-red-500 hover:text-red-600" : ""}`}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-sm">{localLikeCount}</span>
                </Button>
                <Button
                  variant={"ghost"}
                  onClick={() => setShowComments(!showComments)}
                  className="text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors"
                >
                  <MessageSquareText className="h-4 w-4" />
                  <span className="text-sm">{post._count?.comments ?? 0}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Actions: Edit/Delete */}
          <div className="mt-4 flex items-center gap-2 md:mt-0 md:flex-col md:justify-center md:gap-3">
            {/* Edit Button */}
            <Button
              asChild
              variant="outline"
              size="icon"
              className="hover:text-primary"
              title="Edit post"
            >
              <Link href={`/member-dashboard/community-blog/${post.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>

            {/* Delete with AlertDialog */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  title="Delete post"
                  className="hover:bg-destructive/80"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your post and remove it from the community blog.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/70"
                    onClick={() => onDelete(post.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Add Comment Form */}
            <div className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={addComment.isPending || !commentText.trim()}
                  size="sm"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {commentsData && commentsData.length > 0 ? (
                commentsData.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={dbUser?.id}
                    onUpdate={(id, content) =>
                      updateComment.mutate({ id: id, content })
                    }
                    onDelete={(id) => deleteComment.mutate({ id })}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyPostsPage() {
  const { data, isLoading, refetch } = api.member.blog.myPosts.useQuery();
  const deletePostMutation = api.member.blog.deletePost.useMutation({
    onSuccess: async () => {
      toast.success("Post deleted successfully");
      await refetch();
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to delete post");
    },
  });

  const handleDelete = (id: string) => {
    deletePostMutation.mutate({ id });
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <Link href="/member-dashboard/community-blog">
        <Button variant="ghost" className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Community Blog
        </Button>
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">All Blog Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your published and draft posts
          </p>
        </div>
        <Button asChild>
          <Link href="/member-dashboard/community-blog/create">
            <Plus className="mr-2 h-4 w-4" /> New Post
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">My Posts</h1>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground py-12 text-center">
              Loading...
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              You have not created any posts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((post) => (
                <BlogPostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
