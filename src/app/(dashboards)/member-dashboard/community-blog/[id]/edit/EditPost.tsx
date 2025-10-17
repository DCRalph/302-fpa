"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import Image from "next/image";
import { type RouterOutputs } from "~/trpc/react";

type BlogPost = NonNullable<RouterOutputs["member"]["blog"]["getById"]>;

interface BlogPostProps {
  post: BlogPost;
}

export default function EditPostPage({ post }: BlogPostProps) {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  // const { data: post } = api.member.blog.getById.useQuery(
  //   { id: postId },
  //   { enabled: !!postId },
  // );

  // Editing state - initialize from query params
  const [editTitle, setEditTitle] = useState(post?.title);
  const [editContent, setEditContent] = useState(post?.content);
  const [editPublished, setEditPublished] = useState(post?.published);
  const [editCategoryIds, setEditCategoryIds] = useState(
    post?.categories.map((category) => category.category.id) ?? [],
  );

  const [selectedFilter, setSelectedFilter] = useState("general");

  // Load available categories so we can map slug -> id
  const { data: categories } = api.member.blog.getCategories.useQuery();

  // Populate form when post data is loaded
  useEffect(() => {
    if (post) {
      const slug = post.categories?.[0]?.category?.slug ?? "general";
      setSelectedFilter(slug);

      setEditTitle(post.title);
      setEditContent(post.content);
      setEditPublished(post.published);
      setEditCategoryIds(
        post.categories.map((category) => category.category.id),
      );
    }
  }, [post]);

  // Keep selectedFilter in sync if formData.postType changes (e.g. user or post updates)
  // (removed stale formData sync) selectedFilter is initialized from post above

  // When selectedFilter changes, map it to category id(s) so the mutation uses the correct ids
  useEffect(() => {
    if (!categories || !selectedFilter) return;

    const match = categories.find((c) => c.slug === selectedFilter);
    if (match) {
      // single-select: replace editCategoryIds with the selected category id
      setEditCategoryIds([match.id]);
    } else if (selectedFilter === "all-posts") {
      // no-op: keep existing selection
    } else {
      // fallback: if slug not found, do nothing
    }
  }, [selectedFilter, categories]);

  // If categories load after we initialize editCategoryIds, ensure selectedFilter
  // points to a slug that actually exists in categories. This covers cases where
  // the Select renders before categories are available and would otherwise show blank.
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    // If the currently selectedFilter doesn't match any loaded category slug,
    // but we have an editCategoryIds value from the post, map that id -> slug.
    const hasSlugMatch = categories.some((c) => c.slug === selectedFilter);
    if (!hasSlugMatch && editCategoryIds && editCategoryIds.length > 0) {
      const matchById = categories.find((c) => c.id === editCategoryIds[0]);
      if (matchById) {
        setSelectedFilter(matchById.slug);
      }
    }
  }, [categories, editCategoryIds, selectedFilter]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // TODO: Create an S3 bucket to upload images to
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const utils = api.useUtils();

  const updatePostMutation = api.member.blog.updatePost.useMutation({
    onSuccess: async () => {
      // Invalidate specific blog queries so refreshed data is fetched
      try {
        await Promise.all([
          // utils.member.blog.getById.invalidate({ id: postId }),
          utils.member.blog.list.invalidate(),
        ]);
      } catch (e) {
        // fallback to broad invalidate
        toast.error(`Failed to update post: ${e as string}`);
        await utils.member.blog.invalidate?.();
      }

      toast.success("Post updated successfully");
      router.push(`/member-dashboard/community-blog/${postId}`);
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update post");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    field: string,
    value: string | boolean | number,
  ) => {
    switch (field) {
      case "title":
        setEditTitle(value as string);
        break;
      case "content":
        setEditContent(value as string);
        break;
      case "published":
        setEditPublished(value as boolean);
        break;
      case "postType":
        setSelectedFilter(value as string);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editTitle?.trim()) {
      toast.error("Please enter a title for the post");
      return;
    }

    if (!editContent?.trim()) {
      toast.error("Please enter content for the post");
      return;
    }

    setIsSubmitting(true);

    // NOTE: image upload is not wired to the backend yet. If you have an
    // endpoint for uploads, upload `imageFile` first and include the image URL
    // in the mutation payload. For now we send the basic post data only.
    updatePostMutation.mutate({
      id: postId,
      title: editTitle ?? "",
      content: editContent ?? "",
      published: editPublished ?? true,
      categoryIds: editCategoryIds,
      // image: uploadedImageUrl ?? undefined,
    });
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            {/* Header */}
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Edit Post</CardTitle>
              <CardDescription className="text-base">
                Review and modify post details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 space-y-2 space-x-4">
                {/* Post Title */}
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="title">
                    Title<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Post title"
                    value={editTitle ?? ""}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Post Type */}
                <div className="space-y-2">
                  <Label htmlFor="postType">
                    Post Type<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedFilter ?? "general"}
                    onValueChange={(val) => {
                      setSelectedFilter(val);
                      handleInputChange("postType", val);
                    }}
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories && categories.length > 0 ? (
                        // Render categories fetched from the server
                        categories.map((c) => (
                          <SelectItem key={c.id} value={c.slug}>
                            {c.name}
                          </SelectItem>
                        ))
                      ) : (
                        // Fallback static options
                        <>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="research-paper">Research Paper</SelectItem>
                        </>
                      )}

                      {/* If post has a category slug not present in categories list yet,
                          include it so the Select can display the current value */}
                      {post?.categories?.[0]?.category?.slug &&
                        categories &&
                        !categories.find((c) => c.slug === post?.categories?.[0]?.category?.slug) && (
                          <SelectItem
                            value={post.categories[0].category.slug}
                            key={`fallback-${post.categories[0].category.id}`}
                          >
                            {post.categories[0].category.name ?? post.categories[0].category.slug}
                          </SelectItem>
                        )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Content<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your post here..."
                  value={editContent ?? ""}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={10}
                  required
                />
              </div>

              {/* Post Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer rounded-md file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1 file:font-semibold"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreviewUrl(url);
                    } else {
                      setPreviewUrl(null);
                    }
                  }}
                />

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-2">
                    <p className="text-muted-foreground text-sm">Preview</p>
                    <Image
                      src={previewUrl}
                      alt="Selected image preview"
                      className="mt-2 max-h-64 w-auto rounded-md object-contain"
                      width={100}
                      height={100}
                    />
                  </div>
                )}

                {/* Is Published */}
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={!editPublished} // inverse: checked means "draft"
                    onCheckedChange={
                      (checked) => handleInputChange("published", !checked) // invert the value
                    }
                  />
                  <Label htmlFor="published">Mark as draft</Label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Post"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link
                    href={`/member-dashboard/community-blog/${postId}`}
                    className="flex-1"
                  >
                    Cancel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </main>
  );
}
