import { EnrollmentDetailPage } from "@/src/features/enrollments/pages/enrollment-detail-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StudentEnrollmentDetailPage({ params }: Props) {
  const { id } = await params;

  return <EnrollmentDetailPage enrollmentId={id} />;
}
