'use client';

import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Zap className="h-7 w-7 text-primary" />
      <span className="text-xl font-bold text-foreground">Agix Cloud AI</span>
    </div>
  );
}
