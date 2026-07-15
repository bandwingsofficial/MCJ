"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, CalendarDays, UserRound } from "lucide-react";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface StudentCourseCardProps {
  enrollment: Enrollment;
}

export function StudentCourseCard({ enrollment }: StudentCourseCardProps) {
  const { course, batch, joiningDate } = enrollment;
  const trainer = batch.trainers[0];

  return (
    <Card className="group flex flex-col shadow-none border-border/50 hover:border-primary/50 transition-colors">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
        {course.thumbnailUrl ? (
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <h3 className="line-clamp-1 font-semibold text-base">{course.title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{batch.name}</p>
        </div>

        <div className="flex flex-col gap-2.5 text-xs text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5" />
            {trainer ? `${trainer.firstName} ${trainer.lastName}` : "No trainer assigned"}
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" />
            Starts: {new Date(joiningDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5" />
            {course.duration} {course.durationType}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t">
          <Button className="w-full gap-2">
            <Link href={`/student/my-learning/${course.id}`}>
              Continue Learning <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}