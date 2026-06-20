"use client";

interface JobInfoItemProps {
  label: string;

  value?: React.ReactNode;
}

export function JobInfoItem({
  label,
  value,
}: JobInfoItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="text-sm font-medium break-words">
        {value ?? "-"}
      </div>
    </div>
  );
}