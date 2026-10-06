import {
  resolvePageTitleFromPathname,
  type PageTitleRule,
} from "@mcj/shared-constants";

const ADMIN_PAGE_TITLE_RULES: readonly PageTitleRule[] = [
  { pattern: /^\/login$/, title: "Login" },
  { pattern: /^\/verify-totp$/, title: "Login" },
  { pattern: /^\/onboarding\/job$/, title: "Job Onboarding" },
  { pattern: /^\/jobs\/[^/]+\/apply$/, title: "Apply for Job" },

  { pattern: /^\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/analytics$/, title: "Analytics" },
  { pattern: /^\/settings$/, title: "Settings" },

  { pattern: /^\/students\/create$/, title: "Create Student" },
  { pattern: /^\/students\/[^/]+\/edit$/, title: "Edit Student" },
  {
    pattern: /^\/students\/[^/]+(?:\/manage)?$/,
    title: "Student Details",
  },
  { pattern: /^\/students$/, title: "Students" },

  { pattern: /^\/student-enrollments$/, title: "Student Enrollments" },
  { pattern: /^\/enrollments\/create$/, title: "Create Enrollment" },
  { pattern: /^\/enrollments\/[^/]+\/edit$/, title: "Edit Enrollment" },
  {
    pattern: /^\/enrollments\/[^/]+(?:\/manage)?$/,
    title: "Enrollment Details",
  },
  { pattern: /^\/enrollments$/, title: "Enrollments" },

  { pattern: /^\/courses\/create$/, title: "Create Course" },
  { pattern: /^\/courses\/[^/]+\/edit$/, title: "Edit Course" },
  { pattern: /^\/courses\/[^/]+\/preview$/, title: "Course Preview" },
  {
    pattern:
      /^\/courses\/[^/]+\/manage\/modules\/[^/]+\/lessons\/[^/]+\/manage$/,
    title: "Lesson Management",
  },
  {
    pattern:
      /^\/courses\/[^/]+\/manage\/modules\/[^/]+\/lessons\/[^/]+\/quiz$/,
    title: "Lesson Management",
  },
  {
    pattern: /^\/courses\/[^/]+\/manage\/modules\/[^/]+\/test\/[^/]+$/,
    title: "Module Management",
  },
  {
    pattern: /^\/courses\/[^/]+\/manage\/modules\/[^/]+$/,
    title: "Module Management",
  },
  { pattern: /^\/courses\/[^/]+\/manage$/, title: "Course Management" },
  {
    pattern: /^\/courses\/[^/]+\/modules\/[^/]+\/lessons$/,
    title: "Lessons",
  },
  { pattern: /^\/courses\/[^/]+\/modules(?:\/[^/]+)?$/, title: "Modules" },
  { pattern: /^\/courses\/[^/]+$/, title: "Course Details" },
  { pattern: /^\/courses$/, title: "Courses" },

  { pattern: /^\/trainers$/, title: "Trainers" },
  { pattern: /^\/categories$/, title: "Categories" },

  { pattern: /^\/batches\/create$/, title: "Create Batch" },
  { pattern: /^\/batches\/[^/]+\/edit$/, title: "Edit Batch" },
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
  {
    pattern: /^\/batches\/[^/]+\/modes\/[^/]+\/manage$/,
    title: "Batch Management",
  },
  { pattern: /^\/batches\/[^/]+\/manage$/, title: "Batch Management" },
  { pattern: /^\/batches\/[^/]+$/, title: "Batch Details" },
  { pattern: /^\/batches$/, title: "Batches" },

  { pattern: /^\/batch-timings$/, title: "Batch Timings" },
  { pattern: /^\/batch-templates$/, title: "Batch Templates" },
  { pattern: /^\/assign-batches$/, title: "Assign Batches" },

  { pattern: /^\/branches\/[^/]+\/live-recorded\/[^/]+\/modules\/[^/]+\/lessons\/[^/]+$/, title: "Lesson Management" },
  {
    pattern: /^\/branches\/[^/]+\/live-recorded\/[^/]+$/,
    title: "Live Recorded Batch",
  },
  { pattern: /^\/branches\/[^/]+\/manage$/, title: "Branch Management" },
  { pattern: /^\/branches\/[^/]+$/, title: "Branch Details" },
  { pattern: /^\/branches$/, title: "Branches" },
  { pattern: /^\/branch-users$/, title: "User Management" },

  { pattern: /^\/users\/[^/]+$/, title: "User Details" },
  { pattern: /^\/users$/, title: "User Management" },

  { pattern: /^\/jobs\/create$/, title: "Create Job" },
  { pattern: /^\/jobs\/[^/]+\/edit$/, title: "Edit Job" },
  { pattern: /^\/jobs\/applications$/, title: "Job Applications" },
  { pattern: /^\/jobs$/, title: "Jobs" },
  { pattern: /^\/job-applications$/, title: "Job Applications" },
  { pattern: /^\/placements$/, title: "Placements" },

  { pattern: /^\/community\/[^/]+\/manage$/, title: "Community" },
  { pattern: /^\/community\/[^/]+$/, title: "Community" },
  { pattern: /^\/community$/, title: "Community" },

  { pattern: /^\/finance-news\/create$/, title: "Create Finance News" },
  { pattern: /^\/finance-news\/[^/]+\/edit$/, title: "Edit Finance News" },
  { pattern: /^\/finance-news$/, title: "Finance News" },

  { pattern: /^\/referral-rewards$/, title: "Referral Rewards" },
];

export function resolveAdminPageTitle(pathname: string): string | null {
  return resolvePageTitleFromPathname(pathname, ADMIN_PAGE_TITLE_RULES);
}
