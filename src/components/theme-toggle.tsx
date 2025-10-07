"use client";

import { Moon, Sun, Computer, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "~/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleClick = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    e.preventDefault();
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Button variant="outline" size="icon" onMouseDown={handleClick}>
          {mounted && (
            <>
              <Sun
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === "light" ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
              />
              <Moon
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
              />
              <Computer
                className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${theme === "system" ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
              />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => setTheme("light")}>
          Light
          {theme === "light" && <Check className="ml-auto h-4 w-4" />}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setTheme("dark")}>
          Dark
          {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setTheme("system")}>
          System
          {theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}