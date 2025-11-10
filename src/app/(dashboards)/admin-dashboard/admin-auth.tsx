"use client"


import { redirect } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";
// import { getClientSession } from "~/lib/getClientSession";

export function AdminAuth() {
  const { session, dbUser, isPending } = useAuth();
  // const { session, isPending } = getClientSession();

  if (isPending) {
    return null;
  }

  if (!session) {
    redirect("/signin");
  }

  if (dbUser?.role !== "ADMIN") {
    redirect("/");
  }

  if (!dbUser?.onboardedAt) {
    redirect("/onboarding");
  }

  return null;
}
