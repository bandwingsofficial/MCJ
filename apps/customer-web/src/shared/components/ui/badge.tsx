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
    "bg-green-100 text-green-700",

  warning:
    "bg-yellow-100 text-yellow-700",

  danger:
    "bg-red-100 text-red-700",

  info:
    "bg-blue-100 text-blue-700",

  default:
    "bg-slate-100 text-slate-700",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}