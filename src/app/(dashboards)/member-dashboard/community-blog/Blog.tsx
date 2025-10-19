"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import {
  Search,
  Heart,
  Check,
  X,
  MessageSquareText,
  Send,
  Pencil,
  Trash2,
  MoreVertical,
  Flag,
} from "lucide-react";
import { useRouter } from 'nextjs-toploader/app';
import { useState } from "react";
import { api } from "~/trpc/react";
import { Label } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";

import Image from "next/image";
import Link from "next/link";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { type RouterOutputs } from "~/trpc/react";

import { useAuth } from "~/hooks/useAuth";

import CommentItem from "~/components/community-blog/comment-item";
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
import ReportDialog from "~/components/community-blog/report-dialog";

type BlogPost = RouterOutputs["member"]["blog"]["list"]["posts"][number];

// BlogPostCard Component
function BlogPostCard({ post }: { post: BlogPost }) {
  const { dbUser } = useAuth();
  const router = useRouter();

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localLikeCount, setLocalLikeCount] = useState(post._count.likes);
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);

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
      { enabled: showComments },
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
      void utils.member.blog.list.invalidate();
    },
    onError: () => toast.error("Failed to delete post"),
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

  const isAuthor = post.authorId === dbUser?.id;

  // Dialogs
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    id: string;
    type: "post" | "comment";
  } | null>(null);

  return (
    <Card className="overflow-hidden">
      <CardContent className="">
        {/* Author Info */}
        <div className="mb-4 flex items-center space-x-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${post.author?.image ? "" : "bg-gray-200"} text-black`}
          >
            <span className="text-sm font-medium">
              {post.author?.image ? (
                <Image
                  src={post.author.image}
                  alt=""
                  className="rounded-full"
                  width={40}
                  height={40}
                />
              ) : (
                (post.author?.name ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              )}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-foreground font-medium">
              {post.author?.name ?? "Member"}
            </p>
            <p className="text-muted-foreground text-sm">
              {post.author?.professionalPosition ?? "Member"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
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
                        setReportTarget({ id: post.id, type: "post" });
                        setOpenReportDialog(true);
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

              {/* Report dialog */}
              <ReportDialog
                target={reportTarget}
                open={openReportDialog}
                onOpenChange={setOpenReportDialog}
              />

              {/* Delete dialog */}
              <AlertDialog
                open={openDeleteDialog}
                onOpenChange={setOpenDeleteDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your post and remove it from the community blog.
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
        <div className="space-y-4">
          <Link href={`/member-dashboard/community-blog/${post.id}`}>
            <h3 className="text-foreground hover:text-primary cursor-pointer font-semibold transition-colors">
              {post.title}
            </h3>
          </Link>
          <div className="prose prose-blog dark:prose-invert text-foreground/70 max-w-full">
            <Markdown remarkPlugins={[remarkGfm]}>{post.content}</Markdown>
          </div>

          {/* Cover Image */}
          {post.coverImageUrl && (
            <div className="mt-6 overflow-hidden rounded-lg">
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
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm">{localLikeCount}</span>
              </Button>
              <Button
                variant={"ghost"}
                className="text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors"
                asChild
              >
                <Link href={`/member-dashboard/community-blog/${post.id}`}>
                  <MessageSquareText className="h-4 w-4" />
                  <span className="text-sm">{post._count.comments}</span>
                </Link>
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
              {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                <span className="text-muted-foreground text-sm">(Edited)</span>
              )}
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
                      currentUserRole={dbUser?.role}
                      onUpdate={(id, content) =>
                        updateComment.mutate({ id: id, content })
                      }
                      onDelete={(id) => deleteComment.mutate({ id })}
                      onReply={handleReply}
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
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunityBlog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all-posts");
  // const [isSearching, setIsSearching] = useState(false);

  const { data } = api.member.blog.list.useQuery({
    query: searchQuery || undefined,
    categorySlug: selectedCategory !== "all-posts" ? selectedCategory : undefined,
    take: 10,
  });

  const { data: categories } = api.member.blog.getCategories.useQuery();

  const handleYourPosts = () => {
    setSearchQuery("Your posts");
    setSelectedCategory("all-posts");
  };

  const handleSearch = () => {
    // Search is handled automatically by the query
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategory("all-posts");
  };

  const guidelines = [
    {
      text: "Share educational insights and experiences",
      type: "allowed",
    },
    {
      text: "Use clear, professional language",
      type: "allowed",
    },
    {
      text: "Respect intellectual property rights",
      type: "allowed",
    },
    {
      text: "Be constructive and supportive",
      type: "allowed",
    },
    {
      text: "No spam or irrelevant content",
      type: "not-allowed",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-3 sm:p-4 md:p-6">
      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Label className="py-1 text-sm font-medium">Search Posts</Label>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search by title, content, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background py-3 pl-10 pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 transform p-0"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="lg:col-span-1">
            <Label className="py-1 text-sm font-medium">Filter by Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background w-full py-3">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-posts">All Categories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="flex-1">
              Search
            </Button>
          </div> */}
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedCategory !== "all-posts") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: &quot;{searchQuery}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedCategory !== "all-posts" && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories?.find(c => c.slug === selectedCategory)?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => setSelectedCategory("all-posts")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Content - Blog Posts */}
        <div className="space-y-6 lg:col-span-3">
          {data?.posts && data.posts.length > 0 ? (
            data.posts.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto max-w-md">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No posts found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || selectedCategory !== "all-posts"
                      ? "Try adjusting your search or filter criteria."
                      : "Be the first to share something with the community!"}
                  </p>
                  <Button asChild>
                    <Link href="/member-dashboard/community-blog/create">
                      Create a Post
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Posts */}
          <Card className="gap-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">My Posts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/70 text-base">
                Share your knowledge with the community
              </p>
              <div className="pt-4 flex flex-col gap-4">
                <Button asChild className="w-full">
                  <Link href={"/member-dashboard/community-blog/create"}>
                    Create a Post
                  </Link>
                </Button>
                <Button variant={"outline"} onClick={handleYourPosts} className="flex-1">
                  Your Posts
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {guidelines.map((guideline, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {guideline.type === "allowed" ? (
                    <Check
                      className="w-4 flex-shrink-0 text-[#198754]"
                      size={24}
                    />
                  ) : (
                    <X
                      className="text-destructive w-4 flex-shrink-0"
                      size={24}
                    />
                  )}
                  <span className="text-foreground text-sm">
                    {guideline.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
