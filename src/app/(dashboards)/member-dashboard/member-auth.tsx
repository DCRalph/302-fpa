"use client"

import { redirect } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";

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

  return null;
}
