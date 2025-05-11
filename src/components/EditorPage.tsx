import { getEditorConfig } from "@/config/editors";
import { cn } from "@/lib/utils";
import Editor from "@/components/editor/editor";
// We might not need Next.js specific Metadata here, Astro handles metadata differently.
// import { Metadata } from "next";
import { Header } from "@/components/editor/header";
import { Suspense } from "react";
import { Loading } from "@/components/loading";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

// Metadata will be handled by the Astro page
// export const metadata: Metadata = {
//   title: "Theme Editor",
//   description: "CSS theme editor for shadcn/ui and Tailwind CSS",
// };

export default function EditorPage() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className={cn("text-foreground bg-background flex h-screen flex-col transition-colors")}>
          <Header />
          <main className="flex-1 overflow-hidden">
            <Suspense fallback={<Loading />}>
              <Editor config={getEditorConfig("theme")} themePromise={Promise.resolve(null)} />
            </Suspense>
          </main>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}
