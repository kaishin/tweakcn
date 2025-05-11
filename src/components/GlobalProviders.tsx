import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

interface GlobalProvidersProps {
  children: React.ReactNode;
}

export function GlobalProviders({ children }: GlobalProvidersProps) {
  return (
    <TooltipProvider delayDuration={0}>
      {children}
    </TooltipProvider>
  );
} 
