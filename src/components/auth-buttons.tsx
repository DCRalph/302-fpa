import Link from "next/link";

import { Button } from "~/components/ui/button";
import { ServerAuth } from "~/lib/auth-server";
import { UserButton } from "./user-button";

export async function AuthButtons() {
  const { dbUser } = await ServerAuth();

  const isAdmin = dbUser?.role === "ADMIN";

  if (dbUser) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href={`/member-dashboard`}>Dashboard</Link>
        </Button>
        {isAdmin && (
          <Button variant="outline" asChild>
            <Link href="/admin-dashboard">Admin Dashboard</Link>
          </Button>
        )}
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


