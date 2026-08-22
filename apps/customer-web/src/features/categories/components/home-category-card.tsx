"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import type { Category } from "@/src/features/categories/types/category.types";
import { getCategoryIconConfig } from "@/src/features/categories/utils/category-icon.utils";

interface HomeCategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
}

export function HomeCategoryCard({ category, onClick }: HomeCategoryCardProps) {
  const { Icon, containerClassName, iconClassName } =
    getCategoryIconConfig(category);
  const courseCount = category.courseCount ?? 0;

  return (
    <button
      type="button"
      className="group w-full text-left outline-none"
      onClick={() => onClick?.(category)}
    >
      <Card className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded ${containerClassName}`}
            >
              <Icon className={`h-5 w-5 ${iconClassName}`} />
            </div>
            <Badge variant="default" className="rounded-sm text-[10px] uppercase">
              {category.status.toLowerCase()}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">{category.name}</h3>
            {category.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400 group-hover:text-primary">
            <span>
              {courseCount} {courseCount === 1 ? "Course" : "Courses"}
            </span>
            <span>Explore →</span>
          </div>
        </div>
      </Card>
    </button>
  );
}
