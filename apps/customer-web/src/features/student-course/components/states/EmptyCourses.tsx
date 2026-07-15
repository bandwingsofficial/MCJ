"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

export function EmptyCourses() {
  return (
    <Card className="flex flex-col items-center justify-center gap-6 py-16 text-center">
      <GraduationCap className="h-16 w-16 text-muted-foreground" />

      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          No Enrolled Courses
        </h2>

        <p className="max-w-md text-muted-foreground">
          You haven't enrolled in any courses yet.
          Browse available courses and begin learning.
        </p>
      </div>

      <Button>
        <Link href="/courses">
          Browse Courses
        </Link>
      </Button>
    </Card>
  );
}