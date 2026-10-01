import { BranchLiveRecordedLessonPage } from "@/src/features/branches/pages/branch-live-recorded-lesson-page";

interface Props {
  params: Promise<{
    branchId: string;
    batchId: string;
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function BranchLiveRecordedLessonRoute({ params }: Props) {
  const { branchId, batchId, moduleId, lessonId } = await params;

  return (
    <BranchLiveRecordedLessonPage
      branchId={branchId}
      batchId={batchId}
      moduleId={moduleId}
      lessonId={lessonId}
    />
  );
}
