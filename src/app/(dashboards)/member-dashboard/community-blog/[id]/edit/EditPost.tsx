"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
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


  // Editing state - initialize from query params
  const [editTitle, setEditTitle] = useState(post?.title);
  const [editContent, setEditContent] = useState(post?.content);
  const [editPublished, setEditPublished] = useState(post?.published);
  const [editCategoryId, setEditCategoryId] = useState(
    post?.categoryId ?? null,
  );

  // const [selectedFilter, setSelectedFilter] = useState("general");

  // Load available categories so we can map slug -> id
  const { data: categories } = api.member.blog.getCategories.useQuery();

  // Populate form when post data is loaded
  useEffect(() => {
    if (post) {
      // const slug = post.category?.slug ?? "general";
      // setSelectedFilter(slug);

      setEditTitle(post.title);
      setEditContent(post.content);
      setEditPublished(post.published);
      setEditCategoryId(post.categoryId ?? null);
    }
  }, [post]);



  // Keep selectedFilter in sync if formData.postType changes (e.g. user or post updates)
  // (removed stale formData sync) selectedFilter is initialized from post above

  // When selectedFilter changes, map it to category id so the mutation uses the correct id
  // useEffect(() => {
  //   if (!categories || !selectedFilter) return;

  //   const match = categories.find((c) => c.slug === selectedFilter);
  //   if (match) {
  //     // single-select: set editCategoryId to the selected category id
  //     setEditCategoryId(match.id);
  //   } else if (selectedFilter === "all-posts") {
  //     // no-op: keep existing selection
  //   } else {
  //     // fallback: if slug not found, do nothing
  //   }
  // }, [selectedFilter, categories]);

  // If categories load after we initialize editCategoryIds, ensure selectedFilter
  // points to a slug that actually exists in categories. This covers cases where
  // the Select renders before categories are available and would otherwise show blank.
  // useEffect(() => {
  //   if (!categories || categories.length === 0) return;

  //   // If the currently selectedFilter doesn't match any loaded category slug,
  //   // but we have an editCategoryId value from the post, map that id -> slug.
  //   const hasSlugMatch = categories.some((c) => c.slug === selectedFilter);
  //   if (!hasSlugMatch && editCategoryId) {
  //     const matchById = categories.find((c) => c.id === editCategoryId);
  //     if (matchById) {
  //       setSelectedFilter(matchById.slug);
  //     }
  //   }
  // }, [categories, editCategoryId, selectedFilter]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const utils = api.useUtils();

  // Upload image mutation
  const uploadImageMutation = api.member.files.uploadBlogImage.useMutation({
    onSuccess: (data) => {
      setUploadedImageId(data.fileId);
      setIsUploadingImage(false);
      post.coverImageUrl = data.downloadUrl;
      toast.success("Image uploaded successfully");
    },
    onError: (error) => {
      setIsUploadingImage(false);
      toast.error(error.message ?? "Failed to upload image");
    },
  });

  // Delete blog images mutation
  const deleteBlogImagesMutation = api.member.blog.deleteBlogImages.useMutation({
    onSuccess: () => {
      setPreviewUrl(null);
      // setCoverImageRemoved(true);
      post.coverImageUrl = null;
      toast.success("Image deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete image");
    },
  });

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

    if (!editCategoryId) {
      toast.error("Please select a category for the post");
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
      categoryId: editCategoryId,
      // coverImageUrl: coverImageUrl ?? undefined,
    });
  };

  // Handle image file selection and upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Upload image immediately
      setIsUploadingImage(true);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/...;base64, prefix

        uploadImageMutation.mutate({
          filename: file.name,
          mimeType: file.type,
          data: base64Data ?? "",
          sizeBytes: file.size,
          blogPostId: postId,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      setUploadedImageId(null);
    }
  };

  // Remove current image
  const handleRemoveCurrentImage = () => {
    deleteBlogImagesMutation.mutate({ postId });
  };

  // Remove new image
  const handleRemoveNewImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadedImageId(null);
    // Don't clear coverImageUrl here - keep the original if it exists
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Initialize preview with current image
  useEffect(() => {
    if (post?.coverImageUrl && !previewUrl) {
      setPreviewUrl(post.coverImageUrl);
    }
  }, [post?.coverImageUrl, previewUrl]);

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
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={editCategoryId ?? ""}
                    onValueChange={(val) => {
                      setEditCategoryId(val);
                    }}
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={10}
                  required
                />
              </div>

              {/* Post Cover Image */}
              <div className="space-y-2">
                <Label htmlFor="image">Image (Optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer rounded-md file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1 file:font-semibold"
                  onChange={handleImageChange}
                  disabled={isUploadingImage}
                />

                {/* Upload Status */}
                {isUploadingImage && (
                  <p className="text-sm text-muted-foreground">Uploading image...</p>
                )}

                {/* Current Image - Show when there's an existing image and no new upload */}
                {post?.coverImageUrl && !uploadedImageId && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">Current Image</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveCurrentImage}
                        disabled={deleteBlogImagesMutation.isPending}
                      >
                        {deleteBlogImagesMutation.isPending ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                    <Image
                      src={post.coverImageUrl}
                      alt="Current image"
                      className="mt-2 max-h-64 w-auto rounded-md object-contain"
                      width={100}
                      height={100}
                    />
                  </div>
                )}

                {/* New Image Preview - Show when user has uploaded a new image */}
                {previewUrl && uploadedImageId && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">
                        {post?.coverImageUrl ? "New Image (will replace current)" : "New Image Preview"}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveNewImage}
                        disabled={isUploadingImage}
                      >
                        Remove
                      </Button>
                    </div>
                    <Image
                      src={previewUrl}
                      alt="New image preview"
                      className="mt-2 max-h-64 w-auto rounded-md object-contain"
                      width={100}
                      height={100}
                    />
                    <p className="text-xs text-green-600">✓ New image uploaded successfully</p>
                    {post?.coverImageUrl && (
                      <p className="text-xs text-amber-600">⚠️ This will replace the current image</p>
                    )}
                  </div>
                )}

                {/* No Image State - Only show when not uploading */}
                {!post?.coverImageUrl && !uploadedImageId && !isUploadingImage && (
                  <div className="mt-2 p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                    <p className="text-muted-foreground text-sm">No image selected</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload an image to add a cover photo</p>
                  </div>
                )}

                {/* Is Published */}
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={!editPublished} // inverse: checked means "draft"
                    onCheckedChange={
                      (checked) => setEditPublished(!checked) // invert the value
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
