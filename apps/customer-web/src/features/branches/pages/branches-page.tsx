"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import { BranchCard } from "@/src/features/branches/components/branch-card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function BranchesPage() {
  const router = useRouter();
  const { branches, isLoading, error, refetch } = useBranches();

  return (
    <main className="w-full bg-slate-50/40 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Our Branches
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Find courses available at a branch near you.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : null}

        {error ? (
          <ErrorState
            title="Unable to load branches"
            description="Please try again."
            onRetry={refetch}
          />
        ) : null}

        {!isLoading && !error && branches.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No branches available
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Check back later for branch locations.
            </p>
          </div>
        ) : null}

        {!isLoading && !error && branches.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {branches.map((branch) => (
                <BranchCard key={branch.id} branch={branch} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button onClick={() => router.push("/courses")}>
                Browse All Courses
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
