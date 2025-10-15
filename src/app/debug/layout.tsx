import { RemoveDarkMode } from "./removeDarkMode";

export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen"
      suppressHydrationWarning
    >
      <RemoveDarkMode />
      {children}
    </div >
  );
}
