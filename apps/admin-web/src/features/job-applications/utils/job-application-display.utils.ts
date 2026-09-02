import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";

export interface ParsedApplicationRemarks {
  course: string | null;
  company: string | null;
  skills: string | null;
  noticePeriod: string | null;
  other: string | null;
}

export function parseApplicationRemarks(
  remarks: string | null | undefined,
): ParsedApplicationRemarks {
  const result: ParsedApplicationRemarks = {
    course: null,
    company: null,
    skills: null,
    noticePeriod: null,
    other: null,
  };

  if (!remarks?.trim()) {
    return result;
  }

  const otherLines: string[] = [];

  for (const line of remarks.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("Course / Degree:")) {
      result.course = trimmed.replace("Course / Degree:", "").trim() || null;
      continue;
    }

    if (trimmed.startsWith("Current/Previous Company:")) {
      result.company =
        trimmed.replace("Current/Previous Company:", "").trim() || null;
      continue;
    }

    if (trimmed.startsWith("Skills:")) {
      result.skills = trimmed.replace("Skills:", "").trim() || null;
      continue;
    }

    if (trimmed.startsWith("Notice Period:")) {
      result.noticePeriod =
        trimmed.replace("Notice Period:", "").trim() || null;
      continue;
    }

    if (
      trimmed.startsWith("Portfolio:") ||
      trimmed.startsWith("LinkedIn:")
    ) {
      continue;
    }

    otherLines.push(trimmed);
  }

  result.other = otherLines.length ? otherLines.join("\n") : null;
  return result;
}

export function getApplicationCourse(application: JobApplication): string {
  const parsed = parseApplicationRemarks(application.remarks);
  return parsed.course || "—";
}

export function getApplicationCompany(application: JobApplication): string {
  const parsed = parseApplicationRemarks(application.remarks);
  return parsed.company || "—";
}

export function getApplicationSkills(application: JobApplication): string {
  const parsed = parseApplicationRemarks(application.remarks);
  return parsed.skills || "—";
}

export function getApplicationNoticePeriod(
  application: JobApplication,
): string {
  const parsed = parseApplicationRemarks(application.remarks);
  return parsed.noticePeriod || "—";
}

export function getEmptyApplicationsMessage(
  status: "PENDING" | "ACCEPTED" | "REJECTED",
): { title: string; description: string } {
  switch (status) {
    case "ACCEPTED":
      return {
        title: "No approved applications",
        description: "Approved applications will appear here.",
      };
    case "REJECTED":
      return {
        title: "No rejected applications",
        description: "Rejected applications will appear here.",
      };
    default:
      return {
        title: "No pending applications",
        description:
          "Applications submitted from public job links will appear here.",
      };
  }
}
