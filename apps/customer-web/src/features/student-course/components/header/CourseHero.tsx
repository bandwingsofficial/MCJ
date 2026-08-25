"use client";

import Image from "next/image";
import {
  BookOpen,
  Clock3,
  Languages,
  MapPin,
  Star,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import {
  COURSE_DURATION_LABELS,
  COURSE_LEVEL_LABELS,
} from "@/src/features/student-course/constants/course.constants";

import {
  formatCurrency,
  getCoursePricing,
  getDiscountPercent,
} from "@/src/features/courses/utils/course-display.utils";

import type {
  StudentCourse,
} from "@/src/features/student-course/types/course.types";

interface CourseHeroProps {
  course: StudentCourse;
}

export function CourseHero({
  course,
}: CourseHeroProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid lg:grid-cols-[320px_1fr]">
        <div className="relative aspect-video bg-muted lg:aspect-auto lg:min-h-[260px]">
          {course.thumbnailUrl ? (
            <Image
              fill
              priority
              src={course.thumbnailUrl}
              alt={course.title}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center gap-2">
            {course.isFeatured && (
              <Badge variant="warning">
                Featured
              </Badge>
            )}

            {course.isPopular && (
              <Badge variant="success">
                Popular
              </Badge>
            )}

            <Badge variant="default">
              {
                COURSE_LEVEL_LABELS[
                  course.level
                ]
              }
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {course.title}
            </h1>

            {course.tagline && (
              <p className="text-muted-foreground">
                {course.tagline}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />

              <span>
                {course.averageRating.toFixed(
                  1,
                )}{" "}
                (
                {
                  course.totalReviews
                }{" "}
                Reviews)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4" />

              <span>
                {course.duration}{" "}
                {
                  COURSE_DURATION_LABELS[
                    course.durationType
                  ]
                }
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4" />

              <span>
                {course.language}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold">
                Available Branches
              </p>

              <div className="space-y-2">
                {course.branches.map(
                  (branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <MapPin className="h-4 w-4" />

                      <span>
                        {branch.branchName}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold">
                Course Price
              </p>

              {(() => {
                const pricing = getCoursePricing({ pricing: course.pricing });
                const discountPercent = getDiscountPercent({
                  pricing: course.pricing,
                });

                if (pricing.isFree) {
                  return (
                    <Badge variant="success">
                      Free Course
                    </Badge>
                  );
                }

                return (
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(
                        pricing.discountedPrice,
                        pricing.currency,
                      )}
                    </p>

                    {pricing.discountAmount > 0 && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(
                            pricing.originalPrice,
                            pricing.currency,
                          )}
                        </span>

                        <Badge variant="danger">
                          {discountPercent ?? 0}% OFF
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          {course.shortDescription && (
            <>
              <Separator />

              <div className="space-y-2">
                <h2 className="font-semibold">
                  About this Course
                </h2>

                <p className="leading-7 text-muted-foreground">
                  {course.shortDescription}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}