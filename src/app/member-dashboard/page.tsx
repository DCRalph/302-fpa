"use client";

import { useUser } from "@stackframe/stack";

export default function MemberDashboardPage() {
    const user = useUser({ or: "redirect" });
    
    return (
        <main className="bg-background text-foreground min-h-screen flex">
            
            <div className="container mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-6">Member Dashboard</h1>
                <p>Welcome to your dashboard! Here you can manage your profile, view conference details, and access exclusive member resources.</p>
                {/* Add more dashboard components and features here */}
            </div>
        </main>
    );
}