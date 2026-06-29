"use client";

import { useRouter } from "next/navigation";
import { ImageOff, Globe } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AUTH_ROUTES } from "@/src/features/auth/constants/auth.constants";

import type { Course } from "@/src/features/courses/types/course.types";

interface CourseCardProps {
  course: Course;
  onClick?: (course: Course) => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  return (
    <Card className="group max-w-sm overflow-hidden border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col h-full rounded-xl">
      
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted/60 to-muted text-muted-foreground/60">
            <ImageOff className="h-8 w-8 stroke-[1.5]" />
            <span className="text-xs font-medium">No Preview Available</span>
          </div>
        )}

        {/* Featured Badge */}
        {course.isFeatured && (
          <div className="absolute left-3 top-3">
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none px-2.5 py-0.5 text-xs font-semibold shadow-sm">
              Featured
            </Badge>
          </div>
        )}
      </div>

      {/* Content Wrapper */}
      <div className="flex flex-1 flex-col p-4">
        
        {/* Badges / Category Row */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="default" className="text-[11px] px-2 py-0 font-medium bg-secondary text-secondary-foreground uppercase tracking-wider">
            {course.level}
          </Badge>
          {course.mode && (
            <Badge variant="default" className="text-[11px] px-2 py-0 font-medium text-muted-foreground">
              {course.mode}
            </Badge>
          )}
        </div>

        {/* Title & Tagline */}
        <div className="space-y-1 mb-3">
          <h3 className="line-clamp-2 text-base font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors min-h-[3rem]">
            {course.title}
          </h3>
          {course.tagline && (
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {course.tagline}
            </p>
          )}
        </div>

        {/* Info Rows (Language, etc.) */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Globe className="h-3.5 w-3.5" />
          <span>Language:</span>
          <span className="font-medium text-foreground">{course.language}</span>
        </div>

        {/* Price & Action Section pushed to bottom */}
        <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between gap-4">
          
          {/* Price Container */}
          <div>
            {course.isFree ? (
              <span className="text-lg font-bold text-emerald-600">Free</span>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-foreground">
                    ₹{course.discountPrice}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{course.originalPrice}
                  </span>
                </div>
                {course.totalDiscount > 0 && (
                  <span className="text-[10px] font-medium text-emerald-600">
                    Save ₹{course.totalDiscount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs font-medium text-muted-foreground hover:text-foreground h-9 px-3"
              onClick={() => onClick?.(course)}
            >
              Details
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm h-9 px-4 rounded-lg transition-colors"
              onClick={() => router.push(`/courses/${course.slug}/enroll`)}
            >
              Enroll Now
            </Button>
          </div>

        </div>

      </div>
    </Card>
  );
}