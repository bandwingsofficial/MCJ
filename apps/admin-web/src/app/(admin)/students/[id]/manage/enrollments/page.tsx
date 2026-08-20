import { StudentManagePage } from "@/src/features/students/pages/student-manage-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentManageEnrollmentsRoute({ params }: Props) {
  const { id } = await params;

  return <StudentManagePage studentId={id} initialTab="enrollments" />;
}
