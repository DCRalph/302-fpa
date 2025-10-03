"use client";

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboard from "./Admin";

export default function AdminDashboardPage() {
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

  if (!dbUser?.onboardedAt) {
    redirect("/onboarding");
  }

  if (dbUser?.role !== "ADMIN") {
    redirect("/member-dashboard");
  }

  return <AdminDashboard />;
}
