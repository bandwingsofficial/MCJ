import { redirect } from "next/navigation";

import { studentManageTabPath } from "@/src/features/students/utils/student-manage.routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentManageEnrollmentsRoute({ params }: Props) {
  const { id } = await params;

  redirect(studentManageTabPath(id, "enrollments"));
}
