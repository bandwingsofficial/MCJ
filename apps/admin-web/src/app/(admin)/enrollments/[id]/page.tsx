import { EnrollmentManagePage } from "@/src/features/enrollments/pages/enrollment-manage-page";
import type { EnrollmentManageTabKey } from "@/src/features/enrollments/utils/enrollment-manage.routes";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

const VALID_TABS = new Set<EnrollmentManageTabKey>([
  "overview",
  "student",
  "course",
  "batch",
  "payments",
  "attendance",
  "progress",
]);

function resolveTab(tab?: string): EnrollmentManageTabKey | undefined {
  if (!tab) {
    return undefined;
  }

  return VALID_TABS.has(tab as EnrollmentManageTabKey)
    ? (tab as EnrollmentManageTabKey)
    : undefined;
}

export default async function EnrollmentManageRoute({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { tab } = await searchParams;

  return <EnrollmentManagePage enrollmentId={id} initialTab={resolveTab(tab)} />;
}
