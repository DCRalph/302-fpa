"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: true,
    postType: ""
  });
  const [selectedFilter, setSelectedFilter] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null); // TODO: Create an S3 bucket to upload images to
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const utils = api.useUtils();

  const createPostMutation = api.member.blog.createPost.useMutation({
    onSuccess: async () => {
      // Invalidate profile and auth.me cache so UI updates
      await utils.member.blog.invalidate()

      toast.success("Post created successfully");
      router.push("/member-dashboard/community-blog");
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title for the post");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter content for the post");
      return;
    }

    setIsSubmitting(true);

    // NOTE: image upload is not wired to the backend yet. If you have an
    // endpoint for uploads, upload `imageFile` first and include the image URL
    // in the mutation payload. For now we send the basic post data only.
    createPostMutation.mutate({
      title: formData.title,
      content: formData.content,
      published: formData.published,
      // image: uploadedImageUrl ?? undefined,
    });

    router.push("/member-dashboard/community-blog");
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
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                
                {/* Post Type */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Post Type<span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={selectedFilter}
                    onValueChange={setSelectedFilter}
                  >
                    <SelectTrigger className="bg-background w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="qualification">
                        Qualification
                      </SelectItem>
                      <SelectItem value="research-paper">
                        Research Paper
                      </SelectItem>
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
                  value={formData.content}
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
                    checked={!formData.published} // inverse: checked means "draft"
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
