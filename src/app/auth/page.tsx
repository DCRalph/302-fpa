
import { NavBar } from "~/components/nav-bar";
import Auth from "./Auth";

export const dynamic = 'force-dynamic';

export default function TempPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      <NavBar />

      <Auth />

    </div>
  );
}
