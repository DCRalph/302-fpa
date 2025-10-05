"use client";

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";

export default function MemberDashboardPage() {
    const { stackUser, dbUser, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex  items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!stackUser || !dbUser) {
        redirect("/signin");
    }

    return (
        <main className="bg-background text-foreground flex">

            <div className="container px-6 pt-6">
                <h1 className="text-3xl font-bold mb-6">Member Dashboard</h1>
                <p>Welcome back, {dbUser?.name ?? stackUser?.displayName}!</p>
                <p className="mt-4">Welcome to your dashboard! Here you can manage your profile, view conference details, and access exclusive member resources.</p>

                <div className="mt-8 grid gap-4">
                    <div className="rounded-lg border p-4">
                        <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
                        <p><strong>Name:</strong> {dbUser?.name}</p>
                        <p><strong>Email:</strong> {dbUser?.email}</p>
                        <p><strong>Role:</strong> {dbUser?.role}</p>
                    </div>
                </div>
                {/* Add more dashboard components and features here */}
            </div>
        </main>
    );
}