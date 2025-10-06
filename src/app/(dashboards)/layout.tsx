import { LayoutWithSideBarHeader } from "~/components/layout-with-sideBar-header";
import { DashboardSideBar } from "~/components/dash-sidebar";
import { DashboardHeader } from "~/components/dash-header";

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWithSideBarHeader sidebar={<DashboardSideBar />} header={<DashboardHeader />}  >
      {children}
    </LayoutWithSideBarHeader>
  );
}
