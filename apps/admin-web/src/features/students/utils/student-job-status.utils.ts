import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type {
  Student,
  StudentJobStatus,
} from "@/src/features/students/types/student.types";

/** Same rule as manage → Job Applications tab (`getJobApplications({ studentId })`). */
export function resolveStudentJobStatusFromApplicationCount(
  count: number,
): StudentJobStatus | null {
  return count > 0 ? "JOB_APPLIED" : null;
}

export async function enrichStudentsWithJobStatusFromApplications(
  students: Student[],
): Promise<Student[]> {
  if (students.length === 0) {
    return students;
  }

  return Promise.all(
    students.map(async (student) => {
      try {
        const { items } = await jobApplicationService.getJobApplications({
          studentId: student.id,
        });
        return {
          ...student,
          jobStatus: resolveStudentJobStatusFromApplicationCount(items.length),
        };
      } catch {
        return {
          ...student,
          jobStatus: null,
        };
      }
    }),
  );
}
