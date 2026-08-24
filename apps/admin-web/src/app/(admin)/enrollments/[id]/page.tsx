import { EnrollmentDetailsPage } from "@/src/features/enrollments/pages/EnrollmentDetailsPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;

  return <EnrollmentDetailsPage enrollmentId={id} />;
}
