export default function UsersPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">User Management</h1>

      <p className="mt-2 text-gray-600">
        Manage all system users including administrators, branch managers,
        faculty members, counselors, accountants, receptionists, students,
        and other staff across the institute.
      </p>

      <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">
          User Management
        </p>

        <p className="mt-2 text-gray-500">
          This module will allow administrators to create, edit, activate,
          deactivate, assign roles and permissions, reset passwords, manage
          user access, and monitor user activity across all branches of the
          institute.
        </p>
      </div>
    </div>
  );
}