import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getServerSession } from "~/lib/getServerSession";


export async function AuthButtons() {

  const session = await getServerSession()


  if (session) {
    return (
      <>
        {/* Desktop view */}
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/member-dashboard`}>Dashboard</Link>
          </Button>
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
        <Button variant="primary" asChild>
          <Link href="/signup">Register</Link>
        </Button>
      </div>
    </>
  );
}


