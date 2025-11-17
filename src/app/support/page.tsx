import { SiteFooter } from "~/components/site-footer";
import { SupportContent } from "./SupportContent";
import { NavBar } from "~/components/nav-bar";

export default function SupportPage() {
  return (
    <main className="w-screen h-screen overflow-y-scroll">
      <NavBar />
      <SupportContent />
      <SiteFooter />
    </main>
  );
}

