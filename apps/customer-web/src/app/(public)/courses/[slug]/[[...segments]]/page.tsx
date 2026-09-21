import { CourseSlugRoutePage } from "@/src/features/courses/pages/course-slug-route-page";

interface Props {
  params: Promise<{
    slug: string;
    segments?: string[];
  }>;
}

export default function Page(props: Props) {
  return <CourseSlugRoutePage {...props} />;
}
