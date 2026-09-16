import { ModuleLearningPage } from "@/src/features/learning/pages/module-learning-page";

interface Props {
  params: Promise<{ courseId: string; moduleId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId, moduleId } = await params;
  return <ModuleLearningPage courseId={courseId} moduleId={moduleId} />;
}
