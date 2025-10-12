import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
  count?: number;
  animated?: boolean;
  layoutId?: string;
}

export function TabButton({
  isActive,
  onClick,
  icon,
  label,
  count,
  animated = false,
  layoutId,
}: TabButtonProps) {
  const baseClasses = "relative px-4 py-2 font-medium transition-colors";
  const activeClasses = isActive
    ? "text-foreground"
    : "text-muted-foreground hover:text-foreground";
  const borderClasses = !animated && isActive ? "border-b-2 border-red-500" : "";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${borderClasses}`}
    >
      <span className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        {count !== undefined && ` (${count})`}
      </span>
      {animated && isActive && layoutId && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
          layoutId={layoutId}
        />
      )}
    </button>
  );
}

