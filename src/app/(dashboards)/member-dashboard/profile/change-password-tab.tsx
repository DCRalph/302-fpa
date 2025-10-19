"use client";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useRouter } from 'nextjs-toploader/app';
import { useState } from "react";

export function ChangePasswordTab() {
  const utils = api.useUtils();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberProfileMutation = api.member.profile.changePassword.useMutation({
    onSuccess: async () => {
      // invalidate profile and auth.me cache so UI updates
      await utils.member.profile.get.invalidate();
      await utils.auth.me.invalidate();

      toast.success("Password updated successfully");
      router.push("/member-dashboard/profile");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update password");
    },
    onSettled: () => {
      setIsSubmitting(false);
    }
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    console.log("Updating profile details:", formData);

    if (formData?.newPassword == formData?.confirmPassword) {
      memberProfileMutation.mutate({
        newPassword: formData?.newPassword,
        currentPassword: formData?.currentPassword,
      });
    } else {
      toast.error("Confirm Password must match New Password");
    }
  };
  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={formData?.currentPassword}
                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData?.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={formData?.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                />
              </div>

              <div className="border-primary rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:from-blue-950/20 dark:to-purple-950/20">
                <h4 className="mb-2 font-medium">Password Requirements:</h4>
                <ul className="text-foreground list-disc space-y-1 pl-4 text-sm">
                  <li>At least 8 characters long</li>
                  <li>Contains at least one uppercase letter</li>
                  <li>Contains at least one lowercase letter</li>
                  <li>Contains at least one number</li>
                </ul>
              </div>

              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Password"}</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
