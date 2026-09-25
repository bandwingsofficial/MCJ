"use client";

import { useMemo, useState } from "react";

import type { DashboardDatePreset } from "@/src/features/dashboard/types/branch-dashboard.types";
import { resolveDashboardDateRange } from "@/src/features/dashboard/utils/dashboard-date.utils";

export function useDashboardFilters(initialPreset: DashboardDatePreset = "THIS_MONTH") {
  const [preset, setPreset] = useState<DashboardDatePreset>(initialPreset);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const query = useMemo(() => {
    const range = resolveDashboardDateRange(preset, customFrom, customTo);
    return {
      preset,
      from: range.from,
      to: range.to,
    };
  }, [preset, customFrom, customTo]);

  return {
    preset,
    setPreset,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    query,
  };
}
