import { cn } from "@/src/shared/lib/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 p-4",
        className
      )}
    >
      {children}
    </div>
  );
}