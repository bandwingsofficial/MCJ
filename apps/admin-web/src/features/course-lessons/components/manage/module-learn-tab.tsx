"use client";

import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { CourseLearnItemForm } from "@/src/features/course-learn-items/components";
import {
  useCreateCourseLearnItem,
  useDeleteCourseLearnItem,
  useMoveCourseLearnItem,
  useUpdateCourseLearnItem,
} from "@/src/features/course-learn-items/hooks";
import type { CourseLearnItem } from "@/src/features/course-learn-items/types";
import { ModuleContentActions } from "@/src/features/course-modules/components/manage/module-content-actions";
import {
  ModuleContentPagination,
  paginateRows,
} from "@/src/features/course-modules/components/manage/module-content-pagination";
import { ModuleContentSection } from "@/src/features/course-modules/components/manage/module-content-section";
import { ModuleContentTable } from "@/src/features/course-modules/components/manage/module-content-table";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { reorderByDrag } from "@/src/shared/utils/reorder-drag.utils";

function truncateText(value: string | null | undefined, max = 160): string {
  if (!value?.trim()) {
    return "—";
  }

  const normalized = value.trim();
  return normalized.length > max
    ? `${normalized.slice(0, max).trim()}…`
    : normalized;
}

function LearnItemPreview({ item }: { item: CourseLearnItem }) {
  return (
    <div className="space-y-3 py-1">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563EB]">
          Question / Title
        </p>
        <p className="mt-1 font-medium text-[#102A56]">{item.title}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Answer / Explanation
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
          {truncateText(item.explanation, 280)}
        </p>
      </div>

      {item.imageUrl ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Image
          </p>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="mt-2 max-h-32 rounded-lg border border-slate-200 object-cover"
          />
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
            Key Learning Points
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {truncateText(item.keyLearningPoints, 120)}
          </p>
        </div>
        <div className="rounded-lg border border-violet-100 bg-violet-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
            Final Thoughts
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {truncateText(item.finalThoughts, 120)}
          </p>
        </div>
        <div className="rounded-lg border border-sky-100 bg-sky-50/60 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
            Summary
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {truncateText(item.summary, 120)}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ModuleLearnTabProps {
  lessonId: string;
  items: CourseLearnItem[];
  onRefresh: () => Promise<void>;
}

export function ModuleLearnTab({
  lessonId,
  items,
  onRefresh,
}: ModuleLearnTabProps) {
  const { createCourseLearnItem, isLoading: isCreating } =
    useCreateCourseLearnItem();
  const { updateCourseLearnItem, isLoading: isUpdating } =
    useUpdateCourseLearnItem();
  const { deleteCourseLearnItem, isLoading: isDeleting } =
    useDeleteCourseLearnItem();
  const { moveCourseLearnItem } = useMoveCourseLearnItem();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selected, setSelected] = useState<CourseLearnItem | null>(null);

  const sourceRows = useMemo(
    () =>
      items
        .slice()
        .sort((left, right) => left.displayOrder - right.displayOrder),
    [items],
  );

  const filteredRows = useMemo(() => {
    if (!search.trim()) {
      return sourceRows;
    }

    const query = search.toLowerCase();
    return sourceRows.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.explanation.toLowerCase().includes(query) ||
        item.keyLearningPoints?.toLowerCase().includes(query) ||
        item.finalThoughts?.toLowerCase().includes(query) ||
        item.summary?.toLowerCase().includes(query),
    );
  }, [sourceRows, search]);

  const pagedRows = paginateRows(filteredRows, page, pageSize);
  const orderOffset = (page - 1) * pageSize;

  return (
    <>
      <ModuleContentSection
        title="Learn"
        search={search}
        searchPlaceholder="Search learn items..."
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        status="ALL"
        onStatusChange={() => undefined}
        showStatusFilter={false}
        actionLabel="Add Learn"
        onAction={() => {
          setSelected(null);
          setFormOpen(true);
        }}
      >
        <ModuleContentTable<CourseLearnItem>
          variant="management"
          rows={pagedRows}
          sourceCount={sourceRows.length}
          orderOffset={orderOffset}
          reorderDisabled={Boolean(search.trim())}
          resolveReorderPosition={(dragId, targetId) => {
            const result = reorderByDrag(sourceRows, dragId, targetId);
            return result?.newPosition ?? null;
          }}
          onReorder={async ({ rowId, newPosition }) => {
            await moveCourseLearnItem(rowId, { newPosition });
            await onRefresh();
            appToast.success("Learn item order updated successfully");
          }}
          columns={[
            {
              key: "content",
              header: "Learn Item",
              render: (row) => <LearnItemPreview item={row} />,
            },
          ]}
          emptyTitle="No Learn Items Found"
          emptyDescription="Add structured learning content for this lesson."
          emptySearchDescription="Create your first learn item or adjust your search."
          renderActions={(row) => (
            <ModuleContentActions
              isArchived={false}
              onEdit={() => {
                setSelected(row);
                setFormOpen(true);
              }}
              onDelete={() => {
                setSelected(row);
                setDeleteOpen(true);
              }}
            />
          )}
        />

        <ModuleContentPagination
          page={page}
          pageSize={pageSize}
          total={filteredRows.length}
          onPageChange={setPage}
          onPageSizeChange={(value) => {
            setPageSize(value);
            setPage(1);
          }}
        />
      </ModuleContentSection>

      <CourseLearnItemForm
        open={formOpen}
        loading={isCreating || isUpdating}
        lessonId={lessonId}
        item={selected ?? undefined}
        onClose={() => {
          setFormOpen(false);
          setSelected(null);
        }}
        onSubmit={async (values, imageFile, removeImage) => {
          try {
            const optionalPayload = {
              keyLearningPoints:
                values.keyLearningPoints.length > 0
                  ? values.keyLearningPoints
                  : null,
              finalThoughts: values.finalThoughts.trim() || null,
              summary: values.summary.trim() || null,
            };

            if (selected) {
              await updateCourseLearnItem(
                selected.id,
                {
                  title: values.title,
                  explanation: values.explanation,
                  ...optionalPayload,
                },
                imageFile,
                removeImage,
              );
              appToast.success("Learn item updated successfully");
            } else {
              await createCourseLearnItem(
                {
                  lessonId,
                  title: values.title,
                  explanation: values.explanation,
                  ...optionalPayload,
                },
                imageFile,
              );
              appToast.success("Learn item created successfully");
            }

            setFormOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Learn Item"
        description="This will permanently delete this learn item. This action cannot be undone."
        confirmLabel="Delete"
        loading={isDeleting}
        onCancel={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={async () => {
          if (!selected) {
            return;
          }

          try {
            await deleteCourseLearnItem(selected.id);
            appToast.success("Learn item deleted successfully");
            setDeleteOpen(false);
            setSelected(null);
            await onRefresh();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />
    </>
  );
}
