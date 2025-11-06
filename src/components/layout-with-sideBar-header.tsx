import { SidebarProvider } from "./ui/sidebar";


interface LayoutWithSideBarHeaderProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  header: React.ReactNode;
}

export function LayoutWithSideBarHeader({ children, sidebar, header: header }: LayoutWithSideBarHeaderProps) {
  return (
    <SidebarProvider>
      <div className="bg-sidebar flex h-screen w-full">
        {sidebar}
        <div className="flex flex-1 flex-col w-full overflow-x-hidden md:mt-2 rounded-none sm:rounded-tl-xl bg-page-background">
          {/* <div className="shadow-glass"> */}
          {header}
          {children}
          {/* </div> */}
        </div>
      </div>
    </SidebarProvider>
  );
}