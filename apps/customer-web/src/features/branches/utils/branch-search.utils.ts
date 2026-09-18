import type { PublicBranch } from "@/src/features/branches/types/branch.types";
import {
  formatBranchAddress,
  formatBranchLocation,
} from "@/src/features/branches/utils/branch.utils";

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

export function filterBranchesBySearch(
  branches: PublicBranch[],
  search: string,
): PublicBranch[] {
  const query = search.trim().toLowerCase();
  if (!query) {
    return branches;
  }

  return branches.filter((branch) => {
    const haystack = [
      branch.branchName,
      branch.branchCode,
      branch.city,
      branch.state,
      branch.country,
      branch.addressLine1,
      branch.addressLine2,
      branch.postalCode,
      formatBranchLocation(branch),
      formatBranchAddress(branch),
    ]
      .map(normalize)
      .join(" ");

    return haystack.includes(query);
  });
}

export function getUniqueBranchCities(branches: PublicBranch[]): string[] {
  const cities = new Set<string>();

  branches.forEach((branch) => {
    const city = branch.city?.trim();
    if (city) {
      cities.add(city);
    }
  });

  return Array.from(cities).sort((left, right) =>
    left.localeCompare(right),
  );
}
