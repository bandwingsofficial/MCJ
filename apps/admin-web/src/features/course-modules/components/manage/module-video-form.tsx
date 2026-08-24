"use client";

import { ModuleLessonVideoForm } from "@/src/features/course-modules/components/manage/module-lesson-video-form";
import type { CourseLesson } from "@/src/features/course-lessons/types";

interface Props {
  open: boolean;
  loading?: boolean;
  lesson?: CourseLesson;
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
  }) => Promise<void>;
}

export function ModuleVideoForm(props: Props) {
  return <ModuleLessonVideoForm variant="self-paced" {...props} />;
}
