import { SidebarProvider } from "./ui/sidebar";


interface LayoutWithSideBarHeadderProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  headder: React.ReactNode;
}

export function LayoutWithSideBarHeadder({ children, sidebar, headder }: LayoutWithSideBarHeadderProps) {
  return (
    <SidebarProvider>
      <div className="bg-page-background flex min-h-screen w-full">
        {sidebar}
        <div className="flex flex-1 flex-col">
          {headder}
          <main className="h-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}