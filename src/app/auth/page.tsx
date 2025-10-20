import { NavBar } from "~/components/nav-bar";
import Auth from "./Auth";

export const dynamic = "force-dynamic";

export default function TempPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <NavBar />
      <Auth />
    </div>
  );
}
