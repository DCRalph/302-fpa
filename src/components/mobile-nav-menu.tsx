"use client";

import Link from "next/link";
import { Menu, LogIn, UserPlus, Cog, Shield, LayoutDashboard, Settings2, LogOut, Home, Star, Info, Lightbulb, Zap, Sun, Moon, Computer, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./ui/dropdown-menu";
import { setThemeAndPersist, type ThemeSelection } from "~/lib/theme";
import { useAuth } from "~/lib/auth";


export function MobileNavMenu() {
  const { stackUser, dbUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const setThemeAndPersistLocal = async (value: ThemeSelection) => {
    await setThemeAndPersist(value, { user: stackUser, setTheme });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="hover:bg-muted">
          <Menu className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 duration-200">
        {dbUser ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 py-3">

              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium text-foreground truncate">
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

          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/signin" className="flex items-center gap-3 py-2">
                <LogIn className="size-4 text-muted-foreground" />
                <span>Login</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/signup" className="flex items-center gap-3 py-2">
                <UserPlus className="size-4 text-muted-foreground" />
                <span>Register</span>
              </Link>
            </DropdownMenuItem>

          </>
        )}



        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
          Navigation
        </DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-3 py-2">
            <Home className="size-4 text-muted-foreground" />
            <span>Home</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/member-dashboard" className="flex items-center gap-3 py-2">
            <LayoutDashboard className="size-4 text-muted-foreground" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        {dbUser?.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin-dashboard" className="flex items-center gap-3 py-2">
              <Settings2 className="size-4 text-muted-foreground" />
              <span>Admin Dashboard</span>
            </Link>
          </DropdownMenuItem>
        )}
        {/* 
        <DropdownMenuItem asChild>
          <Link href="/#benefits" className="flex items-center gap-3 py-2">
            <Star className="size-4 text-muted-foreground" />
            <span>Benefits</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/#details" className="flex items-center gap-3 py-2">
            <Info className="size-4 text-muted-foreground" />
            <span>Details</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/#tips" className="flex items-center gap-3 py-2">
            <Lightbulb className="size-4 text-muted-foreground" />
            <span>Tips</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/#features" className="flex items-center gap-3 py-2">
            <Zap className="size-4 text-muted-foreground" />
            <span>Features</span>
          </Link>
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />

        {dbUser ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/handler/account-settings" className="flex items-center gap-3 py-2">
                <Cog className="size-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/handler/sign-out" className="flex items-center gap-3 py-2 text-red-500">
                <LogOut className="size-4 text-inherit" />
                <span>Logout</span>
              </Link>
            </DropdownMenuItem>

          </>
        ) : (
          <></>
        )}

        {/* Theme Submenu */}
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
  );
}

