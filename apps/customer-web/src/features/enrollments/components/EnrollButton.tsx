"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";

import { EnrollmentDialog } from "@/src/features/enrollments/components/EnrollmentDialog";
import { useCourseBatches } from "@/src/features/batches/hooks/useCourseBatches";

interface EnrollButtonProps {
  courseSlug: string;
  isAuthenticated: boolean;
}

export function EnrollButton({
  courseSlug,
  isAuthenticated,
}: EnrollButtonProps) {
  const router = useRouter();

  const [open, setOpen] =
    useState(false);

  const {
    batches,
    isLoading,
    error,
    refetch,
  } =
    useCourseBatches(
      courseSlug,
    );

  const handleClick =
    useCallback(() => {
      if (
        !isAuthenticated
      ) {
        router.push(
          `/login?redirect=/courses/${courseSlug}`,
        );

        return;
      }

      setOpen(true);
    }, [
      courseSlug,
      isAuthenticated,
      router,
    ]);

  const handleClose =
    useCallback(() => {
      setOpen(false);
    }, []);

  const handleSuccess =
    useCallback(() => {
      router.push(
        "/student/enrollments",
      );
    }, [router]);

  return (
    <>

      <Button
        className="w-full"
        onClick={
          handleClick
        }
      >
        Enroll Now
      </Button>

      <EnrollmentDialog
        open={open}
        batches={batches}
        isLoading={
          isLoading
        }
        batchError={
          error
        }
        onRetry={
          refetch
        }
        onClose={
          handleClose
        }
        onSuccess={
          handleSuccess
        }
      />

    </>
  );
}