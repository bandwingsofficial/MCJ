"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { ChevronRight, Folder } from "lucide-react"; 
import type { Category } from "@/src/features/categories/types/category.types";

interface CategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      className="group w-full text-left outline-none"
      onClick={() => onClick?.(category)}
    >
      <Card className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300">
        <div className="flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 text-slate-500">
              <Folder className="h-5 w-5" />
            </div>
            <Badge variant="default" className="rounded-sm text-[10px] uppercase">
              {category.status.toLowerCase()}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">{category.name}</h3>
            {category.description && (
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">{category.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400 group-hover:text-primary">
            <span>Explore Courses</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </Card>
    </button>
  );
}