import { redirect } from "next/navigation";
import { SidebarProvider } from "~/components/ui/sidebar";
import { MemberSidebar } from "~/components/memberSidebar";
import { MemberHeader } from "~/components/memberHeader";
import { ServerAuth } from "~/lib/auth-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { dbUser } = await ServerAuth();

  if (!dbUser) {
    redirect("/");
  }

  const isAdmin = dbUser.role === "ADMIN";

  if (!isAdmin) {
    redirect("/");
  }


  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MemberSidebar />
        <div className="flex flex-col flex-1 overflow-x-hidden">
          <MemberHeader />
          <main className="">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider >
  );
}
