
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import { BranchCard } from "@/src/features/branches/components/branch-card";

export function HomeBranchesSection() {
  const router = useRouter();
  const { branches, isLoading, error, refetch } = useBranches();

  const visibleBranches = useMemo(() => branches.slice(0, 8), [branches]);

  if (!isLoading && !error && visibleBranches.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#F8FBFF] py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
              Our Branches
            </p>

            <h2 className="mt-2 text-3xl font-bold leading-tight text-[#0B1F3A]">
              Visit an MCJ Accounting Training Institute Near You
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              MCJ offers classroom training through its Bangalore branches.
              Explore our branch locations, course availability and batch
              information to find a convenient training centre.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push("/branches")}
            className="shrink-0 rounded-xl"
          >
            View All Branches →
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-56 rounded-2xl" />
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
