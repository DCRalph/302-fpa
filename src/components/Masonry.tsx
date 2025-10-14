import React from "react";

type ResponsiveMasonryProps = {
  children: React.ReactNode;
  className?: string;
  // e.g., { base: 1, md: 2, xl: 3 }
  cols?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
};

export function Masonry({
  children,
  className,
  cols = { base: 1, md: 2 },
  gap = "gap-4",
}: ResponsiveMasonryProps) {
  const items = React.Children.toArray(children);

  // Helper to render a specific column count
  const renderCols = (count: number) => {
    const buckets: React.ReactNode[][] = Array.from({ length: count }, () => []);
    items.forEach((child, i) => {
      buckets[i % count]!.push(child);
    });
    return buckets;
  };

  // We render all needed column counts and show/hide with Tailwind
  const sets: Array<{ count: number; wrapperClass: string }> = [
    { count: cols.base ?? 1, wrapperClass: "block sm:hidden" },
    { count: cols.sm ?? cols.md ?? cols.base ?? 1, wrapperClass: "hidden sm:block md:hidden" },
    { count: cols.md ?? cols.base ?? 1, wrapperClass: "hidden md:block lg:hidden" },
    { count: cols.lg ?? cols.md ?? cols.base ?? 1, wrapperClass: "hidden lg:block xl:hidden" },
    { count: cols.xl ?? cols.lg ?? cols.md ?? cols.base ?? 1, wrapperClass: "hidden xl:block" },
  ];

  return (
    <div className={className}>
      {sets.map(({ count, wrapperClass }, idx) => (
        <div key={idx} className={["w-full", wrapperClass].join(" ")}>
          <div className={["grid", `grid-cols-${count}`, gap].join(" ")}>
            {renderCols(count).map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-4">
                {col.map((child, i) => (
                  <div key={i} className="break-inside-avoid">
                    {child}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}