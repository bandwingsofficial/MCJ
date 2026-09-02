export const DASHBOARD_LIST_LIMIT = 5;

export const DASHBOARD_ROUTES = {
  attendance: "/attendance",
  assessments: "/assessments",
  batches: "/batches",
  enrollments: "/enrollments",
  batch: (id: string) => `/batches/${id}`,
  student: (id: string) => `/students/${id}`,
} as const;

/** Shared dashboard design tokens (MCJ Institute) */
export const DASHBOARD_COLORS = {
  primary: "#2563EB",
  navy: "#102A56",
  muted: "#647A9B",
  subtle: "#94A3B8",
  border: "#E8EEF5",
  surface: "#F8FBFF",
  present: "#16A34A",
  absent: "#DC2626",
  late: "#D97706",
  pending: "#EA580C",
} as const;

export const FILTER_TRIGGER =
  "h-9 rounded-lg border-[#DCE8F5] bg-white text-sm shadow-none";

export const DASHBOARD_CARD =
  "rounded-2xl border border-[#E8EEF5] bg-white shadow-sm";
