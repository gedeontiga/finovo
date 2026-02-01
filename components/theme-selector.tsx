"use client";

import { useThemeConfig } from "@/components/active-theme";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const THEME_COLORS = {
  default: { primary: "#1449e6", accent: "#fe9a00" },
  blue: { primary: "#1449e6", accent: "#0ea5e9" },
  green: { primary: "#059669", accent: "#10b981" },
  amber: { primary: "#d97706", accent: "#f59e0b" },
};

const DEFAULT_THEMES = [
  {
    name: "Default",
    value: "default",
    primary: THEME_COLORS.default.primary,
    accent: THEME_COLORS.default.accent,
  },
  {
    name: "Blue",
    value: "blue",
    primary: THEME_COLORS.blue.primary,
    accent: THEME_COLORS.blue.accent,
  },
  {
    name: "Green",
    value: "green",
    primary: THEME_COLORS.green.primary,
    accent: THEME_COLORS.green.accent,
  },
  {
    name: "Amber",
    value: "amber",
    primary: THEME_COLORS.amber.primary,
    accent: THEME_COLORS.amber.accent,
  },
];

const SCALED_THEMES = [
  {
    name: "Default",
    value: "default-scaled",
    primary: THEME_COLORS.default.primary,
    accent: THEME_COLORS.default.accent,
  },
  {
    name: "Blue",
    value: "blue-scaled",
    primary: THEME_COLORS.blue.primary,
    accent: THEME_COLORS.blue.accent,
  },
];

const MONO_THEMES = [
  {
    name: "Mono",
    value: "mono-scaled",
    primary: "#525252",
    accent: "#737373",
  },
];

interface ThemeItemProps {
  name: string;
  primary: string;
  accent: string;
}

function ThemeItem({ name, primary, accent }: ThemeItemProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex gap-1">
        <div
          className="w-4 h-4 rounded-sm border border-border shadow-sm"
          style={{ backgroundColor: primary }}
        />
        <div
          className="w-4 h-4 rounded-sm border border-border shadow-sm"
          style={{ backgroundColor: accent }}
        />
      </div>
      <span className="flex-1">{name}</span>
    </div>
  );
}

export function ThemeSelector() {
  const { activeTheme, setActiveTheme } = useThemeConfig();

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="theme-selector" className="sr-only">
        Theme
      </Label>
      <Select value={activeTheme} onValueChange={setActiveTheme}>
        <SelectTrigger
          id="theme-selector"
          className="justify-start w-auto min-w-45"
        >
          <span className="text-muted-foreground hidden sm:block text-xs">
            Theme:
          </span>
          <SelectValue placeholder="Select a theme" />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-50">
          <SelectGroup>
            <SelectLabel>Default</SelectLabel>
            {DEFAULT_THEMES.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                <ThemeItem
                  name={theme.name}
                  primary={theme.primary}
                  accent={theme.accent}
                />
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Scaled</SelectLabel>
            {SCALED_THEMES.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                <ThemeItem
                  name={theme.name}
                  primary={theme.primary}
                  accent={theme.accent}
                />
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Monospaced</SelectLabel>
            {MONO_THEMES.map((theme) => (
              <SelectItem key={theme.value} value={theme.value}>
                <ThemeItem
                  name={theme.name}
                  primary={theme.primary}
                  accent={theme.accent}
                />
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
