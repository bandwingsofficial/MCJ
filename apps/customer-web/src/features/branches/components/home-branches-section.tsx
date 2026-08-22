"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import { BranchCard } from "@/src/features/branches/components/branch-card";

export function HomeBranchesSection() {
  const router = useRouter();
  const { branches, isLoading, error, refetch } = useBranches();
  const visibleBranches = branches.slice(0, 3);

  if (!isLoading && !error && visibleBranches.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-slate-50/60 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Available Branches
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Learn at a location convenient for you.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/branches")}>
            View All
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : null}

        {error ? (
          <ErrorState
            title="Unable to load branches"
            description="Please try again later."
            onRetry={refetch}
          />
        ) : null}

        {!isLoading && !error ? (
          <div className="grid gap-6 md:grid-cols-3">
            {visibleBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
