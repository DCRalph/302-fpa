"use client";

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
} from "./ui/dropdown-menu";
import { cn } from "~/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  Home,
  LogOut,
  Sun,
  Moon,
  Computer,
  Check,
  Shield,
  LayoutDashboard,
  Settings2,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "~/hooks/useAuth";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { authClient } from "~/lib/auth-client";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export function UserDropdown({ detailed = false }) {
  const { dbUser, isPending: authLoading } = useAuth();
  const [open, setOpen] = useState(false);

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      redirect("/");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            `flex items-center gap-3 p-2 cursor-pointer rounded-md transition-colors duration-200 hover:bg-sidebar-accent justify-center`,
          )}
        >
          {dbUser?.image ? (
            <Image
              src={dbUser.image}
              alt=""
              className="h-8 w-8 rounded-full"
              width={32}
              height={32}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          {detailed && (
            <div className=" flex-col overflow-hidden hidden md:flex">
              {authLoading ? (
                <p className="truncate text-sm font-medium text-foreground">
                  Loading...
                </p>
              ) : dbUser ? (
                <>
                  <p className="truncate text-sm font-medium text-foreground">
                    {dbUser?.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {dbUser?.email}
                  </p>
                </>
              ) : (
                <p className="truncate text-sm font-medium text-foreground">
                  Guest
                </p>
              )}
            </div>
          )}
          {detailed && (
            <div className="flex-1 overflow-hidden hidden md:flex">
              {
                open ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"} className="w-56">
        {dbUser ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 py-2">
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

            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
              Navigation
            </DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex items-center gap-3 py-2"
              >
                <Home className="size-4 text-muted-foreground" />
                <span>Home</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/member-dashboard"
                className="flex items-center gap-3 py-2"
              >
                <LayoutDashboard className="size-4 text-muted-foreground" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>

            {dbUser?.role === "ADMIN" && (
              <DropdownMenuItem asChild>
                <Link
                  href="/admin-dashboard"
                  className="flex items-center gap-3 py-2"
                >
                  <Settings2 className="size-4 text-muted-foreground" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}

            {/* TODO: Implement account settings page */}
            {/* <DropdownMenuItem asChild>
              <Link
                href="/account-settings"
                className="flex items-center gap-3 py-2"
              >
                <Cog className="size-4 text-muted-foreground" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem> */}

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-3 py-2">
                {mounted && (
                  <>
                    {theme === "light" && (
                      <Sun className="size-4 text-muted-foreground" />
                    )}
                    {theme === "dark" && (
                      <Moon className="size-4 text-muted-foreground" />
                    )}
                    {theme === "system" && (
                      <Computer className="size-4 text-muted-foreground" />
                    )}
                  </>
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-4 mr-2" />
                  Light
                  {theme === "light" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="size-4 mr-2" />
                  Dark
                  {theme === "dark" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                >
                  <Computer className="size-4 mr-2" />
                  System
                  {theme === "system" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer"
              variant="destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sign Out
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 py-2">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-medium text-foreground truncate">
                  Guest
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  Not signed in
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2">
              Navigation
            </DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href="/" className="flex w-full cursor-pointer items-center">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link
                href="/signin"
                className="flex items-center gap-3 py-2"
              >
                <LogIn className="size-4 text-muted-foreground" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/signup"
                className="flex items-center gap-3 py-2"
              >
                <UserPlus className="size-4 text-muted-foreground" />
                <span>Sign Up</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-3 py-2">
                {mounted && (
                  <>
                    {theme === "light" && (
                      <Sun className="size-4 text-muted-foreground" />
                    )}
                    {theme === "dark" && (
                      <Moon className="size-4 text-muted-foreground" />
                    )}
                    {theme === "system" && (
                      <Computer className="size-4 text-muted-foreground" />
                    )}
                  </>
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-4 mr-2" />
                  Light
                  {theme === "light" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="size-4 mr-2" />
                  Dark
                  {theme === "dark" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                >
                  <Computer className="size-4 mr-2" />
                  System
                  {theme === "system" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </>
        )}

      </DropdownMenuContent>
    </DropdownMenu>
  );
}

