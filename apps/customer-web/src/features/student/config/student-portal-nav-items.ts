import { BriefcaseBusiness, Gift, User, type LucideIcon } from "lucide-react";

import type { StudentPortalNavigationState } from "@/src/features/student/types/student-portal-navigation.types";

export interface StudentPortalNavItemDefinition {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  visible: (state: StudentPortalNavigationState) => boolean;
}

/** Single source of truth for student portal nav visibility (sidebar + header). */
export const STUDENT_PORTAL_NAV_ITEMS: StudentPortalNavItemDefinition[] = [
  {
    id: "profile",
    href: "/student/profile",
    label: "Profile",
    icon: User,
    visible: (state) => state.showProfile,
  },
  {
    id: "applications",
    href: "/student/applications",
    label: "My Applications",
    icon: BriefcaseBusiness,
    visible: (state) => state.showMyApplications,
  },
  {
    id: "my-course",
    href: "/student/my-learning",
    label: "My Course",
    icon: BriefcaseBusiness,
    visible: (state) => state.showMyCourses,
  },
  {
    id: "enrollment",
    href: "/student/enrollments",
    label: "My Enrollment",
    icon: BriefcaseBusiness,
    visible: (state) => state.showMyEnrollment,
  },
  {
    id: "rewards",
    href: "/student/rewards",
    label: "Referral & Rewards",
    icon: Gift,
    visible: () => true,
  },
];

export function getVisibleStudentPortalNavItems(
  state: StudentPortalNavigationState,
): StudentPortalNavItemDefinition[] {
  return STUDENT_PORTAL_NAV_ITEMS.filter((item) => item.visible(state));
}
