"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <div className="h-9 w-9 rounded-xl border border-border/60 bg-card/60" />
    );

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 rounded-xl border border-border/60 bg-card/60 text-muted-foreground backdrop-blur-sm transition-all hover:bg-card hover:text-foreground hover:shadow-md"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 text-primary" />
      )}
    </Button>
  );
}
