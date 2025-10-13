
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import Link from "next/link";
import { Pencil, Trash2, Plus, ArrowLeft } from "lucide-react";

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
                    Back to Community
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
                            {data.map((post) => (
                                <div key={post.id} className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:gap-6">
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
                                        <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{post.excerpt || post.content?.slice(0, 120) + (post.content?.length > 120 ? "..." : "")}</p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>

                                            {/* Calculate time difference between updatedAt and createdAt and use to check if edited */}
                                            {Math.abs(new Date(post.updatedAt).getTime() - new Date(post.createdAt).getTime()) > 5000 && (
                                                <span className="text-xs text-muted-foreground">(Edited)</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 md:flex-col md:gap-3 md:justify-center">
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
                                            onClick={() => handleDelete(post.id)}
                                            disabled={deletePostMutation.isPending}
                                            title="Delete post"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
}
