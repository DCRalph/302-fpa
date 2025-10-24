"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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

export default function CreatePostPage() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  // Individual form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);

  // Load categories to populate select and map slug -> id
  const { data: categories } = api.member.blog.getCategories.useQuery();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedImageId, setUploadedImageId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const utils = api.useUtils();

  const attachToBlogPostMutation = api.member.files.attachToBlogPost.useMutation();

  // Upload image mutation
  const uploadImageMutation = api.member.files.uploadBlogImage.useMutation({
    onSuccess: (data) => {
      setUploadedImageId(data.fileId);
      setCoverImageUrl(`/api/files/blog-image/${data.fileId}`);
      setIsUploadingImage(false);
      toast.success("Image uploaded successfully");
    },
    onError: (error) => {
      setIsUploadingImage(false);
      toast.error(error.message ?? "Failed to upload image");
    },
  });

  const createPostMutation = api.member.blog.createPost.useMutation({
    onSuccess: async (post) => {
      // If an image was uploaded before creating the post, attach it to the newly-created post
      try {
        if (uploadedImageId) {
          await attachToBlogPostMutation.mutateAsync({
            fileId: uploadedImageId,
            postId: post.id,
          });
        }

        // Invalidate blog list so UI updates
        await utils.member.blog.invalidate();

        toast.success("Post created successfully");
        router.push("/member-dashboard/community-blog");
      } catch (e) {
        // If attach fails, still navigate but show an error toast
        toast.error(`Post created but failed to attach image: ${e as string}`);
        router.push("/member-dashboard/community-blog");
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to create post");
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
        setTitle(value as string);
        break;
      case "content":
        setContent(value as string);
        break;
      case "published":
        setPublished(value as boolean);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title for the post");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter content for the post");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a category for the post");
      return;
    }

    setIsSubmitting(true);

    createPostMutation.mutate({
      title,
      content,
      published,
      categoryId: selectedCategory,
      coverImageUrl: coverImageUrl ?? undefined,
    });
  };

  // Set default category when categories load
  useEffect(() => {
    if (categories && categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]?.id ?? "");
    }
  }, [categories, selectedCategory]);

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
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
      setUploadedImageId(null);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setUploadedImageId(null);
    setCoverImageUrl(null);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            {/* Header */}
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Create New Post
              </CardTitle>
              <CardDescription className="text-base">
                Share something with the community — write a title and some
                content.
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
                    value={title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>

                {/* Post Type */}
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                  value={content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
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

                {/* Image Preview */}
                {previewUrl && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm">Preview</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                      >
                        Remove
                      </Button>
                    </div>
                    <Image
                      src={previewUrl}
                      alt="Selected image preview"
                      className="mt-2 max-h-64 w-auto rounded-md object-contain"
                      width={100}
                      height={100}
                    />
                    {uploadedImageId && (
                      <p className="text-xs text-green-600">✓ Image uploaded successfully</p>
                    )}
                  </div>
                )}

                {/* Is Published */}
                <div className="mt-4 flex items-center space-x-2">
                  <Checkbox
                    id="published"
                    checked={!published} // inverse: checked means "draft"
                    onCheckedChange={(checked) =>
                      handleInputChange("published", !checked) // invert the value
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
                  {isSubmitting ? "Creating..." : "Create Post"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link
                    href="/member-dashboard/community-blog"
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
