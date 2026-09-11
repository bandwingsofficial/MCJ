import { cn } from "@/src/shared/lib/cn";

interface SkillPillsProps {
  skills: string[];
  className?: string;
  limit?: number;
}

const pillColors = [
  "bg-blue-50 text-blue-700 border-blue-100",
  "bg-emerald-50 text-emerald-700 border-emerald-100",
  "bg-violet-50 text-violet-700 border-violet-100",
  "bg-amber-50 text-amber-700 border-amber-100",
  "bg-sky-50 text-sky-700 border-sky-100",
  "bg-rose-50 text-rose-700 border-rose-100",
];

export function SkillPills({ skills, className, limit }: SkillPillsProps) {
  const visibleSkills = limit ? skills.slice(0, limit) : skills;
  const hiddenCount = limit ? Math.max(skills.length - limit, 0) : 0;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleSkills.map((skill, index) => (
        <span
          key={`${index}-${skill}`}
          className={cn(
            "rounded border px-2.5 py-1 text-xs font-medium",
            pillColors[index % pillColors.length],
          )}
        >
          {skill}
        </span>
      ))}
      {hiddenCount > 0 ? (
        <span className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
          +{hiddenCount} more
        </span>
      ) : null}
    </div>
  );
}
