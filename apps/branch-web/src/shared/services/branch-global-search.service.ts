import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";

export type BranchGlobalSearchEntityType =
  | "student"
  | "trainer"
  | "batch"
  | "job_application"
  | "interview";

export type BranchGlobalSearchResult = {
  id: string;
  type: BranchGlobalSearchEntityType;
  typeLabel: string;
  title: string;
  subtitle: string;
  href: string;
};

export type BranchGlobalSearchGroup = {
  type: BranchGlobalSearchEntityType;
  typeLabel: string;
  items: BranchGlobalSearchResult[];
};

const HREF_BY_TYPE: Record<BranchGlobalSearchEntityType, (id: string) => string> =
  {
    student: (id) => `/students/${id}`,
    trainer: () => "/users",
    batch: (id) => `/batches/${id}`,
    job_application: (id) => `/job-applications/${id}`,
    interview: () => "/interviews",
  };

function mapGroup(
  group: Awaited<ReturnType<typeof branchOpsApi.globalSearch>>[number],
): BranchGlobalSearchGroup {
  return {
    type: group.type,
    typeLabel: group.typeLabel,
    items: group.items.map((item) => ({
      id: item.id,
      type: item.type,
      typeLabel: group.typeLabel,
      title: item.title,
      subtitle: item.subtitle,
      href: HREF_BY_TYPE[item.type](item.id),
    })),
  };
}

/** Branch-scoped search via GET /branch/global-search (current branch data only). */
export async function fetchBranchGlobalSearchResults(
  query: string,
): Promise<BranchGlobalSearchGroup[]> {
  const search = query.trim();
  if (!search) {
    return [];
  }

  const groups = await branchOpsApi.globalSearch(search);
  return groups.map(mapGroup);
}
