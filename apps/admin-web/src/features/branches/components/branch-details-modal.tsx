"use client";

import type { ReactNode } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";

import type { Branch } from "@/src/features/branches/types/branch.types";

import { BranchStatusBadge } from "./branch-status-badge";

interface BranchDetailsModalProps {
  open: boolean;

  branch: Branch | null;

  isLoading?: boolean;

  onClose: () => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-[15px] font-medium text-[#102A56] break-words">
        {value || "—"}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </h3>
        <div className="mt-2 border-t border-slate-200" />
      </div>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

export function BranchDetailsModal({
  open,
  branch,
  isLoading = false,
  onClose,
}: BranchDetailsModalProps) {
  return (
    <Modal open={open} title="Branch Details" onClose={onClose}>
      {isLoading || !branch ? (
        <div className="space-y-3 py-6">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="mt-6 h-24 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Branch Name
            </p>
            <p className="mt-1 text-xl font-semibold text-[#102A56]">
              {branch.branchName}
            </p>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
              Branch Code
            </p>
            <p className="mt-1 text-base font-semibold tracking-wide text-slate-800">
              {branch.branchCode}
            </p>
          </div>

          <Section title="Basic Information">
            <DetailRow
              label="Status"
              value={
                <BranchStatusBadge
                  status={branch.status}
                  deletedAt={branch.deletedAt}
                />
              }
            />
            <DetailRow label="Email" value={branch.email} />
            <DetailRow label="Phone" value={branch.phone} />
            <DetailRow
              label="Description"
              value={branch.description}
            />
          </Section>

          <Section title="Address">
            <DetailRow
              label="Address Line 1"
              value={branch.addressLine1}
            />
            <DetailRow
              label="Address Line 2"
              value={branch.addressLine2}
            />
            <DetailRow label="City" value={branch.city} />
            <DetailRow label="State" value={branch.state} />
            <DetailRow label="Country" value={branch.country} />
            <DetailRow
              label="Postal Code"
              value={branch.postalCode}
            />
          </Section>

          <Section title="Location">
            <DetailRow
              label="Latitude"
              value={
                branch.latitude != null
                  ? String(branch.latitude)
                  : null
              }
            />
            <DetailRow
              label="Longitude"
              value={
                branch.longitude != null
                  ? String(branch.longitude)
                  : null
              }
            />
          </Section>

          <Section title="Audit Information">
            <DetailRow
              label="Created"
              value={formatDate(branch.createdAt)}
            />
            <DetailRow
              label="Updated"
              value={formatDate(branch.updatedAt)}
            />
            {branch.deletedAt ? (
              <DetailRow
                label="Archived"
                value={formatDate(branch.deletedAt)}
              />
            ) : null}
          </Section>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
