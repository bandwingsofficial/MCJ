import { studentApi } from "@/src/features/students/api/student.api";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import { getStudentCode } from "@/src/features/job-applications/types/job-application.types";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resolveApplicationEmail(application: JobApplication): string | null {
  const email =
    application.applicantEmail?.trim() ||
    application.user?.email?.trim() ||
    application.student?.email?.trim() ||
    null;

  return email ? email : null;
}

async function lookupStudentCodeByEmail(
  email: string,
  cache: Map<string, string | null>,
): Promise<string | null> {
  const normalized = normalizeEmail(email);

  if (cache.has(normalized)) {
    return cache.get(normalized) ?? null;
  }

  const response = await studentApi.getStudents({
    search: normalized,
    page: 1,
    pageSize: 10,
  });

  const { items } = parseStudentListResponse(response.data);
  const match = items.find(
    (student) =>
      student.email && normalizeEmail(student.email) === normalized,
  );

  const studentCode = match?.studentCode ?? null;
  cache.set(normalized, studentCode);

  return studentCode;
}

export async function enrichJobApplicationStudentCodes(
  applications: JobApplication[],
): Promise<JobApplication[]> {
  const emailCache = new Map<string, string | null>();
  const enriched = [...applications];

  await Promise.all(
    enriched.map(async (application, index) => {
      if (getStudentCode(application) !== "—") {
        return;
      }

      const email = resolveApplicationEmail(application);

      if (!email) {
        return;
      }

      const studentCode = await lookupStudentCodeByEmail(email, emailCache);

      if (!studentCode) {
        return;
      }

      enriched[index] = {
        ...application,
        resolvedStudentCode: studentCode,
        student: application.student
          ? { ...application.student, studentCode }
          : {
              id: "",
              studentCode,
              firstName: application.applicantName?.split(" ")[0] ?? "",
              lastName: null,
              email: application.applicantEmail,
              phone: application.applicantPhone,
              gender: null,
              dateOfBirth: null,
              addressLine1: null,
              addressLine2: null,
              city: null,
              state: null,
              country: null,
              postalCode: null,
              qualification: null,
              collegeName: null,
              specialization: null,
              passingYear: null,
              parentName: null,
              parentPhone: null,
              emergencyContactName: null,
              emergencyContactPhone: null,
              notes: null,
              status: "LEAD",
              jobStatus: null,
            },
      };
    }),
  );

  return enriched;
}
