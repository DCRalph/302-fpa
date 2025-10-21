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
        <div className="flex flex-1 flex-col w-full overflow-x-hidden mt-2 ml-2 rounded-tl-xl bg-background">
          {/* <div className=""> */}
            {header}
            {children}
          {/* </div> */}
        </div>
      </div>
    </SidebarProvider>
  );
}