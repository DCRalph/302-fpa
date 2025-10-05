import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { LayoutDashboard, Calendar, BookOpen, FileText, User, GraduationCap } from "lucide-react";
import Link from "next/link";

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
    return (
        <Sidebar>
            <SidebarHeader>
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
            <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarContent>
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
                </SidebarContent>
            </SidebarGroup>

        </Sidebar>
    )
}