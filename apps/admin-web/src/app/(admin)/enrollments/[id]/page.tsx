import {
  EnrollmentDetailsPage,
} from "@/src/features/enrollments/pages";

interface EnrollmentDetailsRouteProps {
  params: {
    id: string;
  };
}

export default function EnrollmentDetailsRoute({
  params,
}: EnrollmentDetailsRouteProps) {
  return (
    <EnrollmentDetailsPage
      enrollmentId={
        params.id
      }
    />
  );
}