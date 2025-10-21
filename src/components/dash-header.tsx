"use client";

import { SidebarTrigger } from "./ui/sidebar";
import { Separator } from "./ui/separator";
import { cabin } from "./fonts";
import { UserDropdown } from "./user-dropdown";
import { usePathname } from "next/navigation";

// Map base paths to display names
const pageNamesMap: Record<string, string> = {
  "/admin-dashboard/manage-conferences": "Manage Conferences",
  "/admin-dashboard/payments": "Payments",
  "/admin-dashboard/manage-members": "Manage Members",
  "/admin-dashboard/activity": "Activity",
  "/admin-dashboard/emails": "Emails",
  "/admin-dashboard/files": "Files",
  "/admin-dashboard/reports": "Reports",
  "/admin-dashboard": "Admin Dashboard",

  "/member-dashboard/community-blog/create-post": "Create Post",
  "/member-dashboard/community-blog": "Community Blog",
  "/member-dashboard/conference-registration": "Conference Registration",
  "/member-dashboard/my-files": "My Files",
  "/member-dashboard/profile": "Profile",
  "/member-dashboard": "Dashboard",
};

function normalizePath(p?: string): string {
  if (!p) return "/";
  // remove query/hash, decode, remove trailing slash except for root
  const cleaned = decodeURI(p.split(/[?#]/)[0]!);
  return cleaned.length > 1 && cleaned.endsWith("/")
    ? cleaned.slice(0, -1)
    : cleaned;
}

export function DashboardHeader() {
  const rawPath = usePathname();
  const pathname = normalizePath(rawPath);

  // Find the best matching path key (partial match support)
  const matchingEntry = Object.entries(pageNamesMap).find(([key]) =>
    pathname.startsWith(key),
  );

  // Use the match if found, otherwise default
  const pageName = matchingEntry ? matchingEntry[1] : "Dashboard";

  return (
    <nav className="bg-background/50 sticky top-0 z-50 h-16 w-full border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <SidebarTrigger size={"icon"} className="" />
          <Separator orientation="vertical" className="!h-8" />
          <h1 className={`${cabin.className} text-2xl`}>{pageName}</h1>
        </div>

        <UserDropdown detailed />
      </div>
    </nav>
  );
}
