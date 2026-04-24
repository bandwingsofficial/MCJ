import { cn } from "@/src/shared/lib/cn";

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function TableHeader({ children }: any) {
  return <thead className="bg-gray-50">{children}</thead>;
}

export function TableRow({ children }: any) {
  return (
    <tr className="border-b hover:bg-gray-50 transition">{children}</tr>
  );
}

export function TableHead({ children }: any) {
  return <th className="text-left p-3 text-gray-500">{children}</th>;
}

export function TableCell({ children }: any) {
  return <td className="p-3">{children}</td>;
}