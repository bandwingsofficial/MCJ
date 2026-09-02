export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-11 rounded-2xl border border-[#E8EEF5] bg-white" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[72px] rounded-2xl border border-[#E8EEF5] bg-white"
          />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-[220px] rounded-2xl border border-[#E8EEF5] bg-white" />
        <div className="h-[220px] rounded-2xl border border-[#E8EEF5] bg-white" />
      </div>
      <div className="h-[180px] rounded-2xl border border-[#E8EEF5] bg-white" />
      <div className="h-[240px] rounded-2xl border border-[#E8EEF5] bg-white" />
      <div className="h-[160px] rounded-2xl border border-[#E8EEF5] bg-white" />
      <div className="h-[140px] rounded-2xl border border-[#E8EEF5] bg-white" />
    </div>
  );
}
