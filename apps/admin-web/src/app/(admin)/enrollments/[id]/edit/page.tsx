import {
  EditEnrollmentPage,
} from "@/src/features/enrollments/pages";

interface EditEnrollmentRouteProps {
  params: {
    id: string;
  };
}

export default function EditEnrollmentRoute({
  params,
}: EditEnrollmentRouteProps) {
  return (
    <EditEnrollmentPage
      enrollmentId={
        params.id
      }
    />
  );
}