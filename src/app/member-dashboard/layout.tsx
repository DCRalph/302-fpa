import { LayoutWithSideBarHeader } from "~/components/layout-with-sideBar-header";
import { AppSideBar } from "~/components/app-side-bar";
import { DashboardHeader } from "~/components/dashboard-header";

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutWithSideBarHeader sidebar={<AppSideBar />} header={<DashboardHeader />}  >
      {children}
    </LayoutWithSideBarHeader>
  );
}
