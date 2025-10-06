"use client";

import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { cabin } from "./fonts";
import { UserDropdown } from "./user-dropdown";
import {usePathname} from "next/navigation";

const pageNamesMap = {
  "/admin-dashboard": "Admin Dashboard",
  "/admin-dashboard/users": "Users",
  "/admin-dashboard/conference": "Conference",
  "/admin-dashboard/payments": "Payments",

  "/member-dashboard": "Dashboard",
  "/member-dashboard/conference-registration": "Conference Registration",
  "/member-dashboard/profile": "Profile",
}

export function DashboardHeader() {
  const pathname = usePathname();
  const pageName = pageNamesMap[pathname as keyof typeof pageNamesMap] || "Dashboard";
  

  return (
    <nav className="sticky top-0 z-50 bg-sidebar/90 backdrop-blur-sm w-full h-16 border-b">
      <div className=" mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger size={"icon"} className="" />
          <Separator orientation="vertical" className="!h-8" />
          <h1 className={`${cabin.className} text-2xl`}>{pageName}</h1>
        </div>

        <UserDropdown />
      </div>
    </nav>
  );
}
