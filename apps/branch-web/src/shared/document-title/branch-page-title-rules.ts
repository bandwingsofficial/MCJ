import {
  resolvePageTitleFromPathname,
  type PageTitleRule,
} from "@mcj/shared-constants";

const BRANCH_PAGE_TITLE_RULES: readonly PageTitleRule[] = [
  { pattern: /^\/login$/, title: "Login" },
  { pattern: /^\/forbidden$/, title: "Access Denied" },

  { pattern: /^\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/analytics$/, title: "Analytics" },
  { pattern: /^\/settings$/, title: "Settings" },

  { pattern: /^\/students\/[^/]+$/, title: "Student Details" },
  { pattern: /^\/students$/, title: "Students" },

  { pattern: /^\/courses$/, title: "Courses" },

  { pattern: /^\/batches\/create$/, title: "Create Batch" },
  {
    pattern: /^\/batches\/[^/]+\/timings\/[^/]+\/manage$/,
    title: "Batch Timings",
  },
  {
    pattern: /^\/batches\/[^/]+\/timings\/[^/]+$/,
    title: "Batch Timings",
  },
  {
    pattern: /^\/batches\/[^/]+\/calendar\/[^/]+$/,
    title: "Batch Calendar",
  },
  { pattern: /^\/batches\/[^/]+$/, title: "Batch Details" },
  { pattern: /^\/batches$/, title: "Batches" },

  { pattern: /^\/enrollments$/, title: "Enrollments" },

  { pattern: /^\/job-applications\/[^/]+$/, title: "Job Application Details" },
  { pattern: /^\/job-applications$/, title: "Job Applications" },

  { pattern: /^\/interviews$/, title: "Interviews" },
  { pattern: /^\/interview-rounds$/, title: "Interview Rounds" },

  { pattern: /^\/attendance\/take$/, title: "Take Attendance" },
  {
    pattern: /^\/attendance\/manage\/[^/]+\/[^/]+$/,
    title: "Manage Attendance",
  },
  {
    pattern: /^\/attendance\/details\/[^/]+\/[^/]+$/,
    title: "Attendance Details",
  },
  { pattern: /^\/attendance$/, title: "Attendance" },

  {
    pattern: /^\/assessments\/progress\/[^/]+\/[^/]+\/[^/]+$/,
    title: "Assessment Progress",
  },
  { pattern: /^\/assessments$/, title: "Assessments" },

  { pattern: /^\/online-management$/, title: "Online Management" },
  { pattern: /^\/offline-management$/, title: "Offline Management" },
  { pattern: /^\/recorded-management$/, title: "Recorded Management" },

  { pattern: /^\/resources\/upload$/, title: "Upload Resource" },
  { pattern: /^\/resources$/, title: "Resources" },

  { pattern: /^\/community$/, title: "Community" },
  { pattern: /^\/finance-news$/, title: "Finance News" },

  { pattern: /^\/users$/, title: "User Management" },
];

export function resolveBranchPageTitle(pathname: string): string | null {
  return resolvePageTitleFromPathname(pathname, BRANCH_PAGE_TITLE_RULES);
}
