"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useCourseFaqs } from "@/src/features/courses/hooks/use-course-faqs";
import { courseFaqService } from "@/src/features/courses/services/course-faq.service";
import type { CourseFaqFormValues } from "@/src/features/courses/schemas/course-faq.schema";
import type { CourseFaq } from "@/src/features/courses/types/course-faq.types";

import { CourseFaqFormModal } from "./course-faq-form-modal";

interface Props {
  courseId: string;
  disabled?: boolean;
}

export function CourseManageFaqPanel({ courseId, disabled = false }: Props) {
  const { faqs, isLoading, error, refetch, setFaqs } = useCourseFaqs(courseId);

  const [rows, setRows] = useState<CourseFaq[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const reorderInFlightRef = useRef(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CourseFaq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CourseFaq | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setRows(faqs);
  }, [faqs]);

  const actionsDisabled = disabled || isReordering || isSubmitting || isDeleting;

  const handleDrop = async (targetId: string) => {
    if (
      !dragId ||
      dragId === targetId ||
      actionsDisabled ||
      reorderInFlightRef.current
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const sourceIndex = rows.findIndex((item) => item.id === dragId);
    const targetIndex = rows.findIndex((item) => item.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previousRows = rows;
    const nextRows = [...rows];
    const [moved] = nextRows.splice(sourceIndex, 1);
    nextRows.splice(targetIndex, 0, moved);
    setRows(nextRows);
    setDragId(null);
    setDropTargetId(null);

    reorderInFlightRef.current = true;
    setIsReordering(true);

    try {
      const response = await courseFaqService.reorder(courseId, {
        orderedIds: nextRows.map((item) => item.id),
      });
      setFaqs(response.data);
      appToast.success("FAQ order updated");
    } catch (err) {
      setRows(previousRows);
      appToast.error(getErrorMessage(err));
    } finally {
      reorderInFlightRef.current = false;
      setIsReordering(false);
    }
  };

  const handleCreateOrUpdate = async (values: CourseFaqFormValues) => {
    try {
      setIsSubmitting(true);

      if (editTarget) {
        await courseFaqService.update(courseId, editTarget.id, values);
        appToast.success("FAQ updated successfully");
      } else {
        await courseFaqService.create(courseId, values);
        appToast.success("FAQ created successfully");
      }

      setFormOpen(false);
      setEditTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);
      await courseFaqService.permanentDelete(courseId, deleteTarget.id);
      appToast.success("FAQ permanently deleted");
      setDeleteTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">FAQ</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Manage frequently asked questions for this course.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={actionsDisabled}
            className="shrink-0"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create FAQ
          </Button>
        </div>

        {error ? (
          <div className="p-4">
            <ErrorState
              title="Failed to load FAQs"
              description={error}
              onRetry={() => {
                void refetch();
              }}
            />
          </div>
        ) : isLoading ? (
          <SkeletonTable rows={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
                <tr>
                  <th className="w-10 px-2 py-3">
                    <span className="sr-only">Reorder</span>
                  </th>
                  {["Question", "Answer", "Actions"].map((label) => (
                    <th
                      key={label}
                      className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                        label === "Actions" ? "text-right" : ""
                      }`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No FAQs found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Create your first FAQ for this course.
                      </p>
                      {!disabled ? (
                        <Button
                          type="button"
                          size="sm"
                          className="mt-4"
                          onClick={() => {
                            setEditTarget(null);
                            setFormOpen(true);
                          }}
                        >
                          <Plus className="mr-1.5 h-4 w-4" />
                          Create FAQ
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                ) : (
                  rows.map((faq) => {
                    const draggable = !actionsDisabled;

                    return (
                      <tr
                        key={faq.id}
                        draggable={draggable}
                        onDragStart={() => {
                          if (draggable) {
                            setDragId(faq.id);
                          }
                        }}
                        onDragOver={(event) => {
                          if (draggable && dragId && dragId !== faq.id) {
                            event.preventDefault();
                            setDropTargetId(faq.id);
                          }
                        }}
                        onDrop={() => {
                          void handleDrop(faq.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDropTargetId(null);
                        }}
                        className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                          dragId === faq.id ? "opacity-60" : ""
                        } ${dropTargetId === faq.id ? "bg-slate-50" : ""}`}
                      >
                        <td className="w-10 px-2 py-3 align-top">
                          {draggable ? (
                            <GripVertical className="h-4 w-4 cursor-grab text-slate-400 active:cursor-grabbing" />
                          ) : (
                            <span className="inline-block h-4 w-4" />
                          )}
                        </td>
                        <td className="max-w-xs px-3 py-3 align-top">
                          <p className="text-sm font-medium text-slate-900">
                            {faq.question}
                          </p>
                        </td>
                        <td className="max-w-xl px-3 py-3 align-top">
                          <p className="line-clamp-3 text-sm text-slate-700">
                            {faq.answer}
                          </p>
                        </td>
                        <td className="px-2 py-3 align-top">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={actionsDisabled}
                              aria-label="Edit FAQ"
                              className="h-9 w-9 rounded-lg p-0 text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]"
                              onClick={() => {
                                setEditTarget(faq);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="h-[1.25rem] w-[1.25rem]" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={actionsDisabled}
                              aria-label="Permanently delete FAQ"
                              className="h-9 w-9 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteTarget(faq)}
                            >
                              <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CourseFaqFormModal
        open={formOpen}
        faq={editTarget}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setFormOpen(false);
            setEditTarget(null);
          }
        }}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Permanently delete FAQ?"
        description="This action cannot be undone. The FAQ will be permanently removed from this course."
        confirmLabel="Permanently Delete"
        confirmVariant="danger"
        loading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </>
  );
}
