"use client";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Heart, MessageSquareText, Send, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "~/hooks/useAuth";
import CommentItem from "~/components/community-blog/comment-item";
import { type RouterOutputs } from "~/trpc/react";

type BlogPost = NonNullable<RouterOutputs["member"]["blog"]["getById"]>;

interface BlogPostProps {
  post: BlogPost;
}

export default function BlogPost({ post }: BlogPostProps) {
  const { dbUser } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [localLikeCount, setLocalLikeCount] = useState(
    (post as any)._count?.likes ?? 0,
  );
  const [isLiked, setIsLiked] = useState((post as any).isLikedByUser ?? false);

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
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <div className="flex items-center">
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

      <Card className="overflow-hidden p-0">
        <CardContent className="p-6">
          {/* Author Info */}
          <div className="mb-6 flex items-center space-x-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${(post as any).author?.image ? "" : "bg-gray-200"} text-black`}
            >
              <span className="text-sm font-medium">
                {(post as any).author?.image ? (
                  <Image
                    src={(post as any).author.image}
                    alt=""
                    className="rounded-full"
                    width={48}
                    height={48}
                  />
                ) : (
                  ((post as any).author?.name ?? "?")
                    .split(" ")
                    .map((n: string) => n?.[0] ?? "")
                    .join("")
                )}
              </span>
            </div>
            <div>
              <p className="text-foreground text-lg font-medium">
                {(post as any).author?.name ?? "Member"}
              </p>
              <p className="text-muted-foreground text-sm">
                {(post as any).author?.professionalPosition ?? "Member"}
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="text-sm">
                {(post as any).categories?.[0]?.category?.name ?? "General"}
              </Badge>
            </div>
          </div>

          {/* Post Content */}
          <div className="space-y-6">
            <h1 className="text-foreground text-3xl leading-tight font-bold">
              {post.title}
            </h1>

            <div className="prose prose-lg prose-blog dark:prose-invert text-foreground/80 max-w-full">
              <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
            </div>

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
                  <span className="text-base flex gap-2">
                    {(post as any)._count?.comments ?? 0} <span className="hidden sm:flex">Comments</span>
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
                    Comments ({(post as any)._count?.comments ?? 0})
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
                          onUpdate={(id, content) =>
                            updateComment.mutate({ id: id, content })
                          }
                          onDelete={(id) => deleteComment.mutate({ id })}
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
