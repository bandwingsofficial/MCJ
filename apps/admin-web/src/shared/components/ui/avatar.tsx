"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/src/shared/lib/cn";

interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  size?: "default" | "sm";
}

const sizeStyles = {
  default: {
    root: "h-10 w-10",
    fallback: "text-sm",
  },
  sm: {
    root: "h-8 w-8",
    fallback: "text-xs",
  },
} as const;

export function Avatar({
  src,
  alt,
  fallback,
  size = "default",
}: AvatarProps) {
  const styles = sizeStyles[size];

  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full",
        styles.root,
      )}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />

      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center bg-[#2563EB] font-semibold text-white",
          styles.fallback,
        )}
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}