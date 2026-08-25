"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { EnrollmentManageHeader } from "@/src/features/enrollments/components/manage/enrollment-manage-header";
import { EnrollmentManageWorkspace } from "@/src/features/enrollments/components/manage/enrollment-manage-workspace";
import { useEnrollment } from "@/src/features/enrollments/hooks/useEnrollment";
import {
  ENROLLMENT_MANAGE_DEFAULT_TAB,
  enrollmentManageTabPath,
  type EnrollmentManageTabKey,
} from "@/src/features/enrollments/utils/enrollment-manage.routes";

interface Props {
  enrollmentId: string;
  initialTab?: EnrollmentManageTabKey;
}

const TAB_LABELS: Record<EnrollmentManageTabKey, string> = {
  overview: "Overview",
  student: "Student",
  course: "Course",
  batch: "Batch",
  payments: "Payments",
  attendance: "Attendance",
  progress: "Progress",
};

export function EnrollmentManagePage({ enrollmentId, initialTab }: Props) {
  const router = useRouter();
  const { enrollment, isLoading, error, refetch } = useEnrollment(enrollmentId);
  const [activeTab, setActiveTab] = useState<EnrollmentManageTabKey>(
    initialTab ?? ENROLLMENT_MANAGE_DEFAULT_TAB,
  );

  useEffect(() => {
    setActiveTab(initialTab ?? ENROLLMENT_MANAGE_DEFAULT_TAB);
  }, [initialTab]);

  const handleTabChange = useCallback(
    (tab: EnrollmentManageTabKey) => {
      setActiveTab(tab);
      router.replace(enrollmentManageTabPath(enrollmentId, tab));
    },
    [enrollmentId, router],
  );

  const activeSection = useMemo(() => TAB_LABELS[activeTab], [activeTab]);

  if (isLoading) {
    return <Loader />;
  }

  if (error || !enrollment) {
    return (
      <ErrorState
        title="Enrollment Not Found"
        description={error ?? "Unable to load this enrollment."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="-m-6 min-h-full space-y-4 bg-white p-6">
      <EnrollmentManageHeader
        enrollment={enrollment}
        activeSection={activeSection}
      />
      <EnrollmentManageWorkspace
        enrollment={enrollment}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onEnrollmentRefresh={refetch}
      />
    </div>
  );
}
