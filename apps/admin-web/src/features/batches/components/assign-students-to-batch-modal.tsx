"use client";

import { useEffect, useMemo, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { studentService } from "@/src/features/students/services/student.service";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import {
  getBatchDefaultDiscount,
  getBatchPricing,
} from "@/src/features/batches/utils/batch-pricing.util";
import type { BatchListItem } from "@/src/features/batches/types/batch.types";

type StudentOption = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  batch: BatchListItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

export function AssignStudentsToBatchModal({
  open,
  batch,
  onClose,
  onSuccess,
}: Props) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialIds, setInitialIds] = useState<string[]>([]);
  const [enrollmentByStudent, setEnrollmentByStudent] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !batch) {
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setSearch("");
      try {
        const [studentResponse, enrollmentResponse] = await Promise.all([
          studentService.getStudents({
            includeDeleted: false,
            onlyActive: true,
            page: 1,
            pageSize: 100,
          }),
          enrollmentService.getEnrollments({
            batchId: batch.id,
            currentOnly: true,
            skip: 0,
            take: 100,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const studentItems = parseStudentListResponse(
          studentResponse.data,
        ).items;
        const enrollmentItems =
          parseEnrollmentListResponse(enrollmentResponse).items;

        const map: Record<string, string> = {};
        const assignedIds: string[] = [];
        for (const enrollment of enrollmentItems) {
          const studentId = enrollment.student?.id;
          if (!studentId) continue;
          map[studentId] = enrollment.id;
          assignedIds.push(studentId);
        }

        setStudents(
          studentItems.map((student) => ({
            id: student.id,
            name:
              [student.firstName, student.lastName]
                .filter(Boolean)
                .join(" ")
                .trim() ||
              student.studentCode ||
              "Student",
          })),
        );
        setEnrollmentByStudent(map);
        setInitialIds(assignedIds);
        setSelectedIds(assignedIds);
      } catch (error) {
        appToast.error(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, batch]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((student) =>
      student.name.toLowerCase().includes(q),
    );
  }, [students, search]);

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!batch) return;

    const pricing = getBatchPricing(batch);
    const feeAmount = pricing.isFree ? 0 : pricing.originalPrice;
    const discountAmount = pricing.isFree
      ? 0
      : getBatchDefaultDiscount(batch);

    const toAdd = selectedIds.filter((id) => !initialIds.includes(id));
    const toRemove = initialIds.filter((id) => !selectedIds.includes(id));

    setSaving(true);
    try {
      for (const studentId of toAdd) {
        await enrollmentService.createEnrollment({
          studentId,
          batchId: batch.id,
          feeAmount,
          discountAmount,
        });
      }

      for (const studentId of toRemove) {
        const enrollmentId = enrollmentByStudent[studentId];
        if (!enrollmentId) continue;
        await enrollmentService.unenrollEnrollment(
          enrollmentId,
          "Removed from batch assignment",
        );
      }

      appToast.success("Students updated for this batch");
      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Assign Students"
      onClose={onClose}
      contentClassName="!max-w-lg"
    >
      {batch ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
            <p>
              <span className="text-slate-500">Batch:</span>{" "}
              <span className="font-semibold text-[#102A56]">{batch.name}</span>
            </p>
            <p className="mt-1">
              <span className="text-slate-500">Course:</span>{" "}
              <span className="font-medium text-[#102A56]">
                {batch.course?.title ?? "—"}
              </span>
            </p>
          </div>

          <Input
            placeholder="Search students"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-2">
            {loading ? (
              <p className="px-2 py-6 text-center text-sm text-slate-500">
                Loading students...
              </p>
            ) : filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-500">
                No students found.
              </p>
            ) : (
              filtered.map((student) => {
                const checked = selectedIds.includes(student.id);
                return (
                  <label
                    key={student.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${
                      checked ? "bg-[#F4F9FF]" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300"
                      checked={checked}
                      onChange={() => toggle(student.id)}
                    />
                    <span className="text-sm font-medium text-[#102A56]">
                      {student.name}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={saving}
              disabled={saving || loading}
              onClick={() => {
                void handleSave();
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
