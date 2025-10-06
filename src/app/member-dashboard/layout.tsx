import { SidebarProvider } from "~/components/ui/sidebar";
import { AppSideBar } from "~/components/app-side-bar";
import { DashboardHeader } from "~/components/dashboard-header";

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="bg-page-background flex min-h-screen w-full">
        <AppSideBar />
        <div className="flex flex-1 flex-col overflow-x-hidden">
          <DashboardHeader />
          <main className="">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
