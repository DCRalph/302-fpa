"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarSeparator } from "./ui/sidebar";
import { LayoutDashboard, Calendar, BookOpen, FileText, User, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "~/lib/auth";
import { usePathname } from "next/navigation";
import { useSidebar } from "./ui/sidebar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

// Menu items

const menuItems = [
    {
        title: "Dashboard",
        url: "/member-dashboard",
        icon: LayoutDashboard
    },
    {
        title: "Conference Registration",
        url: "#",
        icon: Calendar
    },
    {
        title: "Community Blog",
        url: "#",
        icon: BookOpen
    },
    {
        title: "My Files",
        url: "#",
        icon: FileText
    },
    {
        title: "My Profile",
        url: "#",
        icon: User
    },
]

export function AppSideBar() {
    const { dbUser, stackUser } = useAuth();
    const pathname = usePathname();
    const {
        state,
        // toggleSidebar,
        isMobile,
        openMobile,
        setOpenMobile,
    } = useSidebar();
    const [isCollapsed, setIsCollapsed] = useState(state === "collapsed");

    useEffect(() => {
        setIsCollapsed(state === "collapsed");
    }, [state]);

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!dbUser) return null;

    const isActive = (path: string) => {
        if (path === "/admin") return pathname === "/admin";
        return pathname?.startsWith(path) ?? false;
    };
    return (
        <div className="relative h-screen">

            <Sidebar collapsible="icon" className="fixed top-0 left-0">
                <SidebarHeader className="relative flex items-center justify-between h-16">
                    <div className="p-2 text-lg font-bold flex items-center gap-2">
                        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-gradient-blue from-25% via-gradient-purple via-50% to-gradient-red to-75% to text-primary-foreground shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                            <GraduationCap size={24} className="drop-shadow-sm" />
                        </div>
                        <div>
                            <p>FPA Conference</p>
                            <p className="text-sm text-muted-foreground font-medium">{new Date().getFullYear()}</p>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarSeparator />
                <SidebarContent className="no-scrollbar overflow-x-hidden overflow-y-scroll!">
                    <SidebarGroup>
                        <SidebarGroupLabel>Application</SidebarGroupLabel>
                        {/* <SidebarContent> */}
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>

            </Sidebar>
        </div>
    )
}