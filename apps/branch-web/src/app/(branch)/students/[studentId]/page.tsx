interface StudentDetailsPageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default async function StudentDetailsPage({
  params,
}: StudentDetailsPageProps) {
  const { studentId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Student Details</h1>

      <p className="mt-2 text-gray-600">
        View complete student information, enrollments, attendance, fees,
        assessments, certificates, and academic performance.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8">
        <p className="text-lg font-medium text-gray-700">
          Student ID
        </p>

        <p className="mt-2 font-mono text-blue-600">
          {studentId}
        </p>

        <p className="mt-4 text-gray-500">
          Student Details module is under development.
        </p>
      </div>
    </div>
  );
}