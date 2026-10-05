"use client";

import type { ReactNode } from "react";

import type { Branch } from "@/src/features/branches/types/branch.types";
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";
import { BranchManageSection } from "@/src/features/branches/components/manage/branch-manage-section";
import { formatBranchAddress } from "@/src/features/branches/utils/branch-display.utils";

interface Props {
  branch: Branch;
}

function OverviewField({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2 ${className ?? ""}`}
    >
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</dd>
    </div>
  );
}

function formatCoordinate(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return String(value);
}

export function BranchManageOverviewPanel({ branch }: Props) {
  const address = formatBranchAddress(branch);

  return (
    <div className="space-y-3">
      <BranchManageSection
        title="Branch Overview"
        description="Profile and contact details saved for this branch."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <OverviewField label="Branch Name" value={branch.branchName} />
          <OverviewField label="Branch Code" value={branch.branchCode} />
          <OverviewField label="Email" value={branch.email?.trim() || "—"} />
          <OverviewField label="Phone" value={branch.phone?.trim() || "—"} />

          <OverviewField
            label="Address Line 1"
            value={branch.addressLine1?.trim() || "—"}
          />
          <OverviewField
            label="Address Line 2"
            value={branch.addressLine2?.trim() || "—"}
          />
          <OverviewField label="City" value={branch.city?.trim() || "—"} />
          <OverviewField label="State" value={branch.state?.trim() || "—"} />
          <OverviewField label="Country" value={branch.country?.trim() || "—"} />
          <OverviewField
            label="Postal Code"
            value={branch.postalCode?.trim() || "—"}
          />

          {address ? (
            <div className="sm:col-span-2">
              <OverviewField label="Full Address" value={address} />
            </div>
          ) : null}

          <OverviewField
            label="Latitude"
            value={formatCoordinate(branch.latitude)}
          />
          <OverviewField
            label="Longitude"
            value={formatCoordinate(branch.longitude)}
          />

          <OverviewField
            label="Status"
            value={
              <BranchStatusBadge
                status={branch.status}
                deletedAt={branch.deletedAt}
              />
            }
          />

          <div className="sm:col-span-2">
            <OverviewField
              label="Description"
              value={branch.description?.trim() || "—"}
            />
          </div>
        </dl>
      </BranchManageSection>
    </div>
  );
}
