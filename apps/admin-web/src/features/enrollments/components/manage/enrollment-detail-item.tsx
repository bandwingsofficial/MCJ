"use client";

export function EnrollmentDetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}
