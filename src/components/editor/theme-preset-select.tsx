import React, {useCallback, useMemo, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import type {ThemePreset} from "@/types/theme";
import {useEditorStore} from "@/store/editor-store";
import {getPresetThemeStyles} from "@/utils/theme-preset-helper";
import {Button} from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Moon,
  Search,
  Shuffle,
  Sun,
  Heart
} from "lucide-react";
import {useTheme} from "@/components/theme-provider";
import {Separator} from "@/components/ui/separator";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

interface ThemePresetSelectProps {
  presets: Record<string, ThemePreset>;
  currentPreset: string | null;
  onPresetChange: (preset: string) => void;
}

interface ColorBoxProps {
  color: string;
}

const ColorBox: React.FC<ColorBoxProps> = ({color}) => (
  <div
    className="border-muted h-3 w-3 rounded-sm border"
    style={{backgroundColor: color}}
  />
);

interface ThemeColorsProps {
  presetName: string;
  mode: "light" | "dark";
}

const ThemeColors: React.FC<ThemeColorsProps> = ({presetName, mode}) => {
  const styles = getPresetThemeStyles(presetName)[mode];
  return (
    <div className="flex gap-0.5">
      <ColorBox color={styles.primary} />
      <ColorBox color={styles.accent} />
      <ColorBox color={styles.secondary} />
      <ColorBox color={styles.border} />
    </div>
  );
};

const isThemeNew = (preset: ThemePreset | undefined) => {
  if (!preset || !preset.createdAt) return false;
  const createdAt = new Date(preset.createdAt);
  const timePeriod = new Date();
  timePeriod.setDate(timePeriod.getDate() - 5);
  return createdAt > timePeriod;
};

interface ThemeControlsProps {
  onRandomize: () => void;
  onThemeToggle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  theme: string;
}

const ThemeControls: React.FC<ThemeControlsProps> = ({
  onRandomize,
  onThemeToggle,
  theme
}) => (
  <div className="flex gap-1">
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onThemeToggle}
        >
          {theme === "light" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">Toggle theme</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onRandomize}
        >
          <Shuffle className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-xs">Random theme</p>
      </TooltipContent>
    </Tooltip>
  </div>
);

interface ThemeCycleButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
}

const ThemeCycleButton: React.FC<ThemeCycleButtonProps> = ({
  direction,
  onClick
}) => (
  <>
    <Separator orientation="vertical" className="h-8" />
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="bg-muted/10 size-14 shrink-0 rounded-none"
          onClick={onClick}
        >
          {direction === "prev" ? (
            <ArrowLeft className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {direction === "prev" ? "Previous theme" : "Next theme"}
      </TooltipContent>
    </Tooltip>
  </>
);

const ThemePresetSelect: React.FC<ThemePresetSelectProps> = ({
  presets,
  currentPreset,
  onPresetChange
}) => {
  const {themeState, hasUnsavedChanges} = useEditorStore();
  const {theme, toggleTheme} = useTheme();
  const mode = themeState.currentMode;
  const [search, setSearch] = useState("");

  const isSavedTheme = useCallback(
    (presetId: string) => {
      return presets[presetId]?.source === "SAVED";
    },
    [presets]
  );

  const presetNames = useMemo(
    () => ["default", ...Object.keys(presets)],
    [presets]
  );
  const value = presetNames?.find((name) => name === currentPreset);

  const filteredPresets = useMemo(() => {
    const filteredList =
      search.trim() === ""
        ? presetNames
        : Object.entries(presets)
            .filter(([_, preset]) =>
              preset.label?.toLowerCase().includes(search.toLowerCase())
            )
            .map(([name]) => name);

    // Separate saved and default themes
    const savedThemesList = filteredList.filter(
      (name) => name !== "default" && isSavedTheme(name)
    );
    const defaultThemesList = filteredList.filter(
      (name) => !savedThemesList.includes(name)
    );

    // Sort each list
    const sortThemes = (list: string[]) =>
      list.sort((a, b) => {
        const labelA = presets[a]?.label || a;
        const labelB = presets[b]?.label || b;
        return labelA.localeCompare(labelB);
      });

    // Combine saved themes first, then default themes
    return [...sortThemes(savedThemesList), ...sortThemes(defaultThemesList)];
  }, [presetNames, search, presets, isSavedTheme]);

  const currentIndex =
    useMemo(
      () => filteredPresets.indexOf(value || "default"),
      [filteredPresets, value]
    ) ?? 0;

  const randomize = useCallback(() => {
    const random = Math.floor(Math.random() * filteredPresets.length);
    onPresetChange(filteredPresets[random]);
  }, [onPresetChange, filteredPresets]);

  const cycleTheme = useCallback(
    (direction: "prev" | "next") => {
      const newIndex =
        direction === "next"
          ? (currentIndex + 1) % filteredPresets.length
          : (currentIndex - 1 + filteredPresets.length) %
            filteredPresets.length;
      onPresetChange(filteredPresets[newIndex]);
    },
    [currentIndex, filteredPresets, onPresetChange]
  );

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {clientX: x, clientY: y} = event;
    toggleTheme({x, y});
  };

  const filteredSavedThemes = useMemo(() => {
    return filteredPresets.filter(
      (name) => name !== "default" && isSavedTheme(name)
    );
  }, [filteredPresets, isSavedTheme]);

  const filteredDefaultThemes = useMemo(() => {
    return filteredPresets.filter(
      (name) => name === "default" || !isSavedTheme(name)
    );
  }, [filteredPresets, isSavedTheme]);

  return (
    <div className="flex items-center">
      <TooltipProvider>
        <Popover>
          <PopoverTrigger className="bg-muted/10" asChild>
            <Button
              variant="ghost"
              className={cn(
                "group relative min-h-14 w-full justify-between rounded-none md:min-w-56"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  <ColorBox color={themeState.styles[mode].primary} />
                  <ColorBox color={themeState.styles[mode].accent} />
                  <ColorBox color={themeState.styles[mode].secondary} />
                  <ColorBox color={themeState.styles[mode].border} />
                </div>
                {value !== "default" &&
                  value &&
                  isSavedTheme(value) &&
                  !hasUnsavedChanges() && (
                    <div className="bg-muted rounded-full p-1">
                      <Heart
                        className="size-1"
                        stroke="var(--muted)"
                        fill="var(--muted-foreground)"
                      />
                    </div>
                  )}
                <span className="font-medium capitalize">
                  {hasUnsavedChanges() ? (
                    <>Custom</>
                  ) : (
                    presets[value || "default"]?.label || "default"
                  )}
                </span>
              </div>
              <ChevronDown className="size-4 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ml-4 w-[300px] p-0" align="center">
            <Command className="w-full rounded-lg shadow-md">
              <div className="flex w-full items-center">
                <div className="flex w-full items-center border-b px-3 py-1">
                  <Search className="size-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search themes..."
                    className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <ThemeControls
                  onRandomize={randomize}
                  onThemeToggle={handleThemeToggle}
                  theme={theme || "light"}
                />
              </div>

              <ScrollArea className="h-96">
                <CommandEmpty>No theme found.</CommandEmpty>
                {filteredSavedThemes.length > 0 && (
                  <CommandGroup heading="Saved Themes">
                    {filteredSavedThemes.map((presetName) => (
                      <CommandItem
                        key={presetName}
                        onSelect={() => onPresetChange(presetName)}
                        className="flex w-full cursor-pointer items-center justify-between gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <ThemeColors presetName={presetName} mode={mode} />
                          <span className="capitalize">
                            {presets[presetName]?.label}
                          </span>
                          {isThemeNew(presets[presetName]) && (
                            <Badge>New</Badge>
                          )}
                        </div>
                        {value === presetName && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {filteredDefaultThemes.length > 0 && (
                  <CommandGroup
                    heading={
                      filteredSavedThemes.length > 0
                        ? "Default Themes"
                        : "Themes"
                    }
                  >
                    {filteredDefaultThemes.map((presetName) => (
                      <CommandItem
                        key={presetName}
                        onSelect={() => onPresetChange(presetName)}
                        className="flex w-full cursor-pointer items-center justify-between gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <ThemeColors presetName={presetName} mode={mode} />
                          <span className="capitalize">
                            {presets[presetName]?.label || presetName}
                          </span>
                          {isThemeNew(presets[presetName]) && (
                            <Badge>New</Badge>
                          )}
                        </div>
                        {value === presetName && (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </ScrollArea>
            </Command>
          </PopoverContent>
        </Popover>
        <ThemeCycleButton direction="prev" onClick={() => cycleTheme("prev")} />
        <ThemeCycleButton direction="next" onClick={() => cycleTheme("next")} />
      </TooltipProvider>
    </div>
  );
};

export default ThemePresetSelect;
