"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { StudentProfileView } from "@/src/features/student/components";

export function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Profile"
        description="Manage your personal and educational information."
      />

      <StudentProfileView />
    </div>
  );
}