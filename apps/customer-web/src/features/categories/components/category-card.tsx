// src/features/categories/components/category-card.tsx

"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";

import type { Category } from "@/src/features/categories/types/category.types";

interface CategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
}

export function CategoryCard({
  category,
  onClick,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={() => onClick?.(category)}
    >
      <Card
        className="
          cursor-pointer
          transition-all
          hover:shadow-md
        "
      >
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between">
            <h3
              className="
                text-lg
                font-semibold
                line-clamp-1
              "
            >
              {category.name}
            </h3>

            <Badge
              variant={
                category.status === "ACTIVE"
                  ? "success"
                  : "danger"
              }
            >
              {category.status}
            </Badge>
          </div>

          {category.description && (
            <p
              className="
                text-sm
                text-muted-foreground
                line-clamp-2
              "
            >
              {category.description}
            </p>
          )}
        </div>
      </Card>
    </button>
  );
}