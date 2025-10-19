"use client";

import { Button } from "~/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useRouter } from 'nextjs-toploader/app';
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { forwardRef } from "react";

interface SignOutProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
  asChild?: boolean;
}

export const SignOut = forwardRef<HTMLDivElement, SignOutProps>(({
  variant = "destructive",
  size = "default",
  className,
  children,
  asChild = false,
  ...props
}, ref) => {
  const router = useRouter();
  const utils = api.useUtils();

  const handleSignOut = async () => {
    try {
      void authClient.signOut();
      void utils.auth.me.invalidate();
      router.push("/");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  if (asChild) {
    return (
      <div
        ref={ref}
        className={className}
        onClick={handleSignOut}
        {...props}
      >
        {children ?? (
          <>
            <LogOut className="mr-2 size-4" />
            Sign Out
          </>
        )}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      {...props}
    >
      {children ?? (
        <>
          <LogOut className="mr-2 size-4" />
          Sign Out
        </>
      )}
    </Button>
  );
});

SignOut.displayName = "SignOut";
