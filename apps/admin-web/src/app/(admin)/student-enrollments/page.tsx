export default function StudentEnrollmentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Student Enrollments</h1>

      <p className="mt-2 text-gray-600">
        Manage student admissions, course enrollments, batch allocations,
        enrollment approvals, fee status, and admission records across all
        branches.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Enrollment Management
        </p>

        <p className="mt-2 text-gray-500">
          This module will allow administrators to view all student enrollment
          requests, approve or reject admissions, assign students to courses and
          batches, track payment status, manage enrollment history, and monitor
          admission statistics across the institute.
        </p>
      </div>
    </div>
  );
}