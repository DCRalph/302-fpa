import { Sidebar, SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSideBar } from "~/components/app-side-bar";
import { Separator } from "~/components/ui/separator";
import { cabin } from "~/components/fonts";
import { UserButton } from "@stackframe/stack";

export default function MemberDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AppSideBar />
            <main className="p-6 w-full">
                <div className="flex justify-between">
                    <div className="flex items-center gap-4 pl-3 ">
                        <SidebarTrigger size={"icon"} className="" />
                        <Separator orientation="vertical" className="!h-5" />
                        <h1 className={`${cabin.className} text-2xl`}>Dashboard</h1>
                    </div>
                    <div>
                        <UserButton showUserInfo={true} />
                    </div>
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}