"use client";

import * as React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/src/shared/lib/cn";

export const Tabs = TabsPrimitive.Root;

export const TabsList = TabsPrimitive.List;

export const TabsTrigger = TabsPrimitive.Trigger;

type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    forceMount
    className={cn("data-[state=inactive]:hidden", className)}
    {...props}
  />
));

TabsContent.displayName = TabsPrimitive.Content.displayName;
