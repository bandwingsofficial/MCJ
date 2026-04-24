import { ReactNode } from "react";
import { cn } from "@/src/shared/lib/cn";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("w-full", className)}>
      {children}
    </section>
  );
}