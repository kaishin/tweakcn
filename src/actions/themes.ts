import {z} from "zod";
import {
  themeStylesSchema,
  type ThemeStyles,
  type ThemeSchema
} from "@/types/theme";

const STORAGE_KEY = "Chadcon_themes";

const createThemeSchema = z.object({
  name: z.string().min(1, "Theme name cannot be empty"),
  styles: themeStylesSchema
});

const updateThemeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Theme name cannot be empty").optional(),
  styles: themeStylesSchema.optional()
});

// Helper function to load themes from localStorage
function loadThemes(): ThemeSchema[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load themes from localStorage:", error);
    return [];
  }
}

// Helper function to save themes to localStorage
function saveThemes(themes: ThemeSchema[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  } catch (error) {
    console.error("Failed to save themes to localStorage:", error);
  }
}

export function getThemes(): ThemeSchema[] {
  return loadThemes();
}

export function getTheme(themeId: string): ThemeSchema | null {
  const themes = loadThemes();
  return themes.find((t) => t.id === themeId) || null;
}

export function createTheme(formData: {name: string; styles: ThemeStyles}) {
  const validation = createThemeSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: "Invalid input",
      details: validation.error.format()
    };
  }

  const {name, styles} = validation.data;
  const themes = loadThemes();

  const newTheme: ThemeSchema = {
    id: Date.now().toString(),
    name,
    styles,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  themes.push(newTheme);
  saveThemes(themes);

  return {success: true, theme: newTheme};
}

export function updateTheme(formData: {
  id: string;
  name?: string;
  styles?: ThemeStyles;
}) {
  const validation = updateThemeSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: "Invalid input",
      details: validation.error.format()
    };
  }

  const {id, name, styles} = validation.data;
  const themes = loadThemes();
  const themeIndex = themes.findIndex((t) => t.id === id);

  if (themeIndex === -1) {
    return {success: false, error: "Theme not found"};
  }

  if (name) themes[themeIndex].name = name;
  if (styles) themes[themeIndex].styles = styles;
  themes[themeIndex].updatedAt = new Date();

  saveThemes(themes);

  return {success: true, theme: themes[themeIndex]};
}

export function deleteTheme(themeId: string) {
  const themes = loadThemes();
  const themeIndex = themes.findIndex((t) => t.id === themeId);

  if (themeIndex === -1) {
    return {success: false, error: "Theme not found"};
  }

  themes.splice(themeIndex, 1);
  saveThemes(themes);

  return {success: true, deletedId: themeId};
}
