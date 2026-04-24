import { cn } from "@/src/shared/lib/cn";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "default";
  children: React.ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs rounded-full font-medium",
        variant === "success" && "bg-green-100 text-green-700",
        variant === "warning" && "bg-yellow-100 text-yellow-700",
        variant === "danger" && "bg-red-100 text-red-700",
        variant === "default" && "bg-gray-100 text-gray-700"
      )}
    >
      {children}
    </span>
  );
}