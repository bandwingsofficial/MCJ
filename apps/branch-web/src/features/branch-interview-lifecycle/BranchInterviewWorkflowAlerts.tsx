"use client";

import type { BranchInterviewWorkflowAlert } from "@mcj/shared-constants";

interface Props {
  alerts?: BranchInterviewWorkflowAlert[];
}

export function BranchInterviewWorkflowAlerts({ alerts = [] }: Props) {
  if (!alerts.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <p
          key={alert.key}
          className={
            alert.severity === "warning"
              ? "rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-900"
              : "rounded-lg border border-[#DCE8F5] bg-[#F8FBFF] px-3 py-2 text-sm text-[#102A56]"
          }
        >
          {alert.message}
        </p>
      ))}
    </div>
  );
}
