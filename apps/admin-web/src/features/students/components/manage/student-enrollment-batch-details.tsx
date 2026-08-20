"use client";

import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

export interface StudentEnrollmentBatchDetailsData {
  courseTitle: string;
  courseFee?: string;
  branchName: string;
  categoryName: string;
  trainerNames: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface Props {
  details: StudentEnrollmentBatchDetailsData;
  isLoading?: boolean;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-1 sm:grid-cols-[140px_1fr]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export function StudentEnrollmentBatchDetails({
  details,
  isLoading = false,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-900">Batch Details</h3>
      <div className="mt-3 space-y-2">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading batch details...</p>
        ) : (
          <>
            <DetailRow label="Course" value={details.courseTitle} />
            {details.courseFee ? (
              <DetailRow label="Course Fee" value={details.courseFee} />
            ) : null}
            <DetailRow label="Branch" value={details.branchName} />
            <DetailRow label="Category" value={details.categoryName} />
            <DetailRow label="Trainer(s)" value={details.trainerNames} />
            <DetailRow
              label="Start Date"
              value={formatStudentDate(details.startDate)}
            />
            <DetailRow
              label="End Date"
              value={formatStudentDate(details.endDate)}
            />
          </>
        )}
      </div>
    </div>
  );
}
