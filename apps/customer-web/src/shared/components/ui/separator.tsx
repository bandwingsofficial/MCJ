interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
}

export function Separator({
  orientation = "horizontal",
}: SeparatorProps) {
  if (orientation === "vertical") {
    return (
      <div className="h-full w-px bg-slate-200" />
    );
  }

  return (
    <div className="h-px w-full bg-slate-200" />
  );
}