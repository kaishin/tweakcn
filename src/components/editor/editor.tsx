import React, {useEffect, useState} from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import type {EditorConfig} from "@/types/editor";
import type {ThemeStyles, ThemeSchema} from "@/types/theme";
import {Sliders} from "lucide-react";
import {useEditorStore} from "@/store/editor-store";
import {ActionBar} from "@/components/editor/action-bar/action-bar";

interface EditorProps {
  config: EditorConfig;
  themePromise: Promise<ThemeSchema | null> | null;
}

const isThemeStyles = (styles: unknown): styles is ThemeStyles => {
  return (
    !!styles &&
    typeof styles === "object" &&
    styles !== null &&
    "light" in styles &&
    "dark" in styles
  );
};

const Editor: React.FC<EditorProps> = ({config, themePromise}) => {
  const themeState = useEditorStore((state) => state.themeState);
  const setThemeState = useEditorStore((state) => state.setThemeState);
  const Controls = config.controls;
  const Preview = config.preview;

  // State to store the loaded theme
  const [initialTheme, setInitialTheme] = useState<ThemeSchema | null>(null);

  // Load theme if provided via promise
  useEffect(() => {
    if (themePromise) {
      themePromise
        .then((theme) => {
          if (theme) {
            setInitialTheme(theme);
          }
        })
        .catch((error) => {
          console.error("Failed to load theme:", error);
        });
    }
  }, [themePromise]);

  const handleStyleChange = React.useCallback(
    (newStyles: ThemeStyles) => {
      const prev = useEditorStore.getState().themeState;
      setThemeState({...prev, styles: newStyles});
    },
    [setThemeState]
  );

  useEffect(() => {
    if (initialTheme && isThemeStyles(initialTheme.styles)) {
      const prev = useEditorStore.getState().themeState;
      setThemeState({
        ...prev,
        styles: initialTheme.styles,
        preset: initialTheme.id
      });
    }
  }, [initialTheme, setThemeState]);

  if (initialTheme && !isThemeStyles(initialTheme.styles)) {
    return (
      <div className="text-destructive flex h-full items-center justify-center">
        Fetched theme data is invalid.
      </div>
    );
  }

  const styles = themeState.styles;

  return (
    <div className="h-full overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden h-full md:block">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="flex h-full flex-col">
              <Controls
                styles={styles}
                onChange={handleStyleChange}
                currentMode={themeState.currentMode}
                themePromise={themePromise}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={70} minSize={20}>
            <div className="flex h-full flex-col">
              <div className="flex min-h-0 flex-1 flex-col">
                <ActionBar />
                <Preview styles={styles} currentMode={themeState.currentMode} />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile Layout */}
      <div className="h-full md:hidden">
        <Tabs defaultValue="controls" className="h-full">
          <TabsList className="w-full rounded-none">
            <TabsTrigger value="controls" className="flex-1">
              <Sliders className="mr-2 h-4 w-4" />
              Controls
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <TabsContent value="controls" className="mt-0 h-[calc(100%-2.5rem)]">
            <div className="flex h-full flex-col">
              <Controls
                styles={styles}
                onChange={handleStyleChange}
                currentMode={themeState.currentMode}
                themePromise={themePromise}
              />
            </div>
          </TabsContent>
          <TabsContent value="preview" className="mt-0 h-[calc(100%-2.5rem)]">
            <div className="flex h-full flex-col">
              <ActionBar />
              <Preview styles={styles} currentMode={themeState.currentMode} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Editor;
