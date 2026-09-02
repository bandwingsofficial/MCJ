import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";

import type {
  DashboardQueryParams,
  FacultyDashboardData,
} from "../types/facultyDashboard.types";

export async function fetchFacultyDashboard(
  params: DashboardQueryParams,
): Promise<FacultyDashboardData> {
  return branchOpsApi.dashboard({
    from: params.from,
    to: params.to,
    batchId: params.batchId,
    batchCourseId: params.batchCourseId,
    assessmentType: params.assessmentType,
  });
}
