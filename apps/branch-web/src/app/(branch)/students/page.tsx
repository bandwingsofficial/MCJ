export default function StudentsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Students</h1>

      <p className="mt-2 text-gray-600">
        Manage student records, admissions, profiles, course enrollments,
        attendance, academic progress, certificates, and account information.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          Student Management
        </p>

        <p className="mt-2 text-gray-500">
          This module will allow branch administrators to add, edit, search,
          filter, and manage students along with their academic journey.
        </p>
      </div>
    </div>
  );
}