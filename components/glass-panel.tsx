import type { ReactNode } from "react";
import { cn } from "@/lib/workflow";

export function GlassPanel({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("glass-panel rounded-glass", className)}>{children}</section>;
}
