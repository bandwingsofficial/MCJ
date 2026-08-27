import { cn } from "@/src/shared/lib/cn";

interface BadgeProps {
  children: React.ReactNode;

  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default";

  className?: string;
}

const variants = {
  success:
    "bg-emerald-50 text-emerald-700",

  warning:
    "bg-amber-50 text-amber-700",

  danger:
    "bg-rose-50 text-rose-600",

  info:
    "bg-sky-50 text-sky-700",

  default:
    "bg-[#F4F9FF] text-[#647A9B]",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
