import React, {useState, useEffect, useMemo, useCallback} from "react";
import {Label} from "@/components/ui/label";
import type {ColorPickerProps} from "@/types/index";
import {debounce} from "@/utils/debounce";
import {parse, converter, formatHex, type Oklch} from "culori";
import {OklchAdjustmentControls} from "./oklch-adjustment-controls";

const oklchConverter = converter("oklch");

// Helper to safely parse a color string to an Oklch object
const parseToOklch = (colorStr: string): Oklch | null => {
  try {
    const parsed = parse(colorStr);
    if (parsed) {
      return oklchConverter(parsed);
    }
  } catch (_) {
    // Ignore parsing errors for now, could be an intermediate invalid input
  }
  return null;
};

// Helper to format Oklch object to CSS string, or keep original if invalid
const formatOklchToString = (oklchColor: Oklch | null | string): string => {
  if (typeof oklchColor === "string") {
    // If it's already a string, assume it's what we want or a fallback
    return oklchColor;
  }
  if (oklchColor && oklchColor.mode === "oklch") {
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
    }
  }
  return ""; // Fallback for invalid Oklch object
};

const ColorPicker = ({color, onChange, label}: ColorPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // Ensure internal color is always Oklch or a string that might be parsable
  const [internalColor, setInternalColor] = useState<Oklch | string>(() => {
    const parsed = parseToOklch(color);
    return parsed || color; // Keep original string if parsing fails initially
  });

  const debouncedExternalOnChange = useMemo(
    () => debounce((value: string) => onChange(value), 250),
    [onChange]
  );

  useEffect(() => {
    const newParsedColor = parseToOklch(color);
    if (newParsedColor) {
      // Compare based on a consistent string representation to avoid loops
      const currentFormatted = formatOklchToString(internalColor);
      const newFormatted = formatOklchToString(newParsedColor);
      if (currentFormatted !== newFormatted) {
        setInternalColor(newParsedColor);
      }
    } else if (color !== formatOklchToString(internalColor)) {
      // If the external color is not parsable to Oklch and different from current
      setInternalColor(color);
    }
  }, [color, internalColor]); // Added internalColor to dependencies

  const displayOklchString = useMemo(() => {
    return formatOklchToString(internalColor);
  }, [internalColor]);

  const displayHexString = useMemo(() => {
    if (typeof internalColor === "string") {
      const parsed = parse(internalColor);
      if (parsed) return formatHex(parsed);
      return "#000000"; // Fallback
    }
    try {
      return formatHex(internalColor);
    } catch (_) {
      return "#000000"; // Fallback if direct conversion fails
    }
  }, [internalColor]);

  const debouncedInternalUpdate = useMemo(
    () =>
      debounce((newColor: Oklch) => {
        const formatted = formatOklchToString(newColor);
        if (formatted) {
          // Only call onChange if formatting is successful
          debouncedExternalOnChange(formatted);
        }
      }, 50),
    [debouncedExternalOnChange]
  );

  const handleOklchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColorStr = e.target.value;
    const parsed = parseToOklch(newColorStr);
    setInternalColor(parsed || newColorStr); // Update internal state immediately for text input responsiveness
    if (parsed) {
      debouncedExternalOnChange(formatOklchToString(parsed));
    }
  };

  const handleNativeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hexColor = e.target.value;
    const oklchVal = parseToOklch(hexColor);
    if (oklchVal) {
      setInternalColor(oklchVal);
      debouncedExternalOnChange(formatOklchToString(oklchVal));
    } else {
      // If hex is somehow invalid, keep it as string to show in input
      setInternalColor(hexColor);
      // Optionally, attempt to inform parent about invalid input if desired
    }
  };

  const handleOklchControlsChange = useCallback(
    (newOklch: Oklch) => {
      // Ensure the newOklch object from controls is valid before updating
      const validOklch: Oklch = {
        mode: "oklch",
        l: Math.max(0, Math.min(1, newOklch.l ?? 0)),
        c: Math.max(0, newOklch.c ?? 0),
        h:
          newOklch.h === undefined || isNaN(newOklch.h)
            ? 0
            : ((newOklch.h % 360) + 360) % 360,
        alpha:
          newOklch.alpha === undefined || isNaN(newOklch.alpha)
            ? 1
            : Math.max(0, Math.min(1, newOklch.alpha))
      };
      setInternalColor(validOklch);
      debouncedInternalUpdate(validOklch);
    },
    [debouncedInternalUpdate]
  );

  const currentOklchForControls = useMemo(() => {
    let baseColor: Partial<Oklch> = {
      mode: "oklch",
      l: 0.75,
      c: 0.15,
      h: 270,
      alpha: 1
    }; // Default Oklch with mode
    if (typeof internalColor === "string") {
      const parsed = parseToOklch(internalColor);
      if (parsed) {
        baseColor = parsed;
      }
    } else {
      baseColor = internalColor;
    }
    // Ensure all parts are defined for the controls, and mode is explicitly "oklch"
    return {
      mode: "oklch", // Explicitly set mode
      l: baseColor.l ?? 0.75,
      c: baseColor.c ?? 0.15,
      h: baseColor.h ?? 270,
      alpha: baseColor.alpha ?? 1
    } as Oklch; // Assert as Oklch as we've ensured all properties
  }, [internalColor]);

  // Cleanup debounced functions on unmount
  useEffect(() => {
    return () => {
      debouncedExternalOnChange.cancel();
      debouncedInternalUpdate.cancel();
    };
  }, [debouncedExternalOnChange, debouncedInternalUpdate]);

  return (
    <div className="mb-3">
      <div className="mb-1.5 flex items-center justify-between">
        <Label
          htmlFor={`color-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className="text-xs font-medium"
        >
          {label}
        </Label>
      </div>
      <div className="flex items-center gap-1">
        <div
          className="relative flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded border"
          style={{backgroundColor: displayOklchString}}
          onClick={() => setIsOpen(!isOpen)}
        >
          <input
            type="color"
            id={`color-${label.replace(/\s+/g, "-").toLowerCase()}`}
            value={displayHexString}
            onChange={handleNativeColorChange}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <input
          type="text"
          value={displayOklchString}
          onChange={handleOklchTextChange}
          className="bg-input/25 border-border/20 h-8 flex-1 rounded border px-2 text-sm"
        />
      </div>
      {isOpen && (
        <div className="bg-background mt-2 space-y-3 rounded border p-2 shadow-lg">
          <OklchAdjustmentControls
            color={currentOklchForControls}
            onChange={handleOklchControlsChange}
          />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
