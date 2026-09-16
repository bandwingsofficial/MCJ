import { LearningShell } from "@/src/features/learning/components/layout/learning-shell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearningShell>{children}</LearningShell>;
}
