"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

interface AvatarProps {
  src?: string;
  alt: string;
  fallback: string;
}

export function Avatar({
  src,
  alt,
  fallback,
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
      />

      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center bg-[#2563EB] text-sm font-semibold text-white"
      >
        {fallback}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}