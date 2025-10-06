"use client";

import { useAuth } from "~/lib/useAuth";
import { redirect } from "next/navigation";
import OnboardingComponent from "./Onboarding";

export default function OnboardingPage() {
  const { stackUser, dbUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!stackUser || !dbUser) {
    redirect("/signin");
  }

  // If already onboarded, redirect to member dashboard
  if (dbUser?.onboardedAt) {
    redirect("/");
  }

  return <OnboardingComponent />;
}
