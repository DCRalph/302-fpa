"use client";

import { useUser } from "@stackframe/stack";

export default function AdminDashboardPage() {
  const user = useUser({ or: "redirect" });

  return (
    <main className="bg-background text-foreground flex min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <p>
          Welcome to the Admin Dashboard! Here you can manage conference
          settings, user roles, and oversee all administrative tasks.
        </p>
        {/* Add more dashboard components and features here */}
      </div>
    </main>
  );
}
