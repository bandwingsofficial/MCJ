import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
    </div>
  );
}