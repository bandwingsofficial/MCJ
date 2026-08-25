import { redirect } from "next/navigation";

import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EnrollmentDetailsRoute({ params }: Props) {
  const { id } = await params;

  redirect(enrollmentManagePath(id));
}
