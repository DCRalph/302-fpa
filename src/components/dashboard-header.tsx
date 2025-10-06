"use client";

import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { cabin } from "./fonts";
import { UserDropdown } from "./user-dropdown";

export function DashboardHeader() {
  return (
    <nav className="sticky top-0 z-50 bg-sidebar/90 backdrop-blur-sm w-full h-16 border-b">
      <div className=" mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger size={"icon"} className="" />
          <Separator orientation="vertical" className="!h-8" />
          <h1 className={`${cabin.className} text-2xl`}>Dashboard</h1>
        </div>

        <UserDropdown />
      </div>
    </nav>
  );
}
