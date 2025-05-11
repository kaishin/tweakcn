import {FileCode, Palette, RefreshCw, Undo2} from "lucide-react";
import type {LucideIcon} from "lucide-react";
import {Button} from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import {cn} from "@/lib/utils";

interface MenuItemProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  disabled,
  title
}: MenuItemProps) => {
  return (
    <DropdownMenuItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-accent/50 cursor-pointer"
      )}
      title={title}
    >
      <Icon className="text-muted-foreground h-4 w-4" />
      <span>{label}</span>
    </DropdownMenuItem>
  );
};

interface ThemeControlActionsProps {
  hasChanges: boolean;
  hasPresetChanges: boolean;
  onReset: () => void;
  onResetToPreset: () => void;
  onImportClick: () => void;
}

const ThemeControlActions = ({
  hasChanges,
  hasPresetChanges,
  onReset,
  onResetToPreset,
  onImportClick
}: ThemeControlActionsProps) => {
  const menuItems: MenuItemProps[] = [
    {
      icon: FileCode,
      label: "Import from CSS file",
      onClick: onImportClick
    },
    {
      icon: RefreshCw,
      label: "Reset to Current Preset",
      onClick: onResetToPreset,
      disabled: !hasPresetChanges,
      title: hasPresetChanges
        ? "Reset to current preset"
        : "No changes from preset"
    },
    {
      icon: Undo2,
      label: "Reset to Default Theme",
      onClick: onReset,
      disabled: !hasChanges,
      title: hasChanges ? "Reset to base theme" : "No changes to reset"
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-accent/50 h-8 gap-1.5 px-2"
        >
          <Palette className="size-3.5" />
          <span className="text-sm">Options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit p-2">
        {menuItems.map((item, index) => (
          <MenuItem key={index} {...item} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeControlActions;
