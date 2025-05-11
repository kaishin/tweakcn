import {useMemo, useState} from "react";
import {Button} from "@/components/ui/button";
import {Copy, Check, Heart} from "lucide-react";
import type {ThemeEditorState} from "@/types/editor";
import {ScrollArea, ScrollBar} from "../ui/scroll-area";
import type {ColorFormat} from "../../types";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem
} from "../ui/select";
import {usePostHog} from "posthog-js/react";
import {useEditorStore} from "@/store/editor-store";
import {usePreferencesStore} from "@/store/preferences-store";
import {generateThemeCode} from "@/utils/theme-style-generator";
import {useThemePresetStore} from "@/store/theme-preset-store";
import {Alert, AlertDescription, AlertTitle} from "../ui/alert";

interface CodePanelProps {
  themeEditorState: ThemeEditorState;
}

const CodePanel: React.FC<CodePanelProps> = ({themeEditorState}) => {
  const [registryCopied, setRegistryCopied] = useState(false);
  const [copied, setCopied] = useState(false);
  const posthog = usePostHog();

  const preset = useEditorStore((state) => state.themeState.preset);
  const colorFormat = usePreferencesStore((state) => state.colorFormat);
  const tailwindVersion = usePreferencesStore((state) => state.tailwindVersion);
  const packageManager = usePreferencesStore((state) => state.packageManager);
  const setColorFormat = usePreferencesStore((state) => state.setColorFormat);
  const setTailwindVersion = usePreferencesStore(
    (state) => state.setTailwindVersion
  );
  const setPackageManager = usePreferencesStore(
    (state) => state.setPackageManager
  );
  const hasUnsavedChanges = useEditorStore((state) => state.hasUnsavedChanges);

  const isSavedPreset = useThemePresetStore(
    (state) => preset && state.getPreset(preset)?.source === "SAVED"
  );

  const code = generateThemeCode(
    themeEditorState,
    colorFormat,
    tailwindVersion
  );

  const captureCopyEvent = (event: string) => {
    posthog.capture(event, {
      editorType: "theme",
      preset,
      colorFormat,
      tailwindVersion
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      captureCopyEvent("COPY_CODE");
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex-none">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Theme Code</h2>
        </div>
      </div>
      <div className="mb-4 flex items-center gap-2">
        <Select
          value={tailwindVersion}
          onValueChange={(value: "3" | "4") => {
            setTailwindVersion(value);
            if (value === "4" && colorFormat === "hsl") {
              setColorFormat("oklch");
            }
          }}
        >
          <SelectTrigger className="bg-muted/50 w-fit gap-1 border-none outline-hidden focus:border-none focus:ring-transparent">
            <SelectValue className="focus:ring-transparent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Tailwind v3</SelectItem>
            <SelectItem value="4">Tailwind v4</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={colorFormat}
          onValueChange={(value: ColorFormat) => setColorFormat(value)}
        >
          <SelectTrigger className="bg-muted/50 w-fit gap-1 border-none outline-hidden focus:border-none focus:ring-transparent">
            <SelectValue className="focus:ring-transparent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hsl">hsl</SelectItem>
            <SelectItem value="oklch">oklch</SelectItem>
            <SelectItem value="rgb">rgb</SelectItem>
            <SelectItem value="hex">hex</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border">
        <div className="bg-muted/50 flex flex-none items-center justify-between border-b px-4 py-2">
          <span className="text-sm font-medium">index.css</span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(code)}
              className="h-8"
              aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
            >
              {copied ? (
                <>
                  <Check className="size-4" />
                  <span className="sr-only md:not-sr-only">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-4" />
                  <span className="sr-only md:not-sr-only">Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <ScrollArea className="relative flex-1">
          <pre className="h-full p-4 text-sm">
            <code>{code}</code>
          </pre>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default CodePanel;
