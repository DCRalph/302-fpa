"use client";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useAuth } from "~/hooks/useAuth";
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
          <Card className="relative overflow-hidden border border-primary/30 bg-gradient-to-br from-blue-50/70 to-purple-50/70 dark:from-blue-950/20 dark:to-purple-950/20 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            {/* Decorative gradient ring */}
            <div
              className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 blur-2xl"
              aria-hidden
            />
            {/* Subtle animated corner glow */}
            <div
              className="pointer-events-none absolute bottom-0 left-0 h-16 w-16 bg-gradient-to-tr from-primary/20 to-transparent animate-pulse"
              aria-hidden
            />

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-2 ring-1 ring-primary/20">
                    {/* Replace with your preferred icon */}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7l3-7z" />
                    </svg>
                  </div>
                  <CardTitle className="text-base font-bold tracking-tight">
                    Membership Status
                  </CardTitle>
                </div>
              </div>

              {/* Subheading line */}
              <p className="mt-2 text-xs text-muted-foreground">
                Your account is in good standing.
              </p>
            </CardHeader>

            <CardContent className="space-y-5 break-words">
              <div className="grid grid-cols-1 gap-4">
                {/* Joined */}
                <div className="rounded-lg border border-border/60 bg-background/50 p-3 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Joined
                  </div>
                  <div className="font-medium">
                    {dbUser?.createdAt.toLocaleDateString("en-US")}
                  </div>
                </div>

                {/* User ID */}
                <div className="group relative rounded-lg border border-border/60 bg-background/50 p-3 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    User ID
                  </div>
                  <div className="font-medium truncate">{dbUser?.id}</div>
                  {/* Copy button (optional, requires a button component if you want interactivity) */}
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(dbUser?.id ?? "")}
                    className="absolute right-2 top-2 rounded-md border border-transparent px-2 py-1 text-[10px] text-muted-foreground hover:bg-muted/60"
                  >
                    Copy
                  </button>
                </div>

                {/* Role */}
                <div className="rounded-lg border border-border/60 bg-background/50 p-3 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
                  <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Role
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary/70" />
                    <span className="font-medium capitalize">{dbUser?.role}</span>
                  </div>
                </div>
              </div>

              {/* Subtle footer hint */}
              <div className="mt-2 flex flex-col gap-1 ">
                <div className="text-xs text-muted-foreground break-words">
                  ID and role are used for access verification.
                </div>
                <div className="text-xs text-muted-foreground break-words">
                  Last updated:{" "}
                  {format(new Date(), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
