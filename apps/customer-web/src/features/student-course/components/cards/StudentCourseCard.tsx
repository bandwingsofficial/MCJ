"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  GraduationCap,
  Monitor,
  UserRound,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type {
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

interface StudentCourseCardProps {
  enrollment: Enrollment;
}

export function StudentCourseCard({
  enrollment,
}: StudentCourseCardProps) {
  const {
    course,
    batch,
    joiningDate,
  } = enrollment;

  const trainer =
    batch.trainers[0];

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-video bg-muted">
        {course.thumbnailUrl ? (
          <Image
            fill
            src={course.thumbnailUrl}
            alt={course.title}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-14 w-14 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="line-clamp-2 text-lg font-semibold">
              {course.title}
            </h3>

            <Badge variant="success">
              {enrollment.status}
            </Badge>
          </div>

          <Badge variant="info">
            {batch.mode}
          </Badge>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />

            <span>
              {batch.name}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <UserRound className="h-4 w-4" />

            <span>
              {trainer
                ? `${trainer.firstName} ${trainer.lastName}`
                : "Trainer Not Assigned"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />

            <span>
              Starts{" "}
              {new Date(
                joiningDate,
              ).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock3 className="h-4 w-4" />

            <span>
              {course.duration}{" "}
              {course.durationType}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Monitor className="h-4 w-4" />

            <span>
              {course.language}
            </span>
          </div>
        </div>

        <Button
         >
          <Link
            href={`/student/my-learning/${course.id}`}
          >
            Continue Learning

            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}