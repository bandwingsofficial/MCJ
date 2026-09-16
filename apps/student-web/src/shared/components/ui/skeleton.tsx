import { cn } from "@/src/shared/lib/cn";

interface Props {
  className?: string;
}

export function Skeleton({
  className,
}: Props) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200",
        className
      )}
    />
  );
}