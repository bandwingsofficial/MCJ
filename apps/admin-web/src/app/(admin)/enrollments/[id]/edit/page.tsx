import { EditEnrollmentPage } from "@/src/features/enrollments/pages/EditEnrollmentPage";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <EditEnrollmentPage enrollmentId={id} />;
}
