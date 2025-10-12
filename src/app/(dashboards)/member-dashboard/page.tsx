"use client";

import { useAuth } from "~/hooks/useAuth";
import { redirect } from "next/navigation";
import MemberDashboard from "./Member";

export default function MemberDashboardPage() {
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

    if (!dbUser?.onboardedAt) {
        redirect("/onboarding");
    }


    return <MemberDashboard />;
}