import { NavBar } from "~/components/nav-bar";
import { SiteFooter } from "~/components/site-footer";
import { LegalTabs } from "./LegalTabs";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function LegalPage({ searchParams }: Props) {
  const params = await searchParams;
  const tab = params.tab === "privacy" || params.tab === "terms" ? params.tab : "privacy";

  return (
    <main className="w-screen h-screen overflow-y-scroll">
      <div className="bg-background text-foreground min-h-screen">
        <NavBar />
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Legal Information</h1>
          <LegalTabs initialTab={tab} />
        </div>
        <SiteFooter />
      </div>
    </main>
  );
}

