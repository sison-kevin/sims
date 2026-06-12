export type ThemeMode = "light" | "dark";
export type Density = "compact" | "comfortable";
export type Accent = "teal" | "blue" | "violet" | "slate";

export type AppearancePreferences = {
  themeMode: ThemeMode;
  density: Density;
  accent: Accent;
};

export const APPEARANCE_STORAGE_KEYS = {
  themeMode: "sims-settings-theme",
  density: "sims-settings-density",
  accent: "sims-settings-accent",
} as const;

export const defaultAppearancePreferences: AppearancePreferences = {
  themeMode: "light",
  density: "comfortable",
  accent: "teal",
};

const allowedThemeModes: ThemeMode[] = ["light", "dark"];
const allowedDensities: Density[] = ["compact", "comfortable"];
const allowedAccents: Accent[] = ["teal", "blue", "violet", "slate"];

function normalizeValue<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? (value as T) : fallback;
}

export function readAppearancePreferences(): AppearancePreferences {
  if (typeof window === "undefined") {
    return defaultAppearancePreferences;
  }

  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  return {
    themeMode: normalizeValue(localStorage.getItem(APPEARANCE_STORAGE_KEYS.themeMode), allowedThemeModes, systemTheme as ThemeMode),
    density: normalizeValue(localStorage.getItem(APPEARANCE_STORAGE_KEYS.density), allowedDensities, defaultAppearancePreferences.density),
    accent: normalizeValue(localStorage.getItem(APPEARANCE_STORAGE_KEYS.accent), allowedAccents, defaultAppearancePreferences.accent),
  };
}

export function applyAppearancePreferences(preferences: AppearancePreferences) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.dataset.theme = preferences.themeMode;
  root.dataset.density = preferences.density;
  root.dataset.accent = preferences.accent;
  root.style.colorScheme = preferences.themeMode;
}

export function persistAppearancePreferences(preferences: AppearancePreferences) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(APPEARANCE_STORAGE_KEYS.themeMode, preferences.themeMode);
  localStorage.setItem(APPEARANCE_STORAGE_KEYS.density, preferences.density);
  localStorage.setItem(APPEARANCE_STORAGE_KEYS.accent, preferences.accent);
}

export function resetAppearancePreferences() {
  if (typeof window === "undefined") {
    return defaultAppearancePreferences;
  }

  localStorage.removeItem(APPEARANCE_STORAGE_KEYS.themeMode);
  localStorage.removeItem(APPEARANCE_STORAGE_KEYS.density);
  localStorage.removeItem(APPEARANCE_STORAGE_KEYS.accent);
  return defaultAppearancePreferences;
}