import { ReactNode } from "react";

interface DataTableProps {
  children: ReactNode;
}

export function DataTable({
  children,
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          {children}
        </table>
      </div>
    </div>
  );
}