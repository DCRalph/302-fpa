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
  ExternalLink,
  Edit,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "~/hooks/useAuth";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { SignOut } from "~/components/sign-out";
import { Button } from "./ui/button";

import { api } from "~/trpc/react";
import EditTitle from "./landing/admin/editTitle";
import type { ConferenceTitle } from "~/server/api/routers/home";
import type { ConferenceWhyJoin } from "~/server/api/routers/home";
import EditWhyJoin from "./landing/admin/editWhyJoin";

export function UserDropdown({ detailed = false }) {
  const { dbUser, isPending: authLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const conferenceTitle = api.home.getConferenceTitle.useQuery();

  const title = conferenceTitle.data?.value ?? null;
  const titleObject = title ? (JSON.parse(title) as ConferenceTitle) : null;

  const conferenceWhyJoin = api.home.getConferenceWhyJoin.useQuery();
  const whyJoinArray = conferenceWhyJoin.data
    ? JSON.parse(conferenceWhyJoin.data.value ?? "[]")
    : ([] as ConferenceWhyJoin[]);

  const [editTitleOpen, setEditTitleOpen] = useState(false);
  const [editWhyJoinOpen, setEditWhyJoinOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            `hover:bg-foreground/10 flex cursor-pointer items-center justify-center gap-3 rounded-md p-2 transition-colors duration-200`,
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
            <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-full">
              <User className="text-muted-foreground h-4 w-4" />
            </div>
          )}
          {detailed && (
            <div className="hidden flex-col overflow-hidden md:flex">
              {authLoading ? (
                <p className="text-foreground truncate text-sm font-medium">
                  Loading...
                </p>
              ) : dbUser ? (
                <>
                  <p className="text-foreground truncate text-sm font-medium">
                    {dbUser?.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {dbUser?.email}
                  </p>
                </>
              ) : (
                <p className="text-foreground truncate text-sm font-medium">
                  Guest
                </p>
              )}
            </div>
          )}
          {detailed && (
            <div className="hidden flex-1 overflow-hidden md:flex">
              {open ? (
                <ChevronUp className="text-muted-foreground h-4 w-4" />
              ) : (
                <ChevronDown className="text-muted-foreground h-4 w-4" />
              )}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={"end"} className="w-56">
        {dbUser ? (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 py-2">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-sm font-medium">
                  {dbUser?.name ?? dbUser?.email ?? "Signed in"}
                </span>
                {dbUser?.email && (
                  <span className="text-muted-foreground truncate text-xs">
                    {dbUser.email}
                  </span>
                )}
                {dbUser?.role === "ADMIN" && (
                  <span className="text-primary mt-1 flex items-center gap-1 text-xs font-medium">
                    <Shield className="size-3" />
                    Admin
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-muted-foreground px-2 py-2 text-xs font-semibold tracking-wider uppercase">
              Navigation
            </DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href="/" className="flex items-center gap-3 py-2">
                <Home className="text-muted-foreground size-4" />
                <span>Home</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link
                href="/member-dashboard"
                className="flex items-center gap-3 py-2"
              >
                <LayoutDashboard className="text-muted-foreground size-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>

            {dbUser?.role === "ADMIN" && (
              <>
                <DropdownMenuItem asChild>
                  <Link
                    href="/admin-dashboard"
                    className="flex items-center gap-3 py-2"
                  >
                    <Settings2 className="text-muted-foreground size-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-muted-foreground px-2 py-2 text-xs font-semibold tracking-wider uppercase">
                  Landing Page
                </DropdownMenuLabel>

                <DropdownMenuItem
                  className="flex items-center gap-3 py-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    setEditTitleOpen(true);
                  }}
                >
                  <Edit className="text-muted-foreground size-4" />
                  <span>Edit Title</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="flex items-center gap-3 py-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    setEditWhyJoinOpen(true);
                  }}
                >
                  <Edit className="text-muted-foreground size-4" />
                  <span>Edit Why Join</span>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href="/admin-dashboard"
                    className="flex items-center gap-3 py-2"
                  >
                    <ExternalLink className="text-muted-foreground size-4" />
                    <span>Manage Conferences</span>
                  </Link>
                </DropdownMenuItem>

                <EditTitle
                  titleObject={titleObject}
                  open={editTitleOpen}
                  onOpenChange={setEditTitleOpen}
                />

                <EditWhyJoin
                  whyJoinItems={whyJoinArray}
                  open={editWhyJoinOpen}
                  onOpenChange={setEditWhyJoinOpen}
                />
              </>
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
                      <Sun className="text-muted-foreground size-4" />
                    )}
                    {theme === "dark" && (
                      <Moon className="text-muted-foreground size-4" />
                    )}
                    {theme === "system" && (
                      <Computer className="text-muted-foreground size-4" />
                    )}
                  </>
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" />
                  Light
                  {theme === "light" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" />
                  Dark
                  {theme === "dark" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Computer className="mr-2 size-4" />
                  System
                  {theme === "system" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <SignOut asChild>
              <DropdownMenuItem variant="destructive">
                <LogOut className="text-muted-foreground size-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </SignOut>
          </>
        ) : (
          <>
            <DropdownMenuLabel className="flex items-center gap-3 py-2">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-foreground truncate text-sm font-medium">
                  Guest
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  Not signed in
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-muted-foreground px-2 py-2 text-xs font-semibold tracking-wider uppercase">
              Navigation
            </DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link
                href="/"
                className="flex w-full cursor-pointer items-center"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href="/signin" className="flex items-center gap-3 py-2">
                <LogIn className="text-muted-foreground size-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/signup" className="flex items-center gap-3 py-2">
                <UserPlus className="text-muted-foreground size-4" />
                <span>Sign Up</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-3 py-2">
                {mounted && (
                  <>
                    {theme === "light" && (
                      <Sun className="text-muted-foreground size-4" />
                    )}
                    {theme === "dark" && (
                      <Moon className="text-muted-foreground size-4" />
                    )}
                    {theme === "system" && (
                      <Computer className="text-muted-foreground size-4" />
                    )}
                  </>
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 size-4" />
                  Light
                  {theme === "light" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 size-4" />
                  Dark
                  {theme === "dark" && <Check className="ml-auto size-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Computer className="mr-2 size-4" />
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
