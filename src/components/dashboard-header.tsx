"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./ui/dropdown-menu";

import { cn } from "~/lib/utils";
import { ChevronUp, Home, User, Settings, Laptop, LogOut, Sun, Moon, Computer, Check, Menu, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "~/lib/auth";
import { useSidebar, SidebarTrigger } from "./ui/sidebar";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { setThemeAndPersist, type ThemeSelection } from "~/lib/theme";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { cabin } from "./fonts";

export function DashboardHeader() {
  const { dbUser, stackUser } = useAuth();
  const { state, isMobile, toggleSidebar } = useSidebar();
  const [isCollapsed, setIsCollapsed] = useState(state === "collapsed");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    setIsCollapsed(state === "collapsed");
  }, [state]);

  const setThemeAndPersistLocal = async (value: ThemeSelection) => {
    await setThemeAndPersist(value, { user: stackUser, setTheme });
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm w-full h-16">
        <div className=" mx-auto flex h-16 items-center justify-between px-4 lg:px-6">

          <div className="flex items-center gap-3">
            {/* <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="size-5" />
            </Button>
            <h1 className="text-2xl font-bold">Member Dashboard</h1> */}
            <SidebarTrigger size={"icon"} className="" />
            <Separator orientation="vertical" className="!h-5" />
            <h1 className={`${cabin.className} text-2xl`}>Dashboard</h1>
          </div>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  `flex items-center gap-3 ${isCollapsed ? "p-0" : "p-2"} cursor-pointer rounded-md transition-colors duration-200 hover:bg-sidebar-accent`,
                  isCollapsed && "justify-center",
                )}
              >
                {dbUser?.image && (
                  <Image
                    src={dbUser.image}
                    alt=""
                    className="h-8 w-8 rounded-full"
                    width={32}
                    height={32}
                  />
                )}
                {(!isMobile) && (
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium text-foreground">
                      {dbUser?.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {dbUser?.email}
                    </p>
                  </div>
                )}
                {(!isMobile) && (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={isCollapsed ? "start" : "end"}
              className="w-56"
            >
              <DropdownMenuLabel className="flex items-center gap-3 py-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground truncate">
                    {dbUser?.name ?? dbUser?.email ?? "Signed in"}
                  </span>
                  {dbUser?.email && (
                    <span className="text-xs text-muted-foreground truncate">
                      {dbUser.email}
                    </span>
                  )}
                  {dbUser?.role === "ADMIN" && (
                    <span className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
                      <Shield className="size-3" />
                      Admin
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  href="/"
                  className="flex w-full cursor-pointer items-center"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </DropdownMenuItem>

              {/* Account */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/account"
                  className="flex w-full cursor-pointer items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  Account
                </Link>
              </DropdownMenuItem>

              {/* Settings */}
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="flex w-full cursor-pointer items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>



              {/* Dashboard */}
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard"
                  className="flex w-full cursor-pointer items-center"
                >
                  <Laptop className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              {/* Notifications */}
              {/* <DropdownMenuItem asChild>
                                <Link
                                    href="/notifications"
                                    className="flex w-full cursor-pointer items-center"
                                >
                                    <FiBell className="mr-2 h-4 w-4" />
                                    Notifications
                                </Link>
                            </DropdownMenuItem> */}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                // onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                className="cursor-pointer text-red-500 hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                Sign Out
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-3 py-2">
                  {mounted && (
                    <>
                      {theme === "light" && <Sun className="size-4 text-muted-foreground" />}
                      {theme === "dark" && <Moon className="size-4 text-muted-foreground" />}
                      {theme === "system" && <Computer className="size-4 text-muted-foreground" />}
                    </>
                  )}
                  <span>Theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => void setThemeAndPersistLocal("light")}>
                    <Sun className="size-4 mr-2" />
                    Light
                    {theme === "light" && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void setThemeAndPersistLocal("dark")}>
                    <Moon className="size-4 mr-2" />
                    Dark
                    {theme === "dark" && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void setThemeAndPersistLocal("system")}>
                    <Computer className="size-4 mr-2" />
                    System
                    {theme === "system" && <Check className="ml-auto size-4" />}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </header>

      <div className="w-full h-px bg-sidebar-border"></div>
    </>
  );
}