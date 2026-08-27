import { cn } from "@/src/shared/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({
  children,
  className,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E1EBF5] bg-white p-6 shadow-[0_2px_10px_rgba(16,42,86,0.05)]",
        className
      )}
    >
      {children}
    </div>
  );
}
