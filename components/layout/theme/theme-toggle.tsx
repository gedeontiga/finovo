"use client";

import { IconBrightness } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const handleThemeToggle = React.useCallback(
    (e?: React.MouseEvent) => {
      const newMode = resolvedTheme === "dark" ? "light" : "dark";
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newMode);
        return;
      }

      // Set coordinates from the click event
      if (e) {
        root.style.setProperty("--x", `${e.clientX}px`);
        root.style.setProperty("--y", `${e.clientY}px`);
      }

      document.startViewTransition(() => {
        setTheme(newMode);
      });
    },
    [resolvedTheme, setTheme],
  );

  return (
    <Button
      variant="secondary"
      size="icon"
      className="group/toggle bg-transparent"
      onClick={handleThemeToggle}
    >
      <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-background/5 backdrop-blur-md border border-border shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl hover:border-primary/50">
        {/* Icon with smooth transition */}
        <div className="relative w-6 h-6">
          <Sun className="absolute inset-0 size-6 text-amber-500 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute inset-0 size-6 text-blue-500 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
        </div>
      </div>
    </Button>
  );
}
