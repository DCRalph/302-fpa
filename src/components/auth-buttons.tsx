import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ServerAuth } from "~/lib/auth-server";
// import { UserButton } from "./user-button";

export async function AuthButtons() {
  const { dbUser } = await ServerAuth();

  if (dbUser) {
    return (
      <>
        {/* Desktop view */}
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/member-dashboard`}>Dashboard</Link>
          </Button>
          {/* <UserButton /> */}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Desktop view */}
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild>
          <Link href="/signin">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Register</Link>
        </Button>
      </div>
    </>
  );
}


