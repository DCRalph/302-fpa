import { LayoutWithSideBarHeadder } from "~/components/layout-with-sideBar-headder";
import { AppSideBar } from "~/components/app-side-bar";
import { DashboardHeader } from "~/components/dashboard-header";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWithSideBarHeadder sidebar={<AppSideBar />} headder={<DashboardHeader />} >
      {children}
    </LayoutWithSideBarHeadder>
  );
}
