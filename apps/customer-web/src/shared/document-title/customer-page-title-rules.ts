import {
  resolvePageTitleFromPathname,
  type PageTitleRule,
} from "@mcj/shared-constants";

const CUSTOMER_PAGE_TITLE_RULES: readonly PageTitleRule[] = [
  { pattern: /^\/$/, title: "Home" },
  { pattern: /^\/login$/, title: "Login" },
  { pattern: /^\/register$/, title: "Register" },
  { pattern: /^\/forgot-password$/, title: "Forgot Password" },
  { pattern: /^\/reset-password$/, title: "Reset Password" },
  { pattern: /^\/auth\/handoff$/, title: "Login" },

  { pattern: /^\/courses\/[^/]+\/enroll$/, title: "Enroll in Course" },
  { pattern: /^\/courses\/[^/]+(?:\/.*)?$/, title: "Course Details" },
  { pattern: /^\/courses$/, title: "Courses" },

  { pattern: /^\/jobs\/[^/]+\/apply$/, title: "Apply for Job" },
  { pattern: /^\/jobs\/[^/]+(?:\/.*)?$/, title: "Job Details" },
  { pattern: /^\/jobs$/, title: "Jobs" },

  { pattern: /^\/branches\/[^/]+$/, title: "Branch Details" },
  { pattern: /^\/branches$/, title: "Branches" },

  { pattern: /^\/categories$/, title: "Categories" },
  { pattern: /^\/trainers\/[^/]+$/, title: "Trainer Profile" },
  { pattern: /^\/trainers$/, title: "Trainers" },
  { pattern: /^\/batch\/[^/]+$/, title: "Batch Details" },
  { pattern: /^\/batch$/, title: "Batches" },
  { pattern: /^\/lessons\/[^/]+$/, title: "Lesson Preview" },

  { pattern: /^\/community\/posts\/[^/]+$/, title: "Community Post" },
  { pattern: /^\/finance-news\/[^/]+$/, title: "Finance News" },
  { pattern: /^\/finance-news$/, title: "Finance News" },

  { pattern: /^\/about$/, title: "About" },
  { pattern: /^\/contact$/, title: "Contact" },
  { pattern: /^\/faq$/, title: "FAQ" },
  { pattern: /^\/franchise$/, title: "Franchise" },
  { pattern: /^\/success-stories$/, title: "Success Stories" },

  { pattern: /^\/legal\/terms$/, title: "Terms of Service" },
  { pattern: /^\/legal\/privacy-policy$/, title: "Privacy Policy" },
  { pattern: /^\/legal\/refund-policy$/, title: "Refund Policy" },
  { pattern: /^\/legal\/return-policy$/, title: "Return Policy" },

  { pattern: /^\/onboarding\/job$/, title: "Job Onboarding" },
  {
    pattern: /^\/onboarding\/jobapplication\/[^/]+\/success$/,
    title: "Application Submitted",
  },
  {
    pattern: /^\/onboarding\/jobapplication\/[^/]+$/,
    title: "Job Application",
  },

  { pattern: /^\/student$/, title: "Student Portal" },
  { pattern: /^\/student\/dashboard$/, title: "Dashboard" },
  { pattern: /^\/student\/profile$/, title: "Profile" },
  { pattern: /^\/student\/enrollments\/[^/]+$/, title: "Enrollment Details" },
  { pattern: /^\/student\/enrollments$/, title: "Enrollments" },
  { pattern: /^\/student\/my-learning\/[^/]+$/, title: "My Learning" },
  { pattern: /^\/student\/my-learning$/, title: "My Learning" },
  {
    pattern:
      /^\/student\/learning\/[^/]+\/lessons\/[^/]+(?:\/quiz|\/recording)?$/,
    title: "Lesson",
  },
  {
    pattern: /^\/student\/learning\/[^/]+\/modules\/[^/]+$/,
    title: "Module",
  },
  { pattern: /^\/student\/learning\/[^/]+$/, title: "Course Learning" },
  { pattern: /^\/student\/learning$/, title: "Learning" },
  { pattern: /^\/student\/jobs\/[^/]+(?:\/.*)?$/, title: "Job Details" },
  { pattern: /^\/student\/jobs$/, title: "Jobs" },
  { pattern: /^\/student\/applications\/[^/]+$/, title: "Application Details" },
  { pattern: /^\/student\/applications$/, title: "Applications" },
  { pattern: /^\/student\/rewards$/, title: "Rewards" },
  { pattern: /^\/student\/placement$/, title: "Placement" },
];

export function resolveCustomerPageTitle(pathname: string): string | null {
  return resolvePageTitleFromPathname(pathname, CUSTOMER_PAGE_TITLE_RULES);
}
