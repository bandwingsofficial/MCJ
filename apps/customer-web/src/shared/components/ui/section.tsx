// src/shared/components/ui/section.tsx

import { ReactNode } from "react";

import { cn } from "@/src/shared/lib/cn";

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export function Section({
  children,
  className,
}: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-20",
        className
      )}
    >
      {children}
    </section>
  );
}