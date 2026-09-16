import type { PublicBranch } from "@/src/features/branches/types/branch.types";

export function formatBranchLocation(
  branch: Pick<PublicBranch, "city" | "state" | "country">,
): string {
  return [branch.city, branch.state, branch.country].filter(Boolean).join(", ");
}

export function formatBranchAddress(branch: PublicBranch): string {
  return [
    branch.addressLine1,
    branch.addressLine2,
    formatBranchLocation(branch),
    branch.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function getBranchDetailPath(
  branch: Pick<PublicBranch, "slug">,
): string {
  return `/branches/${branch.slug}`;
}

export function getGoogleMapsSearchUrl(branch: PublicBranch): string {
  if (branch.latitude != null && branch.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${branch.latitude},${branch.longitude}`;
  }

  const query = encodeURIComponent(formatBranchAddress(branch));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getGoogleMapsDirectionsUrl(branch: PublicBranch): string {
  if (branch.latitude != null && branch.longitude != null) {
    return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
  }

  const destination = encodeURIComponent(formatBranchAddress(branch));
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function getBranchMapEmbedUrl(branch: PublicBranch): string | null {
  if (branch.latitude == null || branch.longitude == null) {
    return null;
  }

  return `https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=15&output=embed`;
}
