"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import type { Category } from "@/src/features/categories/types/category.types";
import { getCategoryIconConfig } from "@/src/features/categories/utils/category-icon.utils";

interface HomeCategoryCardProps {
  category: Category;
  onClick?: (category: Category) => void;
}

export function HomeCategoryCard({
  category,
  onClick,
}: HomeCategoryCardProps) {
  const { Icon, containerClassName, iconClassName } =
    getCategoryIconConfig(category);

  const courseCount = category.courseCount ?? 0;
  const thumbnailUrl = category.thumbnailUrl?.trim() || null;
  const isActive = category.status === "ACTIVE";

  return (
    <button
      type="button"
      className="
        group h-full w-full text-left outline-none
        focus-visible:rounded-2xl
        focus-visible:ring-2
        focus-visible:ring-[#b8922a]/50
        focus-visible:ring-offset-2
      "
      onClick={() => onClick?.(category)}
      aria-label={`Explore ${category.name} category`}
    >
      <Card
        className="
          relative flex h-full flex-col overflow-hidden
          rounded-2xl
          border border-slate-200/80
          bg-white
          p-0
          shadow-[0_3px_14px_rgba(15,32,68,0.04)]
          transition-all duration-300 ease-out
          group-hover:-translate-y-1
          group-hover:border-[#d4a84b]/50
          group-hover:shadow-[0_16px_36px_rgba(15,32,68,0.10)]
        "
      >
        {/* Image */}

        <div className="relative h-[138px] w-full shrink-0 overflow-hidden bg-slate-100">
          {thumbnailUrl ? (
            <>
              {/* Blurred atmosphere behind the image */}

              <Image
                fill
                src={thumbnailUrl}
                alt=""
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="
                  absolute inset-0
                  scale-125
                  object-cover
                  opacity-45
                  blur-2xl
                  transition-all
                  duration-700
                  ease-out
                  group-hover:scale-[1.35]
                  group-hover:opacity-60
                "
                aria-hidden="true"
              />

              {/* Main image */}

              <Image
                fill
                src={thumbnailUrl}
                alt={category.name}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  ease-out
                  group-hover:scale-[1.045]
                "
              />

              {/* Soft white fade into content */}

              <div
                className="
                  pointer-events-none
                  absolute inset-x-0 bottom-0
                  h-[82px]
                  bg-gradient-to-t
                  from-white
                  via-white/80
                  to-transparent
                "
                aria-hidden="true"
              />

              {/* Additional wide atmospheric fade */}

              <div
                className="
                  pointer-events-none
                  absolute inset-x-0 bottom-0
                  h-[45px]
                  bg-gradient-to-t
                  from-white
                  via-white/35
                  to-transparent
                "
                aria-hidden="true"
              />

              {/* Very subtle navy tint at the top */}

              <div
                className="
                  pointer-events-none
                  absolute inset-0
                  bg-gradient-to-b
                  from-[#0f2044]/[0.08]
                  via-transparent
                  to-transparent
                "
                aria-hidden="true"
              />

              {/* Hover glow */}

              <div
                className="
                  pointer-events-none
                  absolute -bottom-8 left-1/2
                  h-20 w-52
                  -translate-x-1/2
                  rounded-full
                  bg-[#d4a84b]/0
                  blur-3xl
                  transition-all duration-500
                  group-hover:bg-[#d4a84b]/20
                "
                aria-hidden="true"
              />
            </>
          ) : (
            <div
              className={`
                flex h-full w-full items-center justify-center
                ${containerClassName}
              `}
              aria-hidden="true"
            >
              <Icon
                className={`h-9 w-9 ${iconClassName}`}
              />
            </div>
          )}

          {/* Status */}

          <Badge
            variant={isActive ? "success" : "default"}
            className="
              absolute right-3 top-3 z-20
              rounded-full
              border border-white/40
              bg-white/90
              px-2.5 py-1
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-700
              shadow-[0_4px_14px_rgba(15,32,68,0.10)]
              backdrop-blur-md
            "
          >
            <span
              className={`
                mr-1.5
                h-1.5 w-1.5
                rounded-full
                ${isActive ? "bg-emerald-500" : "bg-slate-400"}
              `}
            />

            {category.status}
          </Badge>
        </div>

        {/* Content */}

        <div className="relative z-10 flex flex-1 flex-col bg-white p-4">
          {/* Category */}

          <h3
            className="
              text-[18px]
              font-bold
              leading-snug
              tracking-[-0.01em]
              text-[#0f2044]
              transition-colors duration-200
              group-hover:text-[#b8922a]
            "
          >
            {category.name}
          </h3>

          {/* Description */}

          <p
            className="
              mt-1.5
              line-clamp-2
              text-[12px]
              leading-relaxed
              text-slate-500
            "
          >
            {category.description?.trim() ||
              "Explore courses in this category."}
          </p>

          {/* Bottom */}

          <div
            className="
              mt-auto
              flex items-center justify-between
              gap-3
              border-t border-slate-100
              pt-3
            "
          >
            {/* Course Count */}

            <div className="flex items-center gap-2">
              <span
                className="
                  flex h-7 min-w-7
                  items-center justify-center
                  rounded-lg
                  bg-[#0f2044]/[0.06]
                  px-1.5
                  text-[12px]
                  font-semibold
                  tabular-nums
                  text-[#0f2044]
                  transition-all duration-200
                  group-hover:bg-[#d4a84b]/15
                  group-hover:text-[#b8922a]
                "
              >
                {courseCount}
              </span>

              <span className="text-[12px] font-medium text-slate-500">
                {courseCount === 1 ? "Course" : "Courses"}
              </span>
            </div>

            {/* Explore */}

            <span
              className="
                inline-flex items-center gap-1
                text-[11px]
                font-semibold
                text-[#0f2044]
                transition-all duration-200
                group-hover:gap-2
                group-hover:text-[#b8922a]
              "
            >
              Explore

              <ArrowRight
                className="
                  h-3.5 w-3.5
                  transition-transform
                  duration-200
                  ease-out
                  group-hover:translate-x-0.5
                "
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </Card>
    </button>
  );
}