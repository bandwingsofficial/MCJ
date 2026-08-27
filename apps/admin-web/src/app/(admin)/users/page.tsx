export default function UsersPage() {
  return (
    <div>
      <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
        User Management
      </h1>

      <p className="mt-2 text-[#647A9B]">
        Manage all system users including administrators, branch managers,
        faculty members, counselors, accountants, receptionists, students,
        and other staff across the institute.
      </p>

      <div className="mt-6 rounded-2xl border border-dashed border-[#DCE8F5] bg-white p-8 text-center">
        <p className="text-lg font-medium text-[#102A56]">
          User Management
        </p>

        <p className="mt-2 text-[#647A9B]">
          This module will allow administrators to create, edit, activate,
          deactivate, assign roles and permissions, reset passwords, manage
          user access, and monitor user activity across all branches of the
          institute.
        </p>
      </div>
    </div>
  );
}
