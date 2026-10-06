import {
  resolvePageTitleFromPathname,
  type PageTitleRule,
} from "@mcj/shared-constants";

const STUDENT_PAGE_TITLE_RULES: readonly PageTitleRule[] = [
  { pattern: /^\/$/, title: "Student Portal" },
  { pattern: /^\/auth\/handoff$/, title: "Login" },

  { pattern: /^\/student\/learning$/, title: "Learning" },
  {
    pattern:
      /^\/student\/learning\/[^/]+\/lessons\/[^/]+\/quiz$/,
    title: "Lesson Quiz",
  },
  {
    pattern:
      /^\/student\/learning\/[^/]+\/lessons\/[^/]+\/recording$/,
    title: "Lesson Recording",
  },
  {
    pattern: /^\/student\/learning\/[^/]+\/lessons\/[^/]+$/,
    title: "Lesson",
  },
  {
    pattern: /^\/student\/learning\/[^/]+\/modules\/[^/]+$/,
    title: "Module",
  },
  { pattern: /^\/student\/learning\/[^/]+$/, title: "Course Learning" },
];

export function resolveStudentPageTitle(pathname: string): string | null {
  return resolvePageTitleFromPathname(pathname, STUDENT_PAGE_TITLE_RULES);
}
