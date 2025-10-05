"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "~/lib/auth";
import {
    Laptop,
    LogOut,
    Users,
    Bell,
    Tag,
    Mail,
    Smartphone,
    Building2,
    Zap,
    TestTube2,
    Receipt,
    CreditCard,
    Settings,
    List,
    MapPin,
    Terminal,
    Clock,
    ChevronUp,
    Menu,
    X,
    Home,
    Key,
    Package,
    User,
    Code,
    Activity,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
    // SidebarRail,
} from "./ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "~/components/ui/dropdown-menu";
import { setThemeAndPersist, type ThemeSelection } from "~/lib/theme";
import { Sun, Moon, Computer, Check, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";



type NavLink = {
    href: string;
    label: string;
    icon: React.ElementType;
    activeColor: string;
};

export function MemberSidebar() {
    const { dbUser, stackUser } = useAuth();
    const pathname = usePathname();
    const {
        state,
        // toggleSidebar,
        isMobile,
        // open,
        openMobile,
        // setOpen,
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

    const navLinks: NavLink[] = [
        {
            href: "/member-dashboard",
            label: "Dashboard",
            icon: Home,
            activeColor: "text-blue-600",
        },
    ];

    const setThemeAndPersistLocal = async (value: ThemeSelection) => {
        await setThemeAndPersist(value, { user: stackUser, setTheme });
    };

    return (
        <div className="relative h-screen">
            {/* Mobile-only buttons */}
            <div className="md:hidden hidden">
                {/* Open mobile menu button - only visible when menu is closed */}
                {!openMobile && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpenMobile(true)}
                        className="fixed top-3 left-3 z-20 h-10 w-10 rounded-md  bg-sidebar-accent-foreground text-muted-foreground shadow-xs hover:bg-sidebar-accent"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                )}
            </div>

            <Sidebar collapsible="icon" className="fixed top-0 left-0">
                <SidebarHeader className="relative flex items-center justify-between h-16">
                    {(!isCollapsed || (isMobile && openMobile)) && (
                        <Link
                            href="/member-dashboard"
                            className={cn(
                                "flex items-center gap-2 px-2",
                                isActive("/member-dashboard") ? "text-blue-600" : "text-foreground",
                            )}
                        >
                            {/* <Laptop className="h-6 w-6" /> */}
                            {/* <span className="text-xl font-bold">Member</span> */}
                            <div className="grid size-11 place-items-center rounded-4xl bg-gradient-to-br from-gradient-blue from-25% via-gradient-purple via-50% to-gradient-red to-75% to text-primary-foreground shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                <GraduationCap size={24} className="drop-shadow-sm" />
                            </div>
                            <div className="leading-tight">
                                <p className="text-lg font-bold">
                                    FPA Conference
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">{new Date().getFullYear()}</p>
                            </div>
                        </Link>
                    )}

                    {!isCollapsed && isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpenMobile(false)}
                            className="absolute top-3 left-2 text-muted-foreground transition-all duration-200 hover:text-foreground"
                        >
                            <X className="size-8!" />
                        </Button>
                    )}

                    {/* Desktop-only custom trigger button that appears inside when expanded */}
                    {/* {!isCollapsed && !isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="absolute top-4 left-2 text-muted-foreground transition-all duration-200 hover:text-foreground"
                        >
                            <Menu className="size-8!" />
                        </Button>
                    )}
                    {isCollapsed && !isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="text-muted-foreground transition-all duration-200 hover:text-foreground"
                        >
                            <Menu className="size-8!" />
                        </Button>
                    )} */}
                </SidebarHeader>
                <SidebarSeparator />
                <SidebarContent className="no-scrollbar overflow-x-hidden overflow-y-scroll!">

                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {navLinks.map((link) => (
                                    <SidebarMenuItem key={link.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive(link.href)}
                                            tooltip={link.label}
                                        >
                                            <Link href={link.href}>
                                                <link.icon
                                                    className={cn(
                                                        isActive(link.href)
                                                            ? link.activeColor
                                                            : "text-foreground",
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        isActive(link.href)
                                                            ? link.activeColor
                                                            : "text-foreground",
                                                    )}
                                                >
                                                    {link.label}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* <SidebarRail /> */}
            </Sidebar>
        </div>
    );
}
