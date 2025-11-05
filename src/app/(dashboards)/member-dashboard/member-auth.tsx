"use client"

import { redirect } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
import { toast } from "sonner";

export function MemberAuth() {
  const { session, dbUser, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!session) {
    redirect("/signin");
  }

  if (!dbUser?.onboardedAt) {
    redirect("/onboarding");
  }

  if (!dbUser?.signUpApprovedAt) {
    // toast.error("Your account is not approved yet. Please wait for the admin to approve your account.");
    redirect("/");
  }

  return null;
}

