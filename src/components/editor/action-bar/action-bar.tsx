import { useState } from "react";
import { useEditorStore } from "@/store/editor-store";
import { parseCssInput } from "@/utils/parse-css-input";
import { toast } from "@/hooks/use-toast";
import { CodePanelDialog } from "@/components/editor/code-panel-dialog";
import CssImportDialog from "@/components/editor/css-import-dialog";
import { Button } from "@/components/ui/button";
import { Code, Import } from "lucide-react";

export function ActionBar() {
  const { themeState, setThemeState } = useEditorStore();
  const [cssImportOpen, setCssImportOpen] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useState(false);

  const handleCssImport = (css: string) => {
    const { lightColors, darkColors } = parseCssInput(css);
    const styles = {
      ...themeState.styles,
      light: { ...themeState.styles.light, ...lightColors },
      dark: { ...themeState.styles.dark, ...darkColors },
    };

    setThemeState({
      ...themeState,
      styles,
    });

    toast({
      title: "CSS imported",
      description: "Your custom CSS has been imported successfully",
    });
  };

  return (
    <div className="border-b">
      <div className="flex h-14 items-center justify-end gap-4 px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCodePanelOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Code className="h-4 w-4" />
            <span>Code</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCssImportOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Import className="h-4 w-4" />
            <span>Import</span>
          </Button>
        </div>
      </div>

      <CssImportDialog
        open={cssImportOpen}
        onOpenChange={setCssImportOpen}
        onImport={handleCssImport}
      />
      <CodePanelDialog
        open={codePanelOpen}
        onOpenChange={setCodePanelOpen}
        themeEditorState={themeState}
      />
    </div>
  );
}
