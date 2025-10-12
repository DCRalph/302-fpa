"use client";

import { useAuth } from "~/hooks/useAuth";
import { redirect } from "next/navigation";
import OnboardingComponent from "./Onboarding";

export default function OnboardingPage() {
  const { session, dbUser, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    redirect("/signin");
  }

  // If already onboarded, redirect to member dashboard
  if (dbUser?.onboardedAt) {
    redirect("/");
  }

  return <OnboardingComponent />;
}
