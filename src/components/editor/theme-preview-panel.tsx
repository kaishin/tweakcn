import type {ThemeEditorPreviewProps} from "@/types/theme";
import {Tabs, TabsContent, TabsList} from "@/components/ui/tabs";
import {ScrollArea, ScrollBar} from "../ui/scroll-area";
import ColorPreview from "./theme-preview/color-preview";
import TabsTriggerPill from "./theme-preview/tabs-trigger-pill";
import ExamplesPreviewContainer from "./theme-preview/examples-preview-container";
import {lazy} from "react";
import {Button} from "@/components/ui/button";
import {Maximize, Minimize, Moon, Sun} from "lucide-react";
import {useFullscreen} from "@/hooks/use-fullscreen";
import {cn} from "@/lib/utils";
import {useTheme} from "@/components/theme-provider";
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip";

const DemoCards = lazy(() => import("@/components/examples/demo-cards"));
const DemoMail = lazy(() => import("@/components/examples/mail"));
const DemoTasks = lazy(() => import("@/components/examples/tasks"));
const DemoMusic = lazy(() => import("@/components/examples/music"));
const DemoDashboard = lazy(() => import("@/components/examples/dashboard"));

const ThemePreviewPanel = ({styles, currentMode}: ThemeEditorPreviewProps) => {
  const {isFullscreen, toggleFullscreen} = useFullscreen();
  const {theme, toggleTheme} = useTheme();

  if (!styles || !styles[currentMode]) {
    return null;
  }

  const handleThemeToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const {clientX: x, clientY: y} = event;
    toggleTheme({x, y});
  };

  return (
    <>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          isFullscreen && "bg-background fixed inset-0 z-50"
        )}
      >
        <Tabs defaultValue="cards" className="flex flex-col overflow-hidden">
          <div className="mt-2 flex items-center justify-between px-4">
            <TabsList className="bg-background text-muted-foreground inline-flex w-fit items-center justify-center rounded-full px-0">
              <TabsTriggerPill value="cards">Cards</TabsTriggerPill>
              <div className="hidden md:flex">
                <TabsTriggerPill value="mail">Mail</TabsTriggerPill>
                <TabsTriggerPill value="tasks">Tasks</TabsTriggerPill>
                <TabsTriggerPill value="music">Music</TabsTriggerPill>
                <TabsTriggerPill value="dashboard">Dashboard</TabsTriggerPill>
              </div>
              <TabsTriggerPill value="colors">Color Palette</TabsTriggerPill>
            </TabsList>

            <div className="flex items-center gap-0">
              {isFullscreen && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleThemeToggle}
                      className="group h-8"
                    >
                      {theme === "light" ? (
                        <Sun className="size-4 transition-all group-hover:scale-120" />
                      ) : (
                        <Moon className="size-4 transition-all group-hover:scale-120" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Toggle Theme</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="group h-8"
                  >
                    {isFullscreen ? (
                      <Minimize className="size-4 transition-all group-hover:scale-120" />
                    ) : (
                      <Maximize className="size-4 transition-all group-hover:scale-120" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit full screen" : "Full screen"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <ScrollArea className="m-4 mt-2 flex flex-1 flex-col overflow-hidden rounded-lg border">
            <div className="flex h-full flex-1 flex-col">
              <TabsContent value="cards" className="my-4 h-full space-y-6 px-4">
                <ExamplesPreviewContainer>
                  <DemoCards />
                </ExamplesPreviewContainer>
              </TabsContent>

              <TabsContent
                value="mail"
                className="@container mt-0 h-full space-y-6"
              >
                <ExamplesPreviewContainer className="min-w-[1300px]">
                  <DemoMail />
                </ExamplesPreviewContainer>
              </TabsContent>

              <TabsContent
                value="tasks"
                className="@container mt-0 h-full space-y-6"
              >
                <ExamplesPreviewContainer className="min-w-[1300px]">
                  <DemoTasks />
                </ExamplesPreviewContainer>
              </TabsContent>

              <TabsContent
                value="music"
                className="@container mt-0 h-full space-y-6"
              >
                <ExamplesPreviewContainer className="min-w-[1300px]">
                  <DemoMusic />
                </ExamplesPreviewContainer>
              </TabsContent>

              <TabsContent
                value="dashboard"
                className="@container relative mt-0 h-full space-y-6"
              >
                <ExamplesPreviewContainer className="min-w-[1400px]">
                  <DemoDashboard />
                </ExamplesPreviewContainer>
              </TabsContent>

              <TabsContent value="colors" className="space-y-6 p-4">
                <ColorPreview styles={styles} currentMode={currentMode} />
              </TabsContent>

              <ScrollBar orientation="horizontal" />
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </>
  );
};

export default ThemePreviewPanel;
