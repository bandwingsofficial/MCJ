import { notFound } from "next/navigation";

import { CourseLessonsPage } from "@/src/features/course-lessons/pages/CourseLessonsPage";
import { CourseResourcesPage } from "@/src/features/course-resources/pages/CourseResourcesPage";

interface Props {
  params: Promise<{
    id: string;
    segments: string[];
  }>;
}

export default async function CourseModulesCatchAllRoute({ params }: Props) {
  const { id, segments } = await params;

  if (segments.length === 2 && segments[1] === "lessons") {
    const [moduleId] = segments;

    return <CourseLessonsPage courseId={id} moduleId={moduleId} />;
  }

  if (
    segments.length === 4 &&
    segments[1] === "lessons" &&
    segments[3] === "resources"
  ) {
    const [, , lessonId] = segments;

    return <CourseResourcesPage lessonId={lessonId} />;
  }

  notFound();
}
