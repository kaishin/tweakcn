import React from "react";
import {SliderWithInput} from "./slider-with-input"; // Assuming this path
import type {Oklch} from "culori";

interface OklchAdjustmentControlsProps {
  color: Oklch; // Expecting an Oklch object
  onChange: (newColor: Oklch) => void;
}

export const OklchAdjustmentControls: React.FC<
  OklchAdjustmentControlsProps
> = ({color, onChange}) => {
  const handleLightnessChange = (value: number) => {
    onChange({...color, l: value});
  };

  const handleChromaChange = (value: number) => {
    onChange({...color, c: value});
  };

  const handleHueChange = (value: number) => {
    onChange({...color, h: value});
  };

  const handleAlphaChange = (value: number) => {
    onChange({...color, alpha: value});
  };

  // Ensure color is always a valid Oklch object before accessing its properties
  const safeColor: Oklch =
    color && typeof color === "object" && "l" in color && "c" in color
      ? color
      : {mode: "oklch", l: 0, c: 0, h: 0, alpha: 1};

  return (
    <div className="grid gap-2">
      <SliderWithInput
        label="L"
        value={safeColor.l ?? 0}
        onChange={handleLightnessChange}
        min={0}
        max={1}
        step={0.01}
      />
      <SliderWithInput
        label="C"
        value={safeColor.c ?? 0}
        onChange={handleChromaChange}
        min={0}
        max={0.5} // Max chroma can be higher, but 0.5 is a safe upper bound for most gamuts
        step={0.001}
      />
      <SliderWithInput
        label="H"
        value={safeColor.h ?? 0}
        onChange={handleHueChange}
        min={0}
        max={360}
        step={1}
      />
      {safeColor.alpha !== undefined && (
        <SliderWithInput
          label="Alpha"
          value={safeColor.alpha}
          onChange={handleAlphaChange}
          min={0}
          max={1}
          step={0.01}
        />
      )}
    </div>
  );
};
