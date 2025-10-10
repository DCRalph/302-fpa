"use client";

import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { useAuth } from "~/hooks/useAuth";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function ProfessionalTab() {
  const { dbUser } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();


  const memberProfileMutation = api.member.profile.update.useMutation({
    onSuccess: async () => {
      // invalidate profile and auth.me cache so UI updates
      await utils.member.profile.get.invalidate();
      await utils.member.blog.invalidate();
      await utils.auth.me.invalidate();

      toast.success("Professional Profile updated successfully");
      router.push("/member-dashboard/profile");
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to update Professional Profile");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const [formData, setFormData] = useState({
    professionalPosition: dbUser?.professionalPosition,
    professionalYears: dbUser?.professionalYears,
    professionalQualification: dbUser?.professionalQualification,
    professionalSpecialisation: dbUser?.professionalSpecialisation,
    professionalBio: dbUser?.professionalBio,
  });


  useEffect(() => {
    setFormData({
      professionalPosition: dbUser?.professionalPosition ?? "",
      professionalYears: dbUser?.professionalYears ?? undefined,
      professionalQualification: dbUser?.professionalQualification ?? "",
      professionalSpecialisation: dbUser?.professionalSpecialisation ?? "",
      professionalBio: dbUser?.professionalBio ?? "",
    });
  }, [dbUser]);

  const handleInputChange = (
    field: string,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    console.log("Updating profile details:", formData);

    memberProfileMutation.mutate({
      professionalPosition: formData?.professionalPosition ?? undefined,
      professionalYears: formData?.professionalYears ?? undefined,
      professionalQualification:
        formData?.professionalQualification ?? undefined,
      professionalSpecialisation:
        formData?.professionalSpecialisation ?? undefined,
      professionalBio: formData?.professionalBio ?? undefined,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Professional Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="professionalPosition">Position</Label>
                <Input
                  id="professionalPosition"
                  placeholder="e.g., Principal, Deputy Principal"
                  value={`${formData.professionalPosition ?? ""}`}
                  onChange={(e) =>
                    handleInputChange("professionalPosition", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalYears">Years of Experience</Label>
                <Input
                  id="professionalYears"
                  placeholder="e.g., 15"
                  value={`${formData.professionalYears ?? ""}`}
                  onChange={(e) =>
                    handleInputChange("professionalYears", Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="professionalQualification">Highest Qualification</Label>
                <Input
                  id="professionalQualification"
                  placeholder="e.g., Master of Education"
                  value={`${formData.professionalQualification ?? ""}`}
                  onChange={(e) =>
                    handleInputChange("professionalQualification", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalSpecialisation">Specialization</Label>
                <Input
                  id="professionalSpecialisation"
                  placeholder="e.g., Educational Leadership"
                  value={`${formData.professionalSpecialisation ?? ""}`}
                  onChange={(e) =>
                    handleInputChange("professionalSpecialisation", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalBio">Professional Bio</Label>
              <Textarea
                id="professionalBio"
                className="min-h-[120px] w-full rounded-md border px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Tell us about your professional background and experience..."
                value={`${formData.professionalBio ?? ""}`}
                onChange={(e) => handleInputChange("professionalBio", e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Professional Profile"}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
