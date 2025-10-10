"use client";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/useAuth";
import { useState, useEffect } from "react";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function BasicInfoTab() {
  const { dbUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();

  const memberProfileMutation = api.member.profile.update.useMutation({
    onSuccess: async () => {
      // Invalidate profile cache and auth.me so useAuth picks up the updated dbUser
      await utils.member.profile.get.invalidate();
      await utils.auth.me.invalidate();

      toast.success("Basic Information updated successfully");
      // re-route back to profile page (this will now have refreshed data)
      router.push("/member-dashboard/profile");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update Basic Information");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const [formData, setFormData] = useState({
    fullName: dbUser?.name,
    phone: dbUser?.phone,
    school: dbUser?.school,
    email: dbUser?.email,
  });

  // Keep local form state in sync when dbUser updates (after mutation invalidation)
  useEffect(() => {
    setFormData({
      fullName: dbUser?.name ?? "",
      phone: dbUser?.phone ?? "",
      school: dbUser?.school ?? "",
      email: dbUser?.email ?? "",
    });
  }, [dbUser]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    console.log("Updating profile details:", formData);

    memberProfileMutation.mutate({
      name: formData.fullName ?? undefined,
      phone: formData.phone ?? undefined,
      school: formData.school ?? undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={`${formData.fullName}`}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={`${formData.phone}`}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={`${formData.school}`}
                  onChange={(e) => handleInputChange("school", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={`${formData.email}`}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-gray-100"
                  disabled
                />
                <p className="text-muted-foreground text-sm">
                  Email cannot be changed. Contact admin if needed.
                </p>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Basic Information"}
              </Button>
            </CardContent>
          </Card>
        </form>

        {/* Sidebar - Membership Info */}
        <div className="space-y-6">
          <Card className="border-primary bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <CardHeader>
              <CardTitle className="text-foreground text-base font-bold">
                Membership Status
                <div>
                  <Badge className="mt-2">Active</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-semibold">Joined</div>
                <div className="text-sm">
                  {dbUser?.createdAt.toLocaleDateString("en-US")}
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold">User ID</div>
                <div className="text-sm">{dbUser?.id}</div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold">Role</div>
                <div className="text-sm">{dbUser?.role}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
