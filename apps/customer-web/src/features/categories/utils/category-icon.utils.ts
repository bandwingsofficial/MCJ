import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Calculator,
  Code2,
  Folder,
  Palette,
} from "lucide-react";

import type { Category } from "@/src/features/categories/types/category.types";

interface CategoryIconConfig {
  Icon: LucideIcon;
  containerClassName: string;
  iconClassName: string;
}

function getCategoryKey(category: Category): string {
  return `${category.slug} ${category.name} ${category.description ?? ""}`.toLowerCase();
}

export function getCategoryIconConfig(
  category: Category,
): CategoryIconConfig {
  const key = getCategoryKey(category);

  if (key.includes("account")) {
    return {
      Icon: Calculator,
      containerClassName: "bg-emerald-50",
      iconClassName: "text-emerald-600",
    };
  }

  if (
    key.includes("software") ||
    key.includes("development") ||
    key.includes("programming") ||
    key.includes("code")
  ) {
    return {
      Icon: Code2,
      containerClassName: "bg-indigo-50",
      iconClassName: "text-indigo-600",
    };
  }

  if (
    key.includes("design") ||
    key.includes("creative") ||
    key.includes("ui") ||
    key.includes("ux")
  ) {
    return {
      Icon: Palette,
      containerClassName: "bg-rose-50",
      iconClassName: "text-rose-600",
    };
  }

  if (
    key.includes("data science") ||
    key.includes("analytics") ||
    key.includes("data")
  ) {
    return {
      Icon: BarChart3,
      containerClassName: "bg-amber-50",
      iconClassName: "text-amber-600",
    };
  }

  return {
    Icon: Folder,
    containerClassName: "bg-slate-100",
    iconClassName: "text-slate-500",
  };
}
