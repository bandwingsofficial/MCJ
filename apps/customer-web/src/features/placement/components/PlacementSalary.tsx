"use client";

import { formatSalary } from "@/src/features/placement/utils/format-salary";

interface PlacementSalaryProps {
  salary: number;
}

export function PlacementSalary({
  salary,
}: PlacementSalaryProps) {
  return (
    <span className="font-semibold text-green-600">
      {formatSalary(salary)}
    </span>
  );
}