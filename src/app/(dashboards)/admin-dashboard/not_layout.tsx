import { LayoutWithSideBarHeader } from "~/components/layout-with-sideBar-header";
import { AdminSideBar } from "~/components/admin/admin-sidebar";
import { DashboardHeader } from "~/components/dash-header";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWithSideBarHeader sidebar={<AdminSideBar />} header={<DashboardHeader />} >
      {children}
    </LayoutWithSideBarHeader>
  );
}
