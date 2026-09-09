"use client";



import { useEffect, useMemo, useState } from "react";



import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";

import { StudentActivityModal } from "@/src/features/branch-ops/components/batches/student-activity-modal";

import {

  UnenrollStudentDialog,

  type UnenrollStudentTarget,

} from "@/src/features/branch-ops/components/batches/unenroll-student-dialog";

import type { BatchStudentItem } from "@/src/features/branch-ops/types";

import {

  formatBatchLabel,

  formatBatchStatus,

  studentName,

} from "@/src/features/branch-ops/utils/batch-display";

import { branchEnrollmentApi } from "@/src/features/enrollments/api/enrollment.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { useAuthStore } from "@/src/features/auth/store/auth.store";

import { Badge } from "@/src/shared/components/ui/badge";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { Loader } from "@/src/shared/components/ui/loader";

import { SearchInput } from "@/src/shared/components/ui/search-input";

import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";

import { appToast } from "@/src/shared/components/ui/toast";

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from "@/src/shared/components/ui/table";

import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface Props {

  batchId: string;

  onStudentsChanged?: () => void;

}



export function BatchStudentsPanel({ batchId, onStudentsChanged }: Props) {

  const role = useAuthStore((state) => state.user?.role);

  const canUnenroll = role === "BRANCH_MANAGER";



  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);

  const [unenrollTarget, setUnenrollTarget] =

    useState<UnenrollStudentTarget | null>(null);

  const [isUnenrolling, setIsUnenrolling] = useState(false);



  const { data, loading, error, reload } = useAsyncData(

    () => branchOpsApi.batchStudents(batchId),

    [batchId],

  );



  useEffect(() => {

    const refresh = () => {

      if (document.visibilityState === "hidden") return;

      void reload({ silent: true });

    };



    window.addEventListener("focus", refresh);

    document.addEventListener("visibilitychange", refresh);

    return () => {

      window.removeEventListener("focus", refresh);

      document.removeEventListener("visibilitychange", refresh);

    };

  }, [reload]);



  const filtered = useMemo(() => {

    const term = search.trim().toLowerCase();

    const items = data ?? [];

    if (!term) return items;

    return items.filter((student) => {

      const haystack = [

        student.firstName,

        student.lastName,

        student.studentCode,

        student.enrollmentStatus,

        student.batch?.name,

        student.batch?.code,

      ]

        .filter(Boolean)

        .join(" ")

        .toLowerCase();

      return haystack.includes(term);

    });

  }, [data, search]);



  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);



  const handleUnenroll = async (reason?: string) => {

    if (!unenrollTarget) {

      return;

    }



    try {

      setIsUnenrolling(true);

      const response = await branchEnrollmentApi.unenroll(

        unenrollTarget.enrollmentId,

        reason,

      );

      appToast.success(response.message);

      setUnenrollTarget(null);

      await reload();

      onStudentsChanged?.();

    } catch (err) {

      appToast.error(
        userFacingApiMessage(parseBranchOpsError(err), "Unable to unenroll student."),
      );

    } finally {

      setIsUnenrolling(false);

    }

  };



  if (loading) return <Loader />;

  if (error) return <ErrorState description={error} onRetry={reload} />;



  return (

    <div className="space-y-4">

      <SearchInput

        value={search}

        placeholder="Search enrolled students..."

        className="h-[46px] rounded-xl sm:max-w-sm"

        onChange={(value) => {

          setSearch(value);

          setPage(1);

        }}

      />



      <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">

        {!filtered.length ? (

          <EmptyState title="No students are enrolled in this batch." />

        ) : (

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>Student code</TableHead>

                <TableHead>Student name</TableHead>

                <TableHead>Batch</TableHead>

                <TableHead>Status</TableHead>

                <TableHead>Actions</TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {paged.map((student: BatchStudentItem) => (

                <TableRow key={student.enrollmentId ?? student.id}>

                  <TableCell className="font-mono text-sm text-slate-700">

                    {student.studentCode}

                  </TableCell>

                  <TableCell className="font-medium text-[#102A56]">

                    {studentName(student)}

                  </TableCell>

                  <TableCell>

                    {formatBatchLabel(student.batch?.name, student.batch?.code)}

                  </TableCell>

                  <TableCell>

                    <Badge variant="info">

                      {formatBatchStatus(student.enrollmentStatus)}

                    </Badge>

                  </TableCell>

                  <TableCell>

                    <div className="flex flex-wrap items-center gap-3">

                      <button

                        type="button"

                        className="text-sm font-medium text-[#2563EB] hover:underline"

                        onClick={() => setActiveStudentId(student.id)}

                      >

                        Activity

                      </button>

                      {canUnenroll && student.enrollmentId ? (

                        <button

                          type="button"

                          className="text-sm font-medium text-rose-600 hover:underline"

                          onClick={() =>

                            setUnenrollTarget({

                              enrollmentId: student.enrollmentId,

                              studentName: studentName(student),

                              branchName:

                                student.branch?.branchName ?? undefined,

                              batchName: student.batch?.name ?? undefined,

                              courseTitle: student.course?.title ?? undefined,

                            })

                          }

                        >

                          Unenroll

                        </button>

                      ) : null}

                    </div>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        )}



        <TablePaginationBar

          page={page}

          pageSize={pageSize}

          total={filtered.length}

          onPageChange={setPage}

          onPageSizeChange={(size) => {

            setPageSize(size);

            setPage(1);

          }}

        />

      </div>



      <StudentActivityModal

        open={Boolean(activeStudentId)}

        batchId={batchId}

        studentId={activeStudentId ?? ""}

        onClose={() => setActiveStudentId(null)}

      />



      <UnenrollStudentDialog

        open={Boolean(unenrollTarget)}

        target={unenrollTarget}

        loading={isUnenrolling}

        onClose={() => setUnenrollTarget(null)}

        onConfirm={(reason) => {

          void handleUnenroll(reason);

        }}

      />

    </div>

  );

}

