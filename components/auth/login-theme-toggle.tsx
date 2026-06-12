"use client";

import { useEffect, useState } from "react";
import { LaptopMinimal, MoonStar, SunMedium } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  applyAppearancePreferences,
  persistAppearancePreferences,
  readAppearancePreferences,
  type ThemeMode,
} from "@/lib/appearance";

function setThemeMode(themeMode: ThemeMode) {
  const preferences = { ...readAppearancePreferences(), themeMode };
  applyAppearancePreferences(preferences);
  persistAppearancePreferences(preferences);
}

export function LoginThemeToggle({ className, floating = false }: { className?: string; floating?: boolean }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");

  useEffect(() => {
    queueMicrotask(() => {
      setThemeModeState(readAppearancePreferences().themeMode);
    });
  }, []);

  return (
    <div className={cn(floating && "fixed right-4 top-4 z-30 sm:right-6 sm:top-6", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm" className="gap-2 rounded-full border-border/70 bg-background/80 px-3 backdrop-blur">
            {themeMode === "dark" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
            <span className="hidden sm:inline">Theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-44">
          <DropdownMenuItem onClick={() => {
            setThemeModeState("light");
            setThemeMode("light");
          }}>
            <SunMedium className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            setThemeModeState("dark");
            setThemeMode("dark");
          }}>
            <MoonStar className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            setThemeModeState(systemTheme);
            setThemeMode(systemTheme);
          }}>
            <LaptopMinimal className="mr-2 h-4 w-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}