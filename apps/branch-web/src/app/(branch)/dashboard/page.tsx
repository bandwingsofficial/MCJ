"use client";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { BranchManagerDashboardPage } from "@/src/features/dashboard/pages/branch-manager-dashboard-page";
import { InterviewerDashboardPage } from "@/src/features/dashboard/pages/interviewer-dashboard-page";
import { FacultyDashboard } from "@/src/features/faculty-dashboard";

export default function DashboardPage() {
  const role = useAuthStore((state) => state.user?.role);

  if (role === "FACULTY") {
    return <FacultyDashboard />;
  }

  if (role === "INTERVIEWER") {
    return <InterviewerDashboardPage />;
  }

  return <BranchManagerDashboardPage />;
}
