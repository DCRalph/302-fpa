import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Separator } from "../ui/separator";

import { ThemeToggle } from "~/components/theme-toggle";
import { AuthButtons } from "~/components/auth-buttons";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-4xl bg-primary text-primary-foreground">
            <GraduationCap size={24} />
          </div>
          <div className="leading-tight">
            <p className="text-[18px] font-semibold">FPA Conference</p>
            <p className="text-[14px] text-muted-foreground">2025</p>
          </div>
        </div>
        <div className="flex items-center gap-6 h-10">
          <div className="hidden gap-6 text-sm font-medium md:flex">
            <Link href="#home" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link href="#benefits" className="text-muted-foreground hover:text-foreground">Benefits</Link>
            <Link href="#details" className="text-muted-foreground hover:text-foreground">Details</Link>
            <Link href="#tips" className="text-muted-foreground hover:text-foreground">Tips</Link>
            <Link href="#features" className="text-muted-foreground hover:text-foreground">Features</Link>
            <Link href="/auth" className="text-muted-foreground hover:text-foreground">Auth test</Link>
          </div>
          <Separator orientation="vertical" className="hidden md:block"/>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButtons />
          </div>
        </div>

      </div>
    </nav>
  );
}


