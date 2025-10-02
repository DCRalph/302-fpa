"use client";

import Link from "next/link";
import { UserButton, useUser } from "@stackframe/stack";

import { Button } from "~/components/ui/button";

export function AuthButtons() {
  const user = useUser();

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/handler/sign-up">Register</Link>
      </Button>
    </div>
  );
}


