import { Loader2 } from "lucide-react";

export function AuthLoadingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#FBFDFF]">
      <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      <p className="mt-4 text-sm font-medium text-[#647A9B]">
        Loading authentication...
      </p>
    </div>
  );
}
