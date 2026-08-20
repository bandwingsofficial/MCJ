import { StudentManagePage } from "@/src/features/students/pages/student-manage-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentManageRoute({ params }: Props) {
  const { id } = await params;

  return <StudentManagePage studentId={id} />;
}
