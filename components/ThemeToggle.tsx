"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const label = theme === "system" ? "system" : resolvedTheme;

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="rounded-xl border-2 border-gray-300 bg-white p-2 text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
      title={`Current: ${label} — click for ${nextTheme}`}
    >
      {theme === "system" ? (
        <Monitor className="h-5 w-5" />
      ) : resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
