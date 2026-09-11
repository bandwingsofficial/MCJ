import { StudentManagePage } from "@/src/features/students/pages/student-manage-page";
import type { TabKey } from "@/src/features/students/components/manage/student-manage-workspace";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const VALID_TABS = new Set<TabKey>([
  "overview",
  "documents",
  "job-applications",
  "activity",
]);

const REMOVED_TABS = new Set([
  "enrollments",
  "attendance",
  "assessments",
  "payments",
  "reports",
  "placement",
]);

const LEGACY_TAB_ALIASES: Record<string, TabKey> = {
  placement: "job-applications",
};

function resolveTab(tab?: string): TabKey | undefined {
  if (!tab) {
    return undefined;
  }

  if (REMOVED_TABS.has(tab)) {
    return LEGACY_TAB_ALIASES[tab];
  }

  return VALID_TABS.has(tab as TabKey) ? (tab as TabKey) : undefined;
}

export default async function StudentManageRoute({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { tab } = await searchParams;

  return <StudentManagePage studentId={id} initialTab={resolveTab(tab)} />;
}
