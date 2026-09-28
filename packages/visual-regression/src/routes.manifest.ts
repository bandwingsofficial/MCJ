import type { AppId } from "./config.js";

/**
 * Curated routes for visual audit.
 * - Static list pages from Next.js app structure
 * - Stable audit slugs from `.route-audit/run-stability-audit.ps1` (verified HTTP 200 in dev)
 * Dynamic `[id]` routes are omitted unless stable seed slugs exist in route-audit.
 */
export interface VisualRoute {
  app: AppId;
  path: string;
  /** Public routes may be captured without auth storage state. */
  public?: boolean;
  note?: string;
}

export const visualRoutes: VisualRoute[] = [
  // ── ADMIN (static shells + route-audit deep paths) ──
  { app: "admin-web", path: "/login", public: true },
  { app: "admin-web", path: "/verify-totp", public: true },
  { app: "admin-web", path: "/dashboard" },
  { app: "admin-web", path: "/analytics" },
  { app: "admin-web", path: "/branches" },
  { app: "admin-web", path: "/branch-users" },
  { app: "admin-web", path: "/trainers" },
  { app: "admin-web", path: "/categories" },
  { app: "admin-web", path: "/courses" },
  { app: "admin-web", path: "/courses/create" },
  { app: "admin-web", path: "/batches" },
  { app: "admin-web", path: "/batches/create" },
  { app: "admin-web", path: "/batch-timings" },
  { app: "admin-web", path: "/batch-templates" },
  { app: "admin-web", path: "/assign-batches" },
  { app: "admin-web", path: "/students" },
  { app: "admin-web", path: "/students/create" },
  { app: "admin-web", path: "/student-enrollments" },
  { app: "admin-web", path: "/enrollments" },
  { app: "admin-web", path: "/enrollments/create" },
  { app: "admin-web", path: "/users" },
  { app: "admin-web", path: "/referral-rewards" },
  { app: "admin-web", path: "/settings" },
  { app: "admin-web", path: "/jobs" },
  { app: "admin-web", path: "/jobs/create" },
  { app: "admin-web", path: "/jobs/applications" },
  { app: "admin-web", path: "/job-applications" },
  { app: "admin-web", path: "/placements" },
  { app: "admin-web", path: "/community" },
  { app: "admin-web", path: "/finance-news" },
  { app: "admin-web", path: "/finance-news/create" },
  { app: "admin-web", path: "/onboarding/job", public: true },
  // route-audit stable slugs (local seed / audit fixtures)
  { app: "admin-web", path: "/courses/audit-course/manage", note: "route-audit" },
  {
    app: "admin-web",
    path: "/courses/audit-course/manage/modules/audit-module",
    note: "route-audit",
  },
  {
    app: "admin-web",
    path: "/courses/audit-course/manage/modules/audit-module/lessons/audit-lesson/manage",
    note: "route-audit",
  },
  {
    app: "admin-web",
    path: "/courses/audit-course/modules/audit-module/lessons",
    note: "route-audit",
  },
  { app: "admin-web", path: "/branches/audit-branch/manage", note: "route-audit" },
  { app: "admin-web", path: "/batches/audit-batch/manage", note: "route-audit" },
  {
    app: "admin-web",
    path: "/batches/audit-batch/timings/audit-timing/manage",
    note: "route-audit",
  },
  {
    app: "admin-web",
    path: "/batches/audit-batch/modes/offline/manage",
    note: "route-audit",
  },
  { app: "admin-web", path: "/students/audit-student/manage", note: "route-audit" },
  {
    app: "admin-web",
    path: "/enrollments/audit-enrollment/manage",
    note: "route-audit",
  },
  { app: "admin-web", path: "/community/audit-post/manage", note: "route-audit" },

  // ── BRANCH (static list / management pages) ──
  { app: "branch-web", path: "/login", public: true },
  { app: "branch-web", path: "/dashboard" },
  { app: "branch-web", path: "/analytics" },
  { app: "branch-web", path: "/students" },
  { app: "branch-web", path: "/courses" },
  { app: "branch-web", path: "/batches" },
  { app: "branch-web", path: "/batches/create" },
  { app: "branch-web", path: "/enrollments" },
  { app: "branch-web", path: "/job-applications" },
  { app: "branch-web", path: "/interviews" },
  { app: "branch-web", path: "/interview-rounds" },
  { app: "branch-web", path: "/attendance" },
  { app: "branch-web", path: "/attendance/take" },
  { app: "branch-web", path: "/assessments" },
  { app: "branch-web", path: "/online-management" },
  { app: "branch-web", path: "/offline-management" },
  { app: "branch-web", path: "/recorded-management" },
  { app: "branch-web", path: "/resources" },
  { app: "branch-web", path: "/resources/upload" },
  { app: "branch-web", path: "/community" },
  { app: "branch-web", path: "/finance-news" },
  { app: "branch-web", path: "/users" },
  { app: "branch-web", path: "/settings" },

  // ── CUSTOMER (public + student portal + route-audit) ──
  { app: "customer-web", path: "/", public: true },
  { app: "customer-web", path: "/login", public: true },
  { app: "customer-web", path: "/register", public: true },
  { app: "customer-web", path: "/forgot-password", public: true },
  { app: "customer-web", path: "/courses", public: true },
  { app: "customer-web", path: "/courses/junior-accountant", public: true, note: "route-audit" },
  {
    app: "customer-web",
    path: "/courses/junior-accountant/enroll",
    public: true,
    note: "route-audit",
  },
  { app: "customer-web", path: "/jobs", public: true },
  { app: "customer-web", path: "/jobs/junior-accountant", public: true, note: "route-audit" },
  {
    app: "customer-web",
    path: "/jobs/junior-accountant/apply",
    public: true,
    note: "route-audit",
  },
  { app: "customer-web", path: "/branches", public: true },
  { app: "customer-web", path: "/branches/malleshwaram", public: true, note: "route-audit" },
  { app: "customer-web", path: "/categories", public: true },
  { app: "customer-web", path: "/about", public: true },
  { app: "customer-web", path: "/contact", public: true },
  { app: "customer-web", path: "/faq", public: true },
  { app: "customer-web", path: "/finance-news", public: true },
  { app: "customer-web", path: "/franchise", public: true },
  { app: "customer-web", path: "/success-stories", public: true },
  { app: "customer-web", path: "/trainers", public: true },
  { app: "customer-web", path: "/legal/terms", public: true },
  { app: "customer-web", path: "/legal/privacy-policy", public: true },
  { app: "customer-web", path: "/onboarding/job", public: true },
  { app: "customer-web", path: "/student/dashboard" },
  { app: "customer-web", path: "/student/profile" },
  { app: "customer-web", path: "/student/enrollments" },
  { app: "customer-web", path: "/student/jobs" },
  { app: "customer-web", path: "/student/jobs/audit-job", note: "route-audit" },
  { app: "customer-web", path: "/student/my-learning" },
  { app: "customer-web", path: "/student/learning" },
  { app: "customer-web", path: "/student/rewards" },
  { app: "customer-web", path: "/student/applications" },
  { app: "customer-web", path: "/student/placement" },

  // ── STUDENT (standalone LMS shell) ──
  { app: "student-web", path: "/", public: true },
  { app: "student-web", path: "/auth/handoff", public: true },
  { app: "student-web", path: "/student/learning", public: true },
];

export function routeKey(app: AppId, routePath: string, viewportId: string): string {
  const safePath = routePath.replace(/^\//, "").replace(/\//g, "__") || "root";
  return `${app}__${safePath}__${viewportId}`;
}
