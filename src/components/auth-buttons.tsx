"use client";

import Link from "next/link";
import { UserButton, useUser } from "@stackframe/stack";

import { Button } from "~/components/ui/button";

import { api } from "~/trpc/react";

export function AuthButtons() {
  const user = useUser();

  const { data: me } = api.auth.me.useQuery();
  const isAdmin = me?.role === "ADMIN";

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={isAdmin ? `/admin-dashboard`: `/member-dashboard`}>Dashboard</Link>
        </Button>
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link href="/signin">Login</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Register</Link>
      </Button>
    </div>
  );
}


