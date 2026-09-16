"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/src/shared/lib/cn";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<
    typeof ProgressPrimitive.Root
  > {
  value?: number;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, ...props }, ref) => {
  const progress = Math.min(
    Math.max(value, 0),
    100,
  );

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-500 ease-in-out"
        style={{
          transform: `translateX(-${100 - progress}%)`,
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName =
  ProgressPrimitive.Root.displayName;

export { Progress };