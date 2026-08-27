import { ReactNode } from "react";

interface DataTableProps {
  children: ReactNode;
}

export function DataTable({
  children,
}: DataTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white shadow-[0_2px_10px_rgba(16,42,86,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          {children}
        </table>
      </div>
    </div>
  );
}