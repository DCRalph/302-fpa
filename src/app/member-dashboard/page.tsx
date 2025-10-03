"use client";

import { useAuth } from "~/lib/auth";
import { redirect } from "next/navigation";
import MemberDashboard from "./Member";

export default function MemberDashboardPage() {
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


    return <MemberDashboard />;
}