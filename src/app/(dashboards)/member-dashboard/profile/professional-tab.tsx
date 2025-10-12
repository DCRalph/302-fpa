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
import { number } from "zod";

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

  const [professionalPosition, setProfessionalPosition] = useState("");
  const [professionalYears, setProfessionalYears] = useState("");
  const [professionalQualification, setProfessionalQualification] = useState("");
  const [professionalSpecialisation, setProfessionalSpecialisation] = useState("");
  const [professionalBio, setProfessionalBio] = useState("");


  useEffect(() => {
    if (dbUser) {
      setProfessionalPosition(dbUser?.professionalPosition ?? "");
      setProfessionalYears(dbUser?.professionalYears?.toString() ?? "");
      setProfessionalQualification(dbUser?.professionalQualification ?? "");
      setProfessionalSpecialisation(dbUser?.professionalSpecialisation ?? "");
      setProfessionalBio(dbUser?.professionalBio ?? "");
    }
  }, [dbUser]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    console.log("Updating profile details:", {
      professionalPosition,
      professionalYears,
      professionalQualification,
      professionalSpecialisation,
      professionalBio,
    });

    memberProfileMutation.mutate({
      professionalPosition: professionalPosition,
      professionalYears: professionalYears,
      professionalQualification: professionalQualification,
      professionalSpecialisation: professionalSpecialisation,
      professionalBio: professionalBio,
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
                  value={professionalPosition}
                  onChange={(e) => setProfessionalPosition(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalYears">Years of Experience</Label>
                <Input
                  id="professionalYears"
                  placeholder="e.g., 15"
                  value={professionalYears}
                  onChange={(e) => setProfessionalYears(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="professionalQualification">Highest Qualification</Label>
                <Input
                  id="professionalQualification"
                  placeholder="e.g., Master of Education"
                  value={professionalQualification}
                  onChange={(e) => setProfessionalQualification(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalSpecialisation">Specialization</Label>
                <Input
                  id="professionalSpecialisation"
                  placeholder="e.g., Educational Leadership"
                  value={professionalSpecialisation}
                  onChange={(e) => setProfessionalSpecialisation(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalBio">Professional Bio</Label>
              <Textarea
                id="professionalBio"
                className="min-h-[120px] w-full rounded-md border px-3 py-2 text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Tell us about your professional background and experience..."
                value={professionalBio}
                onChange={(e) => setProfessionalBio(e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Professional Profile"}</Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
