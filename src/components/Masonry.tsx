import React from "react";

// Masonry (responsive grid)
// Lightweight helper that renders children into a responsive CSS grid with
// break-inside avoidance to keep items from splitting across columns. `cols`
// accepts breakpoint keys (base/sm/md/...) and maps them to Tailwind grid classes.
// Keep the implementation simple to avoid runtime layout calculations.
type ResponsiveMasonryProps = {
  children: React.ReactNode;
  className?: string;
  // e.g., { base: 1, sm: 2, md: 3 }
  cols?: { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
};

export function Masonry({
  children,
  className = "",
  cols = { base: 1, md: 2 },
  gap = "gap-4",
}: ResponsiveMasonryProps) {
  const items = React.Children.toArray(children);

  // Build Tailwind class list dynamically (but statically predictable)
  const colClasses = [
    cols.base && `grid-cols-${cols.base}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`grid ${colClasses} ${gap} ${className}`}>
      {items.map((child, i) => (
        <div key={i} className="break-inside-avoid">
          {child}
        </div>
      ))}
    </div>
  );
}
