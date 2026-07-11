// src/features/categories/components/category-card.tsx
"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
// Note: If you don't use Lucide react, replace ChevronRight with any icon/SVG wrapper you use
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
      <Card
        className="
          relative 
          overflow-hidden 
          rounded-2xl 
          border 
          border-slate-100 
          bg-white 
          p-6 
          transition-all 
          duration-300 
          ease-out
          hover:-translate-y-1 
          hover:border-primary/20 
          hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0,06)]
          group-focus-visible:ring-2 
          group-focus-visible:ring-primary
        "
      >
        <div className="flex flex-col justify-between h-full space-y-5">
          {/* Top Section: Icon & Status Badge */}
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary">
              <Folder className="h-5 w-5" />
            </div>
            
            <Badge
              variant={category.status === "ACTIVE" ? "success" : "danger"}
              className="px-2.5 py-0.5 text-xs font-medium rounded-full shadow-sm"
            >
              {category.status.toLowerCase()}
            </Badge>
          </div>

          {/* Middle Section: Title & Description */}
          <div className="space-y-1.5">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 group-hover:text-primary transition-colors">
              {category.name}
            </h3>
            
            {category.description && (
              <p className="text-sm leading-relaxed text-slate-500 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>

          {/* Bottom Section: Footer Action / Meta info */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-50 text-xs font-medium text-slate-400">
            <span>Explore Courses</span>
            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 text-slate-400 group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </button>
  );
}