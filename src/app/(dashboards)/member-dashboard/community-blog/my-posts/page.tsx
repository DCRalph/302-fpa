
"use client";


import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import { Pencil, Trash2, Plus, ArrowLeft, Heart, MessageSquareText, Send } from "lucide-react";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Textarea } from "~/components/ui/textarea";
import Image from "next/image";


// BlogPostCard for My Posts
function BlogPostCard({ post, onDelete }: { post: any; onDelete: (id: string) => void }) {
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
            }
        },
        onError: () => {
            toast.error("Failed to unlike post");
        },
    });

    const { data: commentsData, refetch: refetchComments } = api.member.blog.getComments.useQuery(
        { postId: post.id },
        { enabled: showComments }
    );

    const addComment = api.member.blog.addComment.useMutation({
        onSuccess: () => {
            toast.success("Comment added!");
            setCommentText("");
            void refetchComments();
            void utils.member.blog.myPosts.invalidate();
        },
        onError: () => {
            toast.error("Failed to add comment");
        },
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
        <Card className="overflow-hidden">
            <CardContent>
                <div className="flex flex-col md:flex-row md:items-center md:gap-6 gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="font-semibold line-clamp-1 text-lg">{post.title}</h2>
                            <Badge variant={post.published ? "default" : "secondary"} className="text-xs">
                                {post.published ? "Published" : "Draft"}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                                {post.categories?.[0]?.category?.name ?? "General"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{post.excerpt ?? post.content?.slice(0, 120) + (post.content?.length > 120 ? "..." : "")}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            {Math.abs(new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime()) > 5000 && (
                                <span className="text-xs text-muted-foreground">(Edited)</span>
                            )}
                        </div>
                        {/* Post Content Preview */}
                        <div className="prose prose-blog dark:prose-invert text-foreground/70 mt-2">
                            <Markdown remarkPlugins={[remarkGfm]}>{post.content?.slice(0, 300) + (post.content?.length > 300 ? "..." : "")}</Markdown>
                        </div>
                        {/* Cover Image */}
                        {post.coverImageUrl && (
                            <div className="overflow-hidden rounded-lg mt-4">
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
                                    onClick={() => setShowComments(!showComments)}
                                    className="text-muted-foreground hover:text-foreground flex items-center space-x-1 transition-colors"
                                >
                                    <MessageSquareText className="h-4 w-4" />
                                    <span className="text-sm">
                                        {post._count?.comments ?? 0}
                                    </span>
                                </Button>
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
                                            <div key={comment.id} className="flex space-x-3 rounded-lg bg-muted/50 p-3">
                                                <div
                                                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${comment.author?.image ? "" : "bg-gray-300"} text-black`}
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
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm font-medium">
                                                                {comment.author?.name ?? "Member"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {comment.author?.professionalPosition ?? "Member"}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(comment.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-foreground/80">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground">
                                            No comments yet. Be the first to comment!
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Actions: Edit/Delete */}
                    <div className="flex items-center gap-2 md:flex-col md:gap-3 md:justify-center mt-4 md:mt-0">
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
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => onDelete(post.id)}
                            title="Delete post"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function MyPostsPage() {
    const router = useRouter();
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
        if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            deletePostMutation.mutate({ id });
        }
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
                    <h1 className="text-3xl font-bold">My Blog Posts</h1>
                    <p className="text-muted-foreground mt-1">Manage your published and draft posts</p>
                </div>
                <Button asChild>
                    <Link href="/member-dashboard/community-blog/create">
                        <Plus className="mr-2 h-4 w-4" /> New Post
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent>
                    {isLoading ? (
                        <div className="py-12 text-center text-muted-foreground">Loading...</div>
                    ) : !data || data.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">You have not created any posts yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {data.map((post: any) => (
                                <BlogPostCard key={post.id} post={post} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
