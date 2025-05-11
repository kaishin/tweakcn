import { ThemeToggle } from "./theme-toggle";
import { ImportButton } from "./import-button";
import { CodeButton } from "./code-button";
import { Separator } from "@/components/ui/separator";

interface ActionBarButtonsProps {
  onImportClick: () => void;
  onCodeClick: () => void;
}

export function ActionBarButtons({
  onImportClick,
  onCodeClick,
}: ActionBarButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Separator orientation="vertical" className="mx-1 h-8" />
      <ImportButton onImportClick={onImportClick} />
      <CodeButton onCodeClick={onCodeClick} />
    </div>
  );
}