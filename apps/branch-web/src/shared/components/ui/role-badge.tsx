import { cn } from "@/src/shared/lib/cn";
import { formatRoleLabel } from "@/src/core/auth/roles";

const variants: Record<string, string> = {
  BRANCH_MANAGER: "bg-indigo-100 text-indigo-700",
  FACULTY: "bg-sky-100 text-sky-700",
  INTERVIEWER: "bg-amber-100 text-amber-800",
  STAFF: "bg-slate-100 text-slate-700",
};

export function RoleBadge({ role }: { role?: string | null }) {
  if (!role) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
        variants[role] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {formatRoleLabel(role)}
    </span>
  );
}
