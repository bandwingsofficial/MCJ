import { Loader } from "@/src/shared/components/ui/loader";

export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader />
    </div>
  );
}
