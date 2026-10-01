import { Suspense } from "react";

import { LessonLearningPage } from "@/src/features/learning/pages/lesson-learning-page";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId, lessonId } = await params;
  return (
    <Suspense fallback={<Skeleton className="h-[520px] rounded-xl" />}>
      <LessonLearningPage courseId={courseId} lessonId={lessonId} />
    </Suspense>
  );
}
