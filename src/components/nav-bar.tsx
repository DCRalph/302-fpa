import Link from "next/link";
import { GraduationCap, Home, Star, Info, Lightbulb, Zap } from "lucide-react";

import { Separator } from "./ui/separator";

import { ThemeToggle } from "~/components/theme-toggle";
import { AuthButtons } from "~/components/auth-buttons";
import { ServerAuth } from "~/lib/auth-server";
import { MobileNavMenu } from "./mobile-nav-menu";

export async function NavBar() {
  const { dbUser } = await ServerAuth();
  const isAdmin = dbUser?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
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

        {/* Right Section */}
        <div className="flex items-center gap-3 h-10">

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center h-full gap-1">
            <Link
              href="/#home"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              <span>Home</span>
            </Link>
            <Link
              href="/#benefits"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              <span>Benefits</span>
            </Link>
            <Link
              href="/#details"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              <span>Details</span>
            </Link>
            <Link
              href="/#tips"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              <span>Tips</span>
            </Link>
            <Link
              href="/#features"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all duration-200"
            >
              <span>Features</span>
            </Link>

            <Separator orientation="vertical" className="py-0.5" />
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden sm:flex items-center gap-4">
            {/* <ThemeToggle /> */}
            <AuthButtons />
          </div>

          <MobileNavMenu />
        </div>
      </div>
    </nav>
  );
}