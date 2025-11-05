"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from 'nextjs-toploader/app';
import { ArrowLeft, Calendar, FileText, User2, Shield } from "lucide-react";
import Link from "next/link";
import { Spinner } from "~/components/ui/spinner";
import DeleteDialog from "~/components/delete-dialog";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const { data: member, isLoading } = api.admin.members.getById.useQuery(
    { id: memberId },
    { enabled: !!memberId },
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "USER" as "USER" | "ADMIN",
    emailVerified: false,
  });

  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Populate form when member data is loaded
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name ?? "",
        email: member.email ?? "",
        phone: member.phone ?? "",
        role: member.role,
        emailVerified: member.emailVerified,
      });
    }
  }, [member]);

  const utils = api.useUtils();
  const updateMemberMutation = api.admin.members.update.useMutation({
    onSuccess: async () => {
      toast.success("Member updated successfully");
      await utils.admin.members.getAll.invalidate();
      await utils.admin.members.getById.invalidate({ id: memberId });
      router.push("/admin-dashboard/manage-members");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update member");
    },
  });

  const deleteMemberMutation = api.admin.members.delete.useMutation({
    onSuccess: async () => {
      toast.success("Member deleted successfully");
      await utils.admin.members.getAll.invalidate();
      router.push("/admin-dashboard/manage-members");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to delete member");
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    updateMemberMutation.mutate({
      id: memberId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      emailVerified: formData.emailVerified,
    });
  };

  const handleDelete = () => {
    deleteMemberMutation.mutate({ id: memberId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-10" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="mb-4 text-2xl font-semibold">Member not found</h2>
        <Link href="/admin-dashboard/manage-members">
          <Button>Back to Members</Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="flex-1 p-3 sm:p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin-dashboard/manage-members">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Members
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Edit Member</h1>
            <p className="text-muted-foreground mt-1">
              Update member details and permissions
            </p>
          </div>
          <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
            {member.role}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Edit Form */}
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>{`Member's personal details`}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter member name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+679 1234567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Role & Permissions */}
            <Card>
              <CardHeader>
                <CardTitle>Role & Permissions</CardTitle>
                <CardDescription>
                  Manage user role and account status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "USER" | "ADMIN") =>
                      handleInputChange("role", value)
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4" />
                          User
                        </div>
                      </SelectItem>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground text-xs">
                    Administrators have full access to manage the system
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailVerified"
                    checked={formData.emailVerified}
                    onCheckedChange={(checked) =>
                      handleInputChange("emailVerified", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="emailVerified"
                    className="text-sm font-normal"
                  >
                    Email verified
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateMemberMutation.isPending}
                className="flex-1"
              >
                {updateMemberMutation.isPending
                  ? "Updating..."
                  : "Update Member"}
              </Button>
              <Link href="/admin-dashboard/manage-members" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Member</p>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete this member account. This action cannot
                    be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  disabled={deleteMemberMutation.isPending}
                  onClick={() => setOpenDeleteDialog(true)}
                >
                  {deleteMemberMutation.isPending
                    ? "Deleting..."
                    : "Delete"}
                </Button>
                <DeleteDialog
                  open={openDeleteDialog}
                  onOpenChange={setOpenDeleteDialog}
                  onDelete={handleDelete}
                  title="Delete this member?"
                  description="This action cannot be undone. This will permanently delete the member account and remove it from the system."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Member Info */}
        <div className="space-y-6">
          {/* Member Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Member Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">
                    Conference Registrations
                  </p>
                  <p className="text-2xl font-bold">
                    {member._count.registrations}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <FileText className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Blog Posts</p>
                  <p className="text-2xl font-bold">
                    {member._count.blogPosts}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-xs">Member Since</p>
                  <p className="font-medium">
                    {new Date(member.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Registrations */}
          {member.registrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Registrations</CardTitle>
                <CardDescription>
                  Latest {member.registrations.length} registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {member.registrations.map((registration) => (
                    <div key={registration.id} className="text-sm">
                      <p className="font-medium">
                        {registration.conference?.name ?? "Conference"}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {registration.status}
                        </Badge>
                        <span>
                          {new Date(
                            registration.createdAt,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Blog Posts */}
          {member.blogPosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Blog Posts</CardTitle>
                <CardDescription>
                  Latest {member.blogPosts.length} posts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {member.blogPosts.map((post) => (
                    <div key={post.id} className="text-sm">
                      <p className="line-clamp-1 font-medium">{post.title}</p>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Badge
                          variant={post.published ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
