"use client"

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";

export function AdminAuth() {
  const { stackUser, dbUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!stackUser || !dbUser) {
    redirect("/signin");
  }
}
