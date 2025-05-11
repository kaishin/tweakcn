import * as culori from "culori";
import type {ColorFormat} from "../types";
import {
  parse,
  formatRgb as culoriFormatRgb,
  formatHsl as culoriFormatHsl,
  converter
} from "culori";
import type {Oklch, Hsl} from "culori";

export const formatNumber = (num?: number) => {
  if (!num) return "0";
  return num % 1 === 0 ? num : num.toFixed(2);
};

export const formatHslToString = (hslColor: Hsl): string => {
  const h =
    hslColor.h === undefined || isNaN(hslColor.h)
      ? 0
      : ((hslColor.h % 360) + 360) % 360;
  const s =
    hslColor.s === undefined || isNaN(hslColor.s)
      ? 0
      : Math.max(0, Math.min(1, hslColor.s));
  const l =
    hslColor.l === undefined || isNaN(hslColor.l)
      ? 0
      : Math.max(0, Math.min(1, hslColor.l));
  const alpha =
    hslColor.alpha === undefined || isNaN(hslColor.alpha)
      ? 1
      : Math.max(0, Math.min(1, hslColor.alpha));

  let hslString = `hsl(${formatNumber(h)} ${formatNumber(s * 100)}% ${formatNumber(l * 100)}%`;
  if (alpha < 0.999) {
    hslString += ` / ${alpha.toFixed(2)}`;
  }
  hslString += `)`;
  return hslString;
};

export const colorFormatter = (
  colorValue: string,
  format: ColorFormat = "hsl"
): string => {
  try {
    const color = culori.parse(colorValue);
    if (!color) throw new Error(`Invalid color input: ${colorValue}`);

    switch (format) {
      case "hsl": {
        const hslColor = culori.converter("hsl")(color);
        return formatHslToString(hslColor);
      }
      case "rgb": {
        const rgbColor = culori.converter("rgb")(color);
        const r = Math.round(rgbColor.r * 255);
        const g = Math.round(rgbColor.g * 255);
        const b = Math.round(rgbColor.b * 255);
        if (rgbColor.alpha !== undefined && rgbColor.alpha < 0.999) {
          return `rgba(${r}, ${g}, ${b}, ${rgbColor.alpha.toFixed(2)})`;
        }
        return `rgb(${r}, ${g}, ${b})`;
      }
      case "oklch": {
        const oklchColor = culori.converter("oklch")(color);
        const l_ = Math.max(0, Math.min(1, oklchColor.l ?? 0));
        const c_ = Math.max(0, oklchColor.c ?? 0);
        const h_ =
          oklchColor.h === undefined || isNaN(oklchColor.h)
            ? 0
            : ((oklchColor.h % 360) + 360) % 360;
        const alpha_ =
          oklchColor.alpha === undefined || isNaN(oklchColor.alpha)
            ? 1
            : Math.max(0, Math.min(1, oklchColor.alpha));
        let str = `oklch(${l_.toFixed(4)} ${c_.toFixed(4)} ${h_.toFixed(2)}`;
        if (alpha_ < 0.999) {
          str += ` / ${alpha_.toFixed(2)}`;
        }
        str += ")";
        return str;
      }
      case "hex":
        return culori.formatHex(color);
      default:
        console.warn(`Unknown color format: ${format}`);
        return colorValue;
    }
  } catch (error) {
    console.error(
      `Failed to convert color '${colorValue}' to ${format}:`,
      error
    );
    if (format === "hsl") return "hsl(0 0% 0%)";
    if (format === "rgb") return "rgb(0 0 0)";
    if (format === "oklch") return "oklch(0 0 0)";
    if (format === "hex") return "#000000";
    return colorValue;
  }
};

export const convertToHSL = (colorValue: string): string =>
  colorFormatter(colorValue, "hsl");

// Converters
const oklchConverter = converter("oklch");
const rgbConverter = converter("rgb");
const hslConverter = converter("hsl");

// --- Public API ---

export const convertToOklch = (colorString: string): Oklch | null => {
  try {
    const parsed = parse(colorString);
    if (parsed) {
      return oklchConverter(parsed);
    }
  } catch (e) {
    console.error(`Failed to parse and convert ${colorString} to Oklch:`, e);
  }
  return null;
};

export const formatOklchToCss = (oklchColor: Oklch): string => {
  try {
    // Ensure all components have default values if undefined before formatting
    const l = Math.max(0, Math.min(1, oklchColor.l ?? 0));
    const c = Math.max(0, oklchColor.c ?? 0); // Chroma cannot be negative
    const h =
      oklchColor.h === undefined || isNaN(oklchColor.h)
        ? 0
        : ((oklchColor.h % 360) + 360) % 360;
    const alpha =
      oklchColor.alpha === undefined || isNaN(oklchColor.alpha)
        ? 1
        : Math.max(0, Math.min(1, oklchColor.alpha));

    let str = `oklch(${l.toFixed(4)} ${c.toFixed(4)} ${h.toFixed(2)}`;
    if (alpha < 0.999) {
      // Check against 0.999 to handle floating point inaccuracies
      str += ` / ${alpha.toFixed(2)}`;
    }
    str += ")";
    return str;
  } catch (e) {
    console.error("Error formatting OKLCH to string:", e);
    return ""; // Fallback for invalid Oklch object
  }
};

export const convertToRgbString = (colorString: string): string => {
  return colorFormatter(colorString, "rgb");
};

export const convertToHslString = (colorString: string): string => {
  try {
    const parsedColor = parse(colorString);
    if (parsedColor) {
      // Prioritize converting to Oklch first if it's an HSL operation
      // to demonstrate or test Oklch pipeline, then back to HSL for output
      // For a real scenario, you might convert directly if not modifying in Oklch space
      const oklch = oklchConverter(parsedColor);
      if (oklch) {
        const hslColor = hslConverter(oklch); // Convert Oklch to HSL
        return formatHslToString(hslColor); // formatHsl from culori handles undefined alpha
      }
    }
  } catch (error) {
    console.error(
      `Failed to parse or convert ${colorString} to HSL via Oklch: `,
      error
    );
  }
  return "hsl(0, 0%, 0%)"; // Fallback HSL string
};

export const getTextColor = (backgroundColor: string): string => {
  // Basic contrast checker. Returns black or white.
  // This is a placeholder. You may need to restore or implement more sophisticated logic.
  try {
    const color = parse(backgroundColor);
    if (!color) return "#000000"; // Default to black on parse error
    // Using relative luminance formula component (Y) from sRGB
    // L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    // where R, G, B are 0-1 (sRGB values)
    // culori's parse result usually has r,g,b in 0-1 range if it's a color with RGB channels
    const rgb = converter("rgb")(color);
    const L =
      0.2126 * (rgb.r ?? 0) + 0.7152 * (rgb.g ?? 0) + 0.0722 * (rgb.b ?? 0);
    return L > 0.5 ? "#000000" : "#FFFFFF"; // Choose black for light backgrounds, white for dark
  } catch (e) {
    console.error("Error in getTextColor:", e);
    return "#000000"; // Default to black on error
  }
};
