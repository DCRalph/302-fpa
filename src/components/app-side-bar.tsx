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
  CalendarCog,
  BookOpen,
  FileText,
  User,
  GraduationCap,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "~/lib/auth";
import { usePathname } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { useState, useEffect } from "react";

// Menu items
const menuItems = [
  // "USER" items
  {
    title: "Dashboard",
    url: "/member-dashboard",
    icon: LayoutDashboard,
    role: "USER",
  },
  {
    title: "Conference Registration",
    url: "#",
    icon: Calendar,
    role: "USER",
  },

  {
    title: "My Files",
    url: "#",
    icon: FileText,
    role: "USER",
  },
  // "ADMIN" items
  {
    title: "Admin Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
    role: "ADMIN",
  },
  {
    title: "Manage Members",
    url: "#",
    icon: Users,
    role: "ADMIN",
  },
  {
    title: "Manage Conferences",
    url: "#",
    icon: CalendarCog,
    role: "ADMIN",
  },
  // Common items
  {
    title: "Community Blog",
    url: "#",
    icon: BookOpen,
  },
  {
    title: "My Profile",
    url: "#",
    icon: User,
  },
];

export function AppSideBar() {
  const { dbUser } = useAuth();
  const pathname = usePathname();
  const {
    state,
    // isMobile,
    // openMobile,
    // setOpenMobile,
  } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(state === "collapsed");

  useEffect(() => {
    setIsCollapsed(state === "collapsed");
  }, [state]);

  if (!dbUser) return null;

  const isActive = (path: string) => {
    if (path === "/admin") return pathname === "/admin";
    return pathname?.startsWith(path) ?? false;
  };
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
            {/* <SidebarContent> */}
            <SidebarMenu>
              {menuItems.map(
                (item) =>
                  (item.role === dbUser.role || !item.role) && (
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
                  ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
