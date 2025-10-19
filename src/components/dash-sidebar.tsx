"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FileText,
  User,
  GraduationCap,
  Users,
  CalendarCog,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import { getClientSession } from "~/lib/getClientSession";

// Member-specific menu items
const memberMenuItems = [
  {
    title: "Dashboard",
    url: "/member-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Conference Registration",
    url: "/member-dashboard/conference-registration",
    icon: Calendar,
  },
  {
    title: "My Files",
    url: "/member-dashboard/my-files",
    icon: FileText,
  },
  {
    title: "Community Blog",
    url: "/member-dashboard/community-blog",
    icon: BookOpen,
  },
  {
    title: "My Profile",
    url: "/member-dashboard/profile",
    icon: User,
  },
];

const adminMenuItems = [
  {
    title: "Admin Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Members",
    url: "/admin-dashboard/manage-members",
    icon: Users,
  },
  {
    title: "Manage Conferences",
    url: "/admin-dashboard/manage-conferences",
    icon: CalendarCog,
  },
  {
    title: "Activity",
    url: "/admin-dashboard/activity",
    icon: Activity,
  },
  {
    title: "Reports",
    url: "/admin-dashboard/reports",
    icon: FileText,
  }
];

export function DashboardSideBar() {
  const { session } = getClientSession();
  const pathname = usePathname();
  const { state } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(state === "collapsed");

  useEffect(() => {
    setIsCollapsed(state === "collapsed");
  }, [state]);

  const isActive = (path: string) => {
    if (path === "/member-dashboard") return pathname === "/member-dashboard";
    if (path === "/admin-dashboard") return pathname === "/admin-dashboard";
    return pathname?.startsWith(path) ?? false;
  };

  const [menuItems, setMenuItems] = useState(memberMenuItems);

  useEffect(() => {
    if (pathname.startsWith("/admin-dashboard")) {
      setMenuItems(adminMenuItems);
    } else {
      setMenuItems(memberMenuItems);
    }
  }, [pathname]);

  return (
    <div className="relative h-screen">
      <Sidebar collapsible="icon" className="fixed top-0 left-0">
        <SidebarHeader>
          <div
            className={`transition-all duration-300 ${isCollapsed ? "pt-1" : "p-1"} flex items-center gap-2 text-lg font-bold`}
          >
            <div
              className={`grid ${isCollapsed ? "size-8" : "size-11"} place-items-center ${isCollapsed ? "rounded-lg" : "rounded-2xl"} from-gradient-blue via-gradient-purple to-gradient-red to text-primary-foreground bg-gradient-to-br from-25% via-50% to-75% shadow-lg transition-shadow duration-300 group-hover:shadow-xl`}
            >
              <GraduationCap
                size={isCollapsed ? 16 : 24}
                className="drop-shadow-sm"
              />
            </div>
            {!isCollapsed && (
              <div>
                <p>FPA Conference</p>
                <p className="text-muted-foreground text-sm font-medium">
                  {new Date().getFullYear()}
                </p>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="no-scrollbar overflow-x-hidden overflow-y-scroll!">
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarMenu>
              {!session ? (
                // Loading state
                <>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <SidebarMenuItem key={i}>
                      <div className="flex items-center gap-2 px-2 py-2">
                        <Skeleton className="size-4 rounded" />
                        {!isCollapsed && (
                          <Skeleton className="h-4 w-32 rounded" />
                        )}
                      </div>
                    </SidebarMenuItem>
                  ))}
                </>
              ) : (
                // Loaded state
                menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
