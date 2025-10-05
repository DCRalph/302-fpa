import {  SidebarProvider } from "~/components/ui/sidebar";
import { AppSideBar } from "~/components/app-side-bar";
import { DashboardHeader } from "~/components/dashboard-header";

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSideBar />
        <div className="flex flex-col flex-1 overflow-x-hidden">
          <DashboardHeader />
          <main className="">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider >
  );
}