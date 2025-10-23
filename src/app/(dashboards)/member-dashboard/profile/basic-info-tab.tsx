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
import { useRouter } from 'nextjs-toploader/app';
import { Copy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

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
          <Card className="border-primary/30 relative overflow-hidden border bg-gradient-to-br from-blue-50/70 to-purple-50/70 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:from-blue-950/20 dark:to-purple-950/20">
            {/* Decorative gradient ring */}
            <div
              className="from-primary/20 pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-gradient-to-br to-purple-500/20 blur-2xl"
              aria-hidden
            />
            {/* Subtle animated corner glow */}
            <div
              className="from-primary/20 pointer-events-none absolute bottom-0 left-0 h-16 w-16 animate-pulse bg-gradient-to-tr to-transparent"
              aria-hidden
            />

            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 ring-primary/20 rounded-md p-2 ring-1">
                    {/* Replace with your preferred icon */}
                    <svg
                      viewBox="0 0 24 24"
                      className="text-primary h-5 w-5"
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
              <p className="text-muted-foreground mt-2 text-sm">
                Your account is in good standing.
              </p>
            </CardHeader>

            <CardContent className="space-y-5 break-words">
              <div className="grid grid-cols-1 gap-4">
                {/* Joined */}
                <div className="border-border/60 shadow-sm bg-background/50 rounded-lg border p-3">
                  <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
                    Joined
                  </div>
                  <div className="font-medium">
                    {dbUser?.createdAt.toLocaleDateString("en-US")}
                  </div>
                </div>

                {/* User ID */}
                <div className="group border-border/60 bg-background/50 relative rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
                        User ID
                      </div>
                      <div className="flex items-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-help truncate font-medium min-w-0">
                              {dbUser?.id}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>User ID:</p>
                            <p>{dbUser?.id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant={"ghost"}
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(dbUser?.id ?? "")
                        }
                        className="text-muted-foreground hover:bg-muted/60 rounded-md border border-transparent px-1 py-1 text-[10px]"
                      >
                        <Copy />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="border-border/60 shadow-sm bg-background/50 rounded-lg border p-3">
                  <div className="text-muted-foreground mb-1 text-xs tracking-wide uppercase">
                    Role
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-primary/70 h-2 w-2 rounded-full" />
                    <span className="font-medium capitalize">
                      {dbUser?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtle footer hint */}
              <div className="mt-2 flex flex-col gap-1">
                <div className="text-muted-foreground text-xs break-words">
                  ID and role are used for access verification.
                </div>
                <div className="text-muted-foreground text-xs break-words">
                  Last updated: {format(new Date(), "MMM d, yyyy")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
