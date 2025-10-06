
import { NavBar } from "~/components/nav-bar";
import Auth from "./Auth";

export const dynamic = 'force-dynamic';

export default function TempPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">Auth Test Page</h1>
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header> */}

      <NavBar />

      <Auth />

    </div>
  );
}
